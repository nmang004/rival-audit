import axios from 'axios';
import { KeywordTrendData, TopPage } from '@/types';

const SEMRUSH_API_KEY = process.env.SEMRUSH_API_KEY;
const SEMRUSH_BASE_URL = 'https://api.semrush.com';

// Helper function to check if API key is valid
function isValidApiKey(): boolean {
  if (!SEMRUSH_API_KEY) return false;
  if (SEMRUSH_API_KEY.length < 10) return false;

  // Check for placeholder values
  const placeholders = ['your-semrush-key', 'your-key', 'YOUR_KEY', 'xxx', '...'];
  if (placeholders.some(p => SEMRUSH_API_KEY.includes(p))) return false;

  return true;
}

export interface SEMRushDomainData {
  totalKeywords: number;
  organicTraffic: number;
  organicCost: number;
  paidTraffic: number;
  backlinks: number;
}

// Generate realistic placeholder data for demo purposes
function generatePlaceholderKeywordTrend(): KeywordTrendData[] {
  const trendData: KeywordTrendData[] = [];
  const currentDate = new Date();

  // Generate 12 months of data
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);

    const month = date.toISOString().substring(0, 7); // Format: "2024-01"
    const baseKeywords = 1200;
    const variation = Math.floor(Math.random() * 300) - 150; // Random variation
    const keywords = Math.max(800, baseKeywords + variation + (i * 50)); // Upward trend

    trendData.push({
      month,
      keywords,
      traffic: Math.floor(keywords * 1.5), // Approximate traffic
    });
  }

  return trendData;
}

function generatePlaceholderTopPages(domain: string): TopPage[] {
  const pages = [
    { path: '/', position: 3.5, keywords: 250, traffic: 4200 },
    { path: '/about', position: 5.2, keywords: 120, traffic: 2100 },
    { path: '/services', position: 4.8, keywords: 180, traffic: 3500 },
    { path: '/blog', position: 6.1, keywords: 340, traffic: 5800 },
    { path: '/contact', position: 8.3, keywords: 85, traffic: 1200 },
  ];

  return pages.map(page => ({
    url: `https://${domain}${page.path}`,
    position: page.position,
    keywords: page.keywords,
    traffic: page.traffic,
  }));
}

// Get domain overview data
export async function getDomainOverview(domain: string): Promise<SEMRushDomainData> {
  if (!isValidApiKey()) {
    console.warn('[SEMRush] API key not configured or invalid, using placeholder data');
    // Return placeholder data
    return {
      totalKeywords: 1850,
      organicTraffic: 12400,
      organicCost: 8500,
      paidTraffic: 450,
      backlinks: 2340,
    };
  }

  try {
    console.log(`[SEMRush] Fetching domain overview for ${domain}...`);

    const response = await axios.get(`${SEMRUSH_BASE_URL}/analytics/v1/`, {
      params: {
        key: SEMRUSH_API_KEY,
        type: 'domain_organic',
        domain: domain,
        database: 'us',
        display_limit: 1,
      },
      timeout: 10000, // 10 second timeout
    });

    // Parse SEMRush response (format may vary)
    const data = response.data;

    return {
      totalKeywords: parseInt(data.keywords || '0'),
      organicTraffic: parseInt(data.traffic || '0'),
      organicCost: parseInt(data.traffic_cost || '0'),
      paidTraffic: parseInt(data.adwords_traffic || '0'),
      backlinks: parseInt(data.backlinks || '0'),
    };
  } catch (error) {
    console.error('[SEMRush] Error fetching domain overview:', error);
    // Return placeholder data on error
    return {
      totalKeywords: 1850,
      organicTraffic: 12400,
      organicCost: 8500,
      paidTraffic: 450,
      backlinks: 2340,
    };
  }
}

// Get keyword count trend for last 12 months
export async function getKeywordTrend(domain: string): Promise<KeywordTrendData[]> {
  if (!isValidApiKey()) {
    console.warn('[SEMRush] API key not configured or invalid, using placeholder data');
    return generatePlaceholderKeywordTrend();
  }

  try {
    console.log(`[SEMRush] Fetching keyword trend for ${domain}...`);

    const response = await axios.get(`${SEMRUSH_BASE_URL}/analytics/v1/domain_rank_history`, {
      params: {
        key: SEMRUSH_API_KEY,
        domain: domain,
        database: 'us',
        display_date: 'latest-12', // Last 12 months
      },
      timeout: 10000,
    });

    // Parse and format the response
    const data = response.data as Array<{ date: string; keywords?: string; traffic?: string }>;

    // Transform SEMRush data to our format
    const trendData: KeywordTrendData[] = data.map((item) => ({
      month: item.date, // Expected format: "2024-01"
      keywords: parseInt(item.keywords || '0'),
      traffic: parseInt(item.traffic || '0'),
    }));

    return trendData;
  } catch (error) {
    console.error('[SEMRush] Error fetching keyword trend:', error);
    return generatePlaceholderKeywordTrend();
  }
}

// Get top 5 pages by organic traffic
export async function getTopPages(domain: string, limit: number = 5): Promise<TopPage[]> {
  if (!isValidApiKey()) {
    console.warn('[SEMRush] API key not configured or invalid, using placeholder data');
    return generatePlaceholderTopPages(domain);
  }

  try {
    console.log(`[SEMRush] Fetching top pages for ${domain}...`);

    const response = await axios.get(`${SEMRUSH_BASE_URL}/analytics/v1/domain_organic_organic`, {
      params: {
        key: SEMRUSH_API_KEY,
        domain: domain,
        database: 'us',
        display_limit: limit,
        export_columns: 'Dn,Ur,Tr,Np,Po',
      },
      timeout: 10000,
    });

    // Parse the response
    const data = response.data as Array<{ url?: string; traffic?: string; keywords?: string; position?: string }>;

    const topPages: TopPage[] = data.map((item) => ({
      url: item.url || '',
      traffic: parseInt(item.traffic || '0'),
      keywords: parseInt(item.keywords || '0'),
      position: parseFloat(item.position || '0'),
    }));

    return topPages;
  } catch (error) {
    console.error('[SEMRush] Error fetching top pages:', error);
    return generatePlaceholderTopPages(domain);
  }
}

// Combined function to fetch all homepage data
export async function getHomepageData(domain: string): Promise<{
  totalKeywords: number;
  keywordTrendData: KeywordTrendData[];
  topPages: TopPage[];
}> {
  console.log(`[SEMRush] Fetching all homepage data for ${domain}...`);

  try {
    // Fetch all data in parallel
    const [domainData, trendData, topPagesData] = await Promise.all([
      getDomainOverview(domain),
      getKeywordTrend(domain),
      getTopPages(domain, 5),
    ]);

    return {
      totalKeywords: domainData.totalKeywords,
      keywordTrendData: trendData,
      topPages: topPagesData,
    };
  } catch (error) {
    console.error('[SEMRush] Error fetching homepage data:', error);

    // Return placeholder data if everything fails
    return {
      totalKeywords: 1850,
      keywordTrendData: generatePlaceholderKeywordTrend(),
      topPages: generatePlaceholderTopPages(domain),
    };
  }
}

// Rate limiting helper (max 10 requests per second)
class RateLimiter {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minInterval = 100; // 100ms between requests = 10 req/s

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        void this.process();
      }
    });
  }

  private async process() {
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      if (timeSinceLastRequest < this.minInterval) {
        await this.sleep(this.minInterval - timeSinceLastRequest);
      }

      const fn = this.queue.shift();
      if (fn) {
        this.lastRequestTime = Date.now();
        await fn();
      }
    }

    this.processing = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const semrushRateLimiter = new RateLimiter();

/**
 * Get comprehensive SEMRush data for signed workflow
 * Includes top 50 keywords, top 20 pages, and domain metrics
 */
export async function getSEMRushData(url: string): Promise<import('@/types').SEMRushData> {
  const domain = new URL(url).hostname;

  console.log(`[SEMRush] Fetching comprehensive data for ${domain}...`);

  if (!isValidApiKey()) {
    console.warn('[SEMRush] API key not configured, generating placeholder data');
    return generatePlaceholderSEMRushData(domain);
  }

  try {
    // Fetch domain overview
    const domainData = await getDomainOverview(domain);

    // Fetch top 50 keywords
    const keywords = await getTopKeywords(domain, 50);

    // Fetch top 20 pages
    const topPages = await getTopPages(domain, 20);

    return {
      totalKeywords: domainData.totalKeywords,
      organicTraffic: domainData.organicTraffic,
      paidTraffic: domainData.paidTraffic,
      backlinks: domainData.backlinks,
      keywords,
      topPages,
    };
  } catch (error) {
    console.error('[SEMRush] Error fetching comprehensive data:', error);
    return generatePlaceholderSEMRushData(domain);
  }
}

/**
 * Get top keywords for a domain
 */
async function getTopKeywords(
  domain: string,
  limit: number = 50
): Promise<Array<{ keyword: string; position: number; volume: number; difficulty: number; url: string }>> {
  if (!isValidApiKey()) {
    return generatePlaceholderKeywords(domain, limit);
  }

  try {
    console.log(`[SEMRush] Fetching top ${limit} keywords for ${domain}...`);

    const response = await axios.get(`${SEMRUSH_BASE_URL}/analytics/v1/domain_organic_organic`, {
      params: {
        key: SEMRUSH_API_KEY,
        domain: domain,
        database: 'us',
        display_limit: limit,
        export_columns: 'Ph,Po,Nq,Kd,Ur',
      },
      timeout: 15000,
    });

    const data = response.data as Array<{
      keyword?: string;
      position?: string;
      volume?: string;
      difficulty?: string;
      url?: string;
    }>;

    return data.map((item) => ({
      keyword: item.keyword || '',
      position: parseInt(item.position || '0'),
      volume: parseInt(item.volume || '0'),
      difficulty: parseInt(item.difficulty || '0'),
      url: item.url || '',
    }));
  } catch (error) {
    console.error('[SEMRush] Error fetching keywords:', error);
    return generatePlaceholderKeywords(domain, limit);
  }
}

/**
 * Generate placeholder SEMRush data for testing
 */
function generatePlaceholderSEMRushData(domain: string): import('@/types').SEMRushData {
  return {
    totalKeywords: 1850,
    organicTraffic: 12400,
    paidTraffic: 450,
    backlinks: 2340,
    keywords: generatePlaceholderKeywords(domain, 50),
    topPages: generatePlaceholderTopPages(domain).concat(
      Array.from({ length: 15 }, (_, i) => ({
        url: `https://${domain}/page-${i + 6}`,
        traffic: Math.floor(Math.random() * 1000) + 200,
        keywords: Math.floor(Math.random() * 50) + 10,
        position: Math.random() * 10 + 1,
      }))
    ),
  };
}

/**
 * Generate placeholder keywords for testing
 */
function generatePlaceholderKeywords(
  domain: string,
  count: number
): Array<{ keyword: string; position: number; volume: number; difficulty: number; url: string }> {
  const keywords = [];
  const baseKeywords = [
    'web design',
    'seo services',
    'digital marketing',
    'web development',
    'online marketing',
    'social media marketing',
    'content marketing',
    'email marketing',
    'ppc advertising',
    'search engine optimization',
    'website optimization',
    'mobile app development',
    'ecommerce solutions',
    'branding services',
    'graphic design',
  ];

  for (let i = 0; i < count; i++) {
    const baseKeyword = baseKeywords[i % baseKeywords.length];
    const variation = i > baseKeywords.length ? ` ${Math.floor(i / baseKeywords.length)}` : '';

    keywords.push({
      keyword: `${baseKeyword}${variation}`,
      position: i + 1,
      volume: Math.floor(Math.random() * 5000) + 500,
      difficulty: Math.floor(Math.random() * 100),
      url: `https://${domain}/page-${Math.floor(i / 3) + 1}`,
    });
  }

  return keywords;
}
