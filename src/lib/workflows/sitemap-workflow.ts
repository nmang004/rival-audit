import { extractAllUrls } from '../sitemap-parser';
import { analyzeContentGaps } from '../analysis/content-gap-analyzer';
import { analyzeUrlStructure } from '../analysis/url-structure-analyzer';
import prisma from '../prisma';
import { SitemapAuditResult } from '@/types';
import { Prisma } from '@prisma/client';

/**
 * Execute a complete sitemap audit workflow
 * @param auditId - The audit ID to update
 * @param sitemapUrl - URL to the sitemap.xml file
 * @returns Sitemap audit results
 */
export async function executeSitemapAudit(
  auditId: string,
  sitemapUrl: string
): Promise<SitemapAuditResult> {
  console.log(`[Sitemap Workflow] Starting audit for: ${sitemapUrl}`);

  try {
    // Step 1: Validate sitemap URL
    if (!sitemapUrl.endsWith('.xml')) {
      throw new Error('Invalid sitemap URL. Must end with .xml');
    }

    const url = new URL(sitemapUrl);
    const domain = url.hostname;

    // Step 2: Parse sitemap and extract all URLs
    console.log('[Sitemap Workflow] Step 1/4: Parsing sitemap...');
    const urls = await extractAllUrls(sitemapUrl);

    if (urls.length === 0) {
      throw new Error('No URLs found in sitemap');
    }

    console.log(`[Sitemap Workflow] Found ${urls.length} URLs`);

    // Step 3: Analyze URL structure
    console.log('[Sitemap Workflow] Step 2/4: Analyzing URL structure...');
    const urlStructureAnalysis = await analyzeUrlStructure(urls);
    console.log(`[Sitemap Workflow] ✓ URL structure analyzed: ${urlStructureAnalysis.totalIssues} issues found`);

    // Step 4: Run content gap analysis with Claude
    console.log('[Sitemap Workflow] Step 3/4: Analyzing content gaps with Claude...');
    const contentGapAnalysis = await analyzeContentGaps(urls, domain);
    console.log(`[Sitemap Workflow] ✓ Content gaps analyzed: ${contentGapAnalysis.totalGaps} gaps found`);

    // Step 5: Store results in database
    console.log('[Sitemap Workflow] Step 4/4: Storing results...');
    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'COMPLETED',
        isSitemapAudit: true,
        sitemapUrls: {
          totalUrls: urls.length,
          crawledUrls: urls.length,
        },
        contentGaps: contentGapAnalysis.gaps as unknown as Prisma.InputJsonValue,
        urlStructureIssues: urlStructureAnalysis.issues as unknown as Prisma.InputJsonValue,
        claudeAnalysis: `Sitemap Audit Summary:\n\n${contentGapAnalysis.summary}\n\nURL Structure:\n- Average URL Depth: ${urlStructureAnalysis.depthAnalysis.averageDepth}\n- Maximum URL Depth: ${urlStructureAnalysis.depthAnalysis.maxDepth}\n- Total Issues Found: ${urlStructureAnalysis.totalIssues}\n- Content Gaps Identified: ${contentGapAnalysis.totalGaps}`,
      },
    });

    const result: SitemapAuditResult = {
      totalUrls: urls.length,
      crawledUrls: urls.length,
      contentGaps: contentGapAnalysis.gaps,
      urlStructureIssues: urlStructureAnalysis.issues,
      summary: contentGapAnalysis.summary,
    };

    console.log('[Sitemap Workflow] Audit completed successfully');
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Sitemap Workflow] Error:', errorMessage);

    // Update audit with error status
    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'COMPLETED',
        claudeAnalysis: `Sitemap audit failed: ${errorMessage}`,
      },
    });

    throw error;
  }
}
