import { SitemapUrl, UrlStructureIssue, UrlStructureAnalysis } from '@/types';

/**
 * Analyze URL structure and patterns in a sitemap
 * @param urls - Array of sitemap URLs
 * @returns URL structure analysis with issues and patterns
 */
export async function analyzeUrlStructure(
  urls: SitemapUrl[]
): Promise<UrlStructureAnalysis> {
  console.log(`[URL Structure Analyzer] Analyzing ${urls.length} URLs`);

  const issues: UrlStructureIssue[] = [];
  const patterns: Map<string, { count: number; example: string }> = new Map();
  const depthCounts: Record<number, number> = {};

  // Analyze each URL
  for (const urlEntry of urls) {
    try {
      const url = new URL(urlEntry.loc);
      const pathname = url.pathname;

      // Calculate URL depth
      const depth = pathname.split('/').filter((segment) => segment.length > 0).length;
      depthCounts[depth] = (depthCounts[depth] || 0) + 1;

      // Detect patterns (e.g., /blog/{slug}, /products/{category}/{product})
      const pattern = pathname.replace(/\/[^/]+(?=\/|$)/g, '/{slug}');
      if (!patterns.has(pattern)) {
        patterns.set(pattern, { count: 0, example: pathname });
      }
      patterns.get(pattern)!.count++;
    } catch (error) {
      // Invalid URL, skip
    }
  }

  // Calculate depth statistics
  const depths = Object.keys(depthCounts).map(Number);
  const totalDepth = depths.reduce((sum, depth) => sum + depth * depthCounts[depth], 0);
  const averageDepth = urls.length > 0 ? totalDepth / urls.length : 0;
  const maxDepth = depths.length > 0 ? Math.max(...depths) : 0;

  // Check for deep URLs (depth > 4)
  const deepUrls = urls.filter((url) => {
    try {
      const pathname = new URL(url.loc).pathname;
      const depth = pathname.split('/').filter((s) => s.length > 0).length;
      return depth > 4;
    } catch {
      return false;
    }
  });

  if (deepUrls.length > 0) {
    issues.push({
      type: 'too_deep',
      description: `${deepUrls.length} URLs have a depth greater than 4 levels`,
      affectedUrls: deepUrls.slice(0, 10).map((u) => u.loc),
      recommendation:
        'Consider flattening the URL structure to improve crawlability and user experience. URLs deeper than 4 levels may indicate over-categorization.',
      severity: deepUrls.length > urls.length * 0.2 ? 'high' : 'medium',
    });
  }

  // Check for inconsistent naming conventions
  const kebabCaseUrls = urls.filter((url) => {
    try {
      const pathname = new URL(url.loc).pathname;
      return /[a-z]+-[a-z]+/.test(pathname);
    } catch {
      return false;
    }
  });

  const underscoreUrls = urls.filter((url) => {
    try {
      const pathname = new URL(url.loc).pathname;
      return /_/.test(pathname);
    } catch {
      return false;
    }
  });

  const camelCaseUrls = urls.filter((url) => {
    try {
      const pathname = new URL(url.loc).pathname;
      return /[a-z][A-Z]/.test(pathname);
    } catch {
      return false;
    }
  });

  if (kebabCaseUrls.length > 0 && underscoreUrls.length > 0) {
    issues.push({
      type: 'inconsistent_pattern',
      description: `Mixed naming conventions detected: ${kebabCaseUrls.length} kebab-case URLs and ${underscoreUrls.length} underscore URLs`,
      affectedUrls: [
        ...kebabCaseUrls.slice(0, 3).map((u) => u.loc),
        ...underscoreUrls.slice(0, 3).map((u) => u.loc),
      ],
      recommendation:
        'Standardize on kebab-case (dash-separated) URLs for consistency and SEO best practices.',
      severity: 'medium',
    });
  }

  if (camelCaseUrls.length > 0) {
    issues.push({
      type: 'poor_naming',
      description: `${camelCaseUrls.length} URLs use camelCase, which is not SEO-friendly`,
      affectedUrls: camelCaseUrls.slice(0, 10).map((u) => u.loc),
      recommendation:
        'Convert camelCase URLs to kebab-case (lowercase with dashes) for better readability and SEO.',
      severity: camelCaseUrls.length > urls.length * 0.1 ? 'high' : 'medium',
    });
  }

  // Check for overly long URLs (>100 characters)
  const longUrls = urls.filter((url) => {
    try {
      const pathname = new URL(url.loc).pathname;
      return pathname.length > 100;
    } catch {
      return false;
    }
  });

  if (longUrls.length > 0) {
    issues.push({
      type: 'poor_naming',
      description: `${longUrls.length} URLs exceed 100 characters in length`,
      affectedUrls: longUrls.slice(0, 5).map((u) => u.loc),
      recommendation:
        'Shorten URLs by removing unnecessary words and using abbreviations where appropriate. Long URLs are harder to share and remember.',
      severity: longUrls.length > urls.length * 0.15 ? 'high' : 'low',
    });
  }

  // Check for non-descriptive URLs
  const nonDescriptiveUrls = urls.filter((url) => {
    try {
      const pathname = new URL(url.loc).pathname;
      return /\/(page|item|post|content|id)[-_]?\d+/.test(pathname);
    } catch {
      return false;
    }
  });

  if (nonDescriptiveUrls.length > 0) {
    issues.push({
      type: 'poor_naming',
      description: `${nonDescriptiveUrls.length} URLs use non-descriptive patterns (e.g., /page-1, /item-123)`,
      affectedUrls: nonDescriptiveUrls.slice(0, 10).map((u) => u.loc),
      recommendation:
        'Use descriptive, keyword-rich URLs that indicate the page content. Avoid generic patterns like /page-1 or /item-123.',
      severity: nonDescriptiveUrls.length > urls.length * 0.2 ? 'high' : 'medium',
    });
  }

  // Check for trailing slash inconsistency
  const withTrailingSlash = urls.filter((url) => {
    try {
      const pathname = new URL(url.loc).pathname;
      return pathname !== '/' && pathname.endsWith('/');
    } catch {
      return false;
    }
  });

  const withoutTrailingSlash = urls.filter((url) => {
    try {
      const pathname = new URL(url.loc).pathname;
      return pathname !== '/' && !pathname.endsWith('/');
    } catch {
      return false;
    }
  });

  if (withTrailingSlash.length > 0 && withoutTrailingSlash.length > 0) {
    const ratio = Math.min(withTrailingSlash.length, withoutTrailingSlash.length) / urls.length;
    if (ratio > 0.1) {
      issues.push({
        type: 'inconsistent_pattern',
        description: `Inconsistent trailing slash usage: ${withTrailingSlash.length} URLs with trailing slash, ${withoutTrailingSlash.length} without`,
        affectedUrls: [
          ...withTrailingSlash.slice(0, 3).map((u) => u.loc),
          ...withoutTrailingSlash.slice(0, 3).map((u) => u.loc),
        ],
        recommendation:
          'Standardize trailing slash usage across all URLs. Choose either always include or always exclude trailing slashes, and set up proper redirects.',
        severity: 'medium',
      });
    }
  }

  // Check for URL parameters
  const urlsWithParams = urls.filter((url) => {
    try {
      return new URL(url.loc).search.length > 0;
    } catch {
      return false;
    }
  });

  if (urlsWithParams.length > 0) {
    issues.push({
      type: 'inconsistent_pattern',
      description: `${urlsWithParams.length} URLs contain query parameters`,
      affectedUrls: urlsWithParams.slice(0, 5).map((u) => u.loc),
      recommendation:
        'URLs in sitemaps should generally not contain query parameters. Consider using clean, static URLs or ensure parameters are intentional (e.g., for pagination).',
      severity: urlsWithParams.length > urls.length * 0.1 ? 'medium' : 'low',
    });
  }

  // Convert patterns map to array and sort by count
  const patternsArray = Array.from(patterns.entries())
    .map(([pattern, data]) => ({
      pattern,
      count: data.count,
      example: data.example,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 patterns

  console.log(`[URL Structure Analyzer] Found ${issues.length} issues`);

  return {
    issues,
    totalIssues: issues.length,
    patterns: patternsArray,
    depthAnalysis: {
      averageDepth: Math.round(averageDepth * 10) / 10,
      maxDepth,
      urlsByDepth: depthCounts,
    },
  };
}
