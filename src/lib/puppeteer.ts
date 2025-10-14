import puppeteer, { Browser } from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';
import { CaptureResult, AccessibilityResult } from '@/types';

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.connected) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });
  }
  return browser;
}

export async function captureWebsite(url: string): Promise<CaptureResult> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set a reasonable timeout
    await page.setDefaultNavigationTimeout(30000);

    // Desktop capture (1920x1080)
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Wait a bit for any animations/lazy loading
    await new Promise(resolve => setTimeout(resolve, 1000));

    const desktopScreenshot = await page.screenshot({
      fullPage: true,
      type: 'png',
    });

    // Mobile capture (375x812 - iPhone X)
    await page.setViewport({ width: 375, height: 812 });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mobileScreenshot = await page.screenshot({
      fullPage: true,
      type: 'png',
    });

    await page.close();

    return {
      desktopScreenshot: Buffer.from(desktopScreenshot),
      mobileScreenshot: Buffer.from(mobileScreenshot),
      url,
      timestamp: new Date(),
    };
  } catch (error) {
    await page.close();
    throw new Error(`Failed to capture website: ${error}`);
  }
}

export async function runAccessibilityTests(url: string): Promise<AccessibilityResult> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Run axe-core accessibility tests
    const results = await new AxePuppeteer(page).analyze();

    await page.close();

    const violations = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact as 'minor' | 'moderate' | 'serious' | 'critical',
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.length,
    }));

    // Calculate score (100 - penalty points)
    let score = 100;
    violations.forEach((v) => {
      switch (v.impact) {
        case 'critical':
          score -= 10;
          break;
        case 'serious':
          score -= 5;
          break;
        case 'moderate':
          score -= 2;
          break;
        case 'minor':
          score -= 1;
          break;
      }
    });

    score = Math.max(0, score);

    return {
      violations,
      score,
      totalTests: results.violations.length,
    };
  } catch (error) {
    await page.close();
    throw new Error(`Failed to run accessibility tests: ${error}`);
  }
}

export async function extractSEOData(url: string): Promise<{
  metaTitle?: string;
  metaDescription?: string;
  h1Tags?: string[];
  coreWebVitals?: { lcp: number; fid: number; cls: number };
}> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Extract SEO metadata
    const seoData = await page.evaluate(() => {
      const metaTitle =
        document.querySelector('title')?.textContent ||
        document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
        undefined;

      const metaDescription =
        document.querySelector('meta[name="description"]')?.getAttribute('content') ||
        document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
        undefined;

      const h1Elements = Array.from(document.querySelectorAll('h1'));
      const h1Tags = h1Elements.map((h1) => h1.textContent?.trim() || '').filter(Boolean);

      return {
        metaTitle,
        metaDescription,
        h1Tags: h1Tags.length > 0 ? h1Tags : undefined,
      };
    });

    // Collect Core Web Vitals (simplified - real implementation would use web-vitals library)
    const coreWebVitals = await page.evaluate(() => {
      return {
        lcp: 0, // Largest Contentful Paint
        fid: 0, // First Input Delay
        cls: 0, // Cumulative Layout Shift
      };
    });

    await page.close();

    return {
      ...seoData,
      coreWebVitals,
    };
  } catch (error) {
    await page.close();
    throw new Error(`Failed to extract SEO data: ${error}`);
  }
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export function isHomepage(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname === '/' || parsed.pathname === '';
  } catch {
    return false;
  }
}
