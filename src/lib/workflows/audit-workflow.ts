import { captureAuditData, isHomepage } from '../puppeteer';
import { analyzeWithClaude } from '../claude';
import { uploadScreenshot } from '../storage';
import { AuditExecutionResult } from '@/types';
import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export async function executeAudit(
  auditId: string,
  url: string
): Promise<AuditExecutionResult> {
  try {
    console.log(`[Audit ${auditId}] Starting audit for ${url}`);

    // Step 1: Comprehensive data capture (single page load for all operations)
    console.log(`[Audit ${auditId}] Capturing audit data (screenshots, accessibility, SEO)...`);
    const { desktopScreenshot, mobileScreenshot, accessibilityData, seoData } = await captureAuditData(url);

    // Step 2: Upload screenshots
    console.log(`[Audit ${auditId}] Uploading screenshots...`);
    const desktopUrl = await uploadScreenshot(desktopScreenshot, auditId, 'desktop');
    const mobileUrl = await uploadScreenshot(mobileScreenshot, auditId, 'mobile');

    // Step 3: Analyze with Claude
    console.log(`[Audit ${auditId}] Analyzing with Claude AI...`);
    const claudeAnalysis = await analyzeWithClaude(
      desktopScreenshot,
      mobileScreenshot,
      url,
      accessibilityData,
      seoData
    );

    // Step 4: Calculate SEO score (simplified)
    const seoScore = calculateSEOScore(seoData);

    // Step 5: Check if homepage and get additional data
    const homepage = isHomepage(url);
    let homepageData = {};

    if (homepage) {
      console.log(`[Audit ${auditId}] Homepage detected, fetching SEMRush data...`);
      try {
        const { getHomepageData } = await import('../semrush');
        const domain = new URL(url).hostname;
        const semrushData = await getHomepageData(domain);

        homepageData = {
          isHomepage: true,
          totalKeywords: semrushData.totalKeywords,
          keywordTrendData: semrushData.keywordTrendData,
          topPages: semrushData.topPages,
        };

        console.log(`[Audit ${auditId}] SEMRush data fetched successfully`);
      } catch (error) {
        console.error(`[Audit ${auditId}] SEMRush data fetch failed:`, error);
        // Continue with audit even if SEMRush fails
        homepageData = {
          isHomepage: true,
          totalKeywords: 0,
          keywordTrendData: [],
          topPages: [],
        };
      }
    }

    const result: AuditExecutionResult = {
      seoScore,
      accessibilityScore: accessibilityData.score,
      designScore: claudeAnalysis.designScore * 10, // Convert 1-10 to 1-100
      claudeAnalysis: JSON.stringify({
        analysis: claudeAnalysis.analysis,
        strengths: claudeAnalysis.strengths,
        weaknesses: claudeAnalysis.weaknesses,
        recommendations: claudeAnalysis.recommendations,
      }),
      screenshotDesktop: desktopUrl,
      screenshotMobile: mobileUrl,
      metaTitle: seoData.metaTitle,
      metaDescription: seoData.metaDescription,
      h1Tags: seoData.h1Tags,
      coreWebVitals: seoData.coreWebVitals,
      isHomepage: homepage,
      ...homepageData,
    };

    // Update audit in database
    await prisma.audit.update({
      where: { id: auditId },
      data: {
        seoScore: result.seoScore,
        accessibilityScore: result.accessibilityScore,
        designScore: result.designScore,
        claudeAnalysis: result.claudeAnalysis,
        screenshotDesktop: result.screenshotDesktop,
        screenshotMobile: result.screenshotMobile,
        metaTitle: result.metaTitle,
        metaDescription: result.metaDescription,
        h1Tags: result.h1Tags,
        coreWebVitals: result.coreWebVitals as { lcp: number; fid: number; cls: number },
        isHomepage: result.isHomepage,
        totalKeywords: result.totalKeywords,
        keywordTrendData: result.keywordTrendData ? (result.keywordTrendData as unknown as Prisma.InputJsonValue) : undefined,
        topPages: result.topPages ? (result.topPages as unknown as Prisma.InputJsonValue) : undefined,
        status: 'COMPLETED',
      },
    });

    console.log(`[Audit ${auditId}] Audit completed successfully`);

    return result;
  } catch (error) {
    console.error(`[Audit ${auditId}] Error executing audit:`, error);

    // Update audit status to show error
    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'IN_PROGRESS', // Keep as in progress so they can retry
      },
    });

    throw error;
  }
}

function calculateSEOScore(seoData: {
  metaTitle?: string;
  metaDescription?: string;
  h1Tags?: string[];
}): number {
  let score = 100;

  // Meta title
  if (!seoData.metaTitle) {
    score -= 20;
  } else if (seoData.metaTitle.length < 30 || seoData.metaTitle.length > 60) {
    score -= 10;
  }

  // Meta description
  if (!seoData.metaDescription) {
    score -= 20;
  } else if (
    seoData.metaDescription.length < 120 ||
    seoData.metaDescription.length > 160
  ) {
    score -= 10;
  }

  // H1 tags
  if (!seoData.h1Tags || seoData.h1Tags.length === 0) {
    score -= 15;
  } else if (seoData.h1Tags.length > 1) {
    score -= 5;
  }

  return Math.max(0, score);
}
