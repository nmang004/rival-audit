import { captureWebsite, runAccessibilityTests, extractSEOData, isHomepage } from '../puppeteer';
import { analyzeWithClaude } from '../claude';
import { uploadScreenshot } from '../storage';
import { AuditExecutionResult } from '@/types';
import prisma from '../prisma';

export async function executeAudit(
  auditId: string,
  url: string
): Promise<AuditExecutionResult> {
  try {
    console.log(`[Audit ${auditId}] Starting audit for ${url}`);

    // Step 1: Capture screenshots
    console.log(`[Audit ${auditId}] Capturing screenshots...`);
    const { desktopScreenshot, mobileScreenshot } = await captureWebsite(url);

    // Step 2: Run accessibility tests
    console.log(`[Audit ${auditId}] Running accessibility tests...`);
    const accessibilityData = await runAccessibilityTests(url);

    // Step 3: Extract SEO data
    console.log(`[Audit ${auditId}] Extracting SEO data...`);
    const seoData = await extractSEOData(url);

    // Step 4: Upload screenshots
    console.log(`[Audit ${auditId}] Uploading screenshots...`);
    const desktopUrl = await uploadScreenshot(desktopScreenshot, auditId, 'desktop');
    const mobileUrl = await uploadScreenshot(mobileScreenshot, auditId, 'mobile');

    // Step 5: Analyze with Claude
    console.log(`[Audit ${auditId}] Analyzing with Claude AI...`);
    const claudeAnalysis = await analyzeWithClaude(
      desktopScreenshot,
      mobileScreenshot,
      url,
      accessibilityData,
      seoData
    );

    // Step 6: Calculate SEO score (simplified)
    const seoScore = calculateSEOScore(seoData);

    // Step 7: Check if homepage and get additional data
    const homepage = isHomepage(url);
    let homepageData = {};

    if (homepage) {
      console.log(`[Audit ${auditId}] Homepage detected, fetching SEMRush data...`);
      // TODO: Implement SEMRush integration
      // For now, set placeholder data
      homepageData = {
        isHomepage: true,
        totalKeywords: 0,
        keywordTrendData: [],
        topPages: [],
      };
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
