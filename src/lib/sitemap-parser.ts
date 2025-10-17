import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { SitemapUrl, ParsedSitemap } from '@/types';

const TIMEOUT = 30000; // 30 seconds

/**
 * Parse a sitemap.xml file from a URL
 * @param sitemapUrl - URL to the sitemap.xml file
 * @returns Parsed sitemap with URLs and metadata
 */
export async function parseSitemap(sitemapUrl: string): Promise<ParsedSitemap> {
  const errors: string[] = [];
  const urls: SitemapUrl[] = [];

  try {
    console.log(`[Sitemap Parser] Fetching sitemap from: ${sitemapUrl}`);

    // Fetch the sitemap XML
    const response = await axios.get(sitemapUrl, {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Audit-Bot/1.0)',
      },
    });

    const xmlContent = response.data;

    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
    });

    const parsed = parser.parse(xmlContent);

    // Check if this is a sitemap index or regular sitemap
    if (parsed.sitemapindex) {
      errors.push('This appears to be a sitemap index. Please use extractAllUrls() to handle nested sitemaps.');
      return { urls: [], totalUrls: 0, errors };
    }

    // Extract URLs from urlset
    if (parsed.urlset && parsed.urlset.url) {
      const urlEntries = Array.isArray(parsed.urlset.url)
        ? parsed.urlset.url
        : [parsed.urlset.url];

      for (const entry of urlEntries) {
        try {
          const sitemapUrl: SitemapUrl = {
            loc: entry.loc,
            lastmod: entry.lastmod,
            changefreq: entry.changefreq,
            priority: entry.priority ? parseFloat(entry.priority) : undefined,
          };

          // Validate URL
          if (sitemapUrl.loc) {
            new URL(sitemapUrl.loc); // Will throw if invalid
            urls.push(sitemapUrl);
          } else {
            errors.push(`Invalid URL entry: missing loc field`);
          }
        } catch (error) {
          errors.push(`Invalid URL format: ${entry.loc || 'unknown'}`);
        }
      }
    } else {
      errors.push('No URLs found in sitemap');
    }

    console.log(`[Sitemap Parser] Successfully parsed ${urls.length} URLs`);

    return {
      urls,
      totalUrls: urls.length,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Sitemap Parser] Error:', errorMessage);
    errors.push(`Failed to parse sitemap: ${errorMessage}`);

    return {
      urls: [],
      totalUrls: 0,
      errors,
    };
  }
}

/**
 * Parse a sitemap index and return URLs of all nested sitemaps
 * @param indexUrl - URL to the sitemap index
 * @returns Array of sitemap URLs
 */
export async function parseSitemapIndex(indexUrl: string): Promise<string[]> {
  try {
    console.log(`[Sitemap Index Parser] Fetching sitemap index from: ${indexUrl}`);

    const response = await axios.get(indexUrl, {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Audit-Bot/1.0)',
      },
    });

    const xmlContent = response.data;

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
    });

    const parsed = parser.parse(xmlContent);

    console.log('[Sitemap Index Parser] Parsed structure:', JSON.stringify(parsed, null, 2).substring(0, 500));

    if (parsed.sitemapindex && parsed.sitemapindex.sitemap) {
      const sitemapEntries = Array.isArray(parsed.sitemapindex.sitemap)
        ? parsed.sitemapindex.sitemap
        : [parsed.sitemapindex.sitemap];

      const sitemapUrls = sitemapEntries
        .map((entry: { loc?: string }) => entry.loc)
        .filter((url: string | undefined): url is string => !!url);

      console.log(`[Sitemap Index Parser] Found ${sitemapUrls.length} sitemaps:`, sitemapUrls);
      return sitemapUrls;
    }

    console.log('[Sitemap Index Parser] No sitemaps found in index. Parsed keys:', Object.keys(parsed));
    return [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Sitemap Index Parser] Error:', errorMessage);
    return [];
  }
}

/**
 * Extract all URLs from a sitemap, handling both regular sitemaps and sitemap indexes
 * @param sitemapUrl - URL to the sitemap.xml or sitemap index
 * @returns All URLs found across all sitemaps
 */
export async function extractAllUrls(sitemapUrl: string): Promise<SitemapUrl[]> {
  try {
    console.log(`[Extract All URLs] Processing: ${sitemapUrl}`);

    // First, try to parse as a regular sitemap
    const parsed = await parseSitemap(sitemapUrl);

    // If it's a sitemap index, recursively fetch all nested sitemaps
    if (parsed.errors.some((error) => error.includes('sitemap index'))) {
      console.log('[Extract All URLs] Detected sitemap index, fetching nested sitemaps');

      const nestedSitemapUrls = await parseSitemapIndex(sitemapUrl);
      const allUrls: SitemapUrl[] = [];

      for (const nestedUrl of nestedSitemapUrls) {
        const nestedParsed = await parseSitemap(nestedUrl);
        allUrls.push(...nestedParsed.urls);

        // Add a small delay to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      console.log(`[Extract All URLs] Total URLs from all sitemaps: ${allUrls.length}`);
      return allUrls;
    }

    // Regular sitemap, return URLs
    return parsed.urls;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Extract All URLs] Error:', errorMessage);
    return [];
  }
}
