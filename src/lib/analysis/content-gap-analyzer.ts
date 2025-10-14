import Anthropic from '@anthropic-ai/sdk';
import { SitemapUrl, ContentGap, ContentGapAnalysis } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Analyze sitemap URLs for content gaps using Claude AI
 * @param urls - Array of sitemap URLs
 * @param domain - The domain being analyzed
 * @returns Content gap analysis with recommendations
 */
export async function analyzeContentGaps(
  urls: SitemapUrl[],
  domain: string
): Promise<ContentGapAnalysis> {
  try {
    console.log(`[Content Gap Analyzer] Analyzing ${urls.length} URLs for ${domain}`);

    // Sample URLs if there are too many (limit to first 500 for Claude)
    const sampleUrls = urls.slice(0, 500).map((url) => url.loc);
    const totalUrls = urls.length;

    const prompt = `You are analyzing a website's sitemap to identify content gaps and missing pages.

Domain: ${domain}
Total URLs in sitemap: ${totalUrls}

Sample URLs from sitemap:
${sampleUrls.slice(0, 50).join('\n')}
${totalUrls > 50 ? `\n... and ${totalUrls - 50} more URLs` : ''}

Please analyze this sitemap and identify:

1. Missing Essential Pages:
   - About Us / Company Info
   - Contact Information
   - Privacy Policy / Terms of Service
   - FAQ or Help Center
   - Blog or News section (if appropriate)
   - Products/Services pages (if e-commerce)
   - Careers/Jobs (if company site)

2. Content Gaps:
   - Missing topic areas based on the domain's industry
   - Incomplete category coverage
   - Missing landing pages for key services
   - Lack of resource/educational content

3. SEO Opportunities:
   - Missing location-based pages (if relevant)
   - Absence of comparison/vs pages
   - No how-to guides or tutorials
   - Missing category/hub pages

For each gap identified, provide:
- Category (e.g., "Essential Pages", "Educational Content", "Product Pages")
- Description of what's missing
- Priority: high, medium, or low
- Suggested page URLs to create
- Brief reasoning why this content would be valuable

Format your response as JSON with this structure:
{
  "gaps": [
    {
      "category": "Essential Pages",
      "description": "Missing privacy policy",
      "priority": "high",
      "suggestedPages": ["/privacy-policy", "/terms-of-service"],
      "reasoning": "Legal requirement and builds trust"
    }
  ],
  "summary": "Overall assessment of the website's content coverage and main areas for improvement"
}

IMPORTANT:
- Only identify gaps that are truly missing (don't suggest pages that already exist in the sitemap)
- Prioritize high for legal/essential pages, medium for SEO opportunities, low for nice-to-haves
- Be specific and actionable in your suggestions
- Provide 3-10 gaps maximum (focus on most important ones)`;

    console.log('[Content Gap Analyzer] Sending request to Claude...');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Content Gap Analyzer] Failed to parse Claude response as JSON');
      return {
        gaps: [],
        summary: 'Unable to analyze content gaps at this time.',
        totalGaps: 0,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      gaps: ContentGap[];
      summary: string;
    };

    console.log(`[Content Gap Analyzer] Identified ${parsed.gaps.length} content gaps`);

    return {
      gaps: parsed.gaps,
      summary: parsed.summary,
      totalGaps: parsed.gaps.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Content Gap Analyzer] Error:', errorMessage);

    return {
      gaps: [],
      summary: 'Failed to analyze content gaps due to an error.',
      totalGaps: 0,
    };
  }
}
