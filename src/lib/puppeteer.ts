import type { Browser, Page } from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';
import { CaptureResult, AccessibilityResult } from '@/types';
import sharp from 'sharp';

// Use unknown for browser to avoid type conflicts between puppeteer and puppeteer-core
let browser: unknown = null;

async function getBrowser(): Promise<Browser> {
  if (!browser || !(browser as Browser).connected) {
    // Check if we're in production (Vercel) or development
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // Use @sparticuz/chromium for serverless environments (Vercel)
      const chromium = await import('@sparticuz/chromium');
      const puppeteerCore = await import('puppeteer-core');

      browser = await puppeteerCore.default.launch({
        args: chromium.default.args,
        defaultViewport: null,
        executablePath: await chromium.default.executablePath(),
        headless: true,
      });
    } else {
      // Use regular puppeteer for local development
      const puppeteer = await import('puppeteer');

      browser = await puppeteer.default.launch({
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
  }
  return browser as Browser;
}

/**
 * Wait for DOM mutations to stop (indicates lazy content has loaded)
 */
async function waitForDOMStability(page: Page, timeout = 5000): Promise<void> {
  await page.evaluate((timeout) => {
    return new Promise<void>((resolve) => {
      let timeoutId: NodeJS.Timeout;
      const observer = new MutationObserver(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          observer.disconnect();
          resolve();
        }, 500); // Wait 500ms of no mutations
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      // Failsafe timeout
      setTimeout(() => {
        observer.disconnect();
        resolve();
      }, timeout);
    });
  }, timeout);
}

/**
 * Scroll through the page VERY slowly, pausing at intervals
 * to trigger Intersection Observer-based lazy loading
 */
async function autoScroll(page: Page, passes = 3): Promise<void> {
  for (let pass = 1; pass <= passes; pass++) {
    console.log(`[Puppeteer] Scroll pass ${pass}/${passes}...`);

    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let currentPosition = 0;
        const viewportHeight = window.innerHeight;
        const scrollHeight = document.body.scrollHeight;
        const scrollStep = viewportHeight * 0.5; // Scroll half a viewport at a time

        const scrollInterval = setInterval(async () => {
          // Scroll down
          window.scrollTo(0, currentPosition);
          currentPosition += scrollStep;

          // Stop when we've reached the bottom plus some extra
          if (currentPosition >= scrollHeight + viewportHeight) {
            clearInterval(scrollInterval);
            resolve();
          }
        }, 300); // Wait 300ms between each scroll step (very slow)
      });
    });

    // Wait for DOM changes to settle after scrolling
    console.log(`[Puppeteer] Waiting for content to load after pass ${pass}...`);
    await waitForDOMStability(page, 5000);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Scroll back to top
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await new Promise(resolve => setTimeout(resolve, 1500));
}

/**
 * Wait for all images (including lazy-loaded) to load
 */
async function waitForImages(page: Page): Promise<void> {
  await page.evaluate(async () => {
    // Wait for all img tags
    const images = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve); // Resolve even on error to not block
          // Timeout after 15 seconds per image
          setTimeout(resolve, 15000);
        });
      })
    );

    // Also wait for background images loaded via CSS
    const elementsWithBgImages = Array.from(document.querySelectorAll('*')).filter(el => {
      const bgImage = window.getComputedStyle(el).backgroundImage;
      return bgImage && bgImage !== 'none' && bgImage.includes('url(');
    });

    // Give background images time to load
    await new Promise(resolve => setTimeout(resolve, 2000));
  });
}

/**
 * Wait for page to be fully loaded with multiple strategies
 * Optimized for capturing Intersection Observer-based lazy-loaded content
 */
async function waitForPageLoad(page: Page, url: string): Promise<void> {
  console.log('[Puppeteer] Navigating to:', url);

  // Try with networkidle2 first (more lenient), fallback to networkidle0, then domcontentloaded
  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 90000
    });
    console.log('[Puppeteer] Page loaded with networkidle2');
  } catch (navError) {
    console.log('[Puppeteer] networkidle2 failed, trying networkidle0...');
    try {
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 90000
      });
      console.log('[Puppeteer] Page loaded with networkidle0');
    } catch (navError2) {
      console.log('[Puppeteer] networkidle0 failed, trying domcontentloaded...');
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 90000
      });
      console.log('[Puppeteer] Page loaded with domcontentloaded');
    }
  }

  // Wait for initial page load and JavaScript execution
  console.log('[Puppeteer] Waiting 5 seconds for initial content and JS execution...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Wait for initial DOM to stabilize
  console.log('[Puppeteer] Waiting for DOM to stabilize...');
  await waitForDOMStability(page, 5000);

  // Scroll through page 3 TIMES very slowly to trigger all lazy-loaded content
  console.log('[Puppeteer] Scrolling to trigger lazy-loaded content (3 passes, viewport-based)...');
  await autoScroll(page, 3);

  // Final DOM stability check
  console.log('[Puppeteer] Final DOM stability check...');
  await waitForDOMStability(page, 5000);

  // Wait for all images (including background images) to load
  console.log('[Puppeteer] Waiting for all images to load...');
  await waitForImages(page);

  // Additional wait for animations, transitions, and any final rendering
  console.log('[Puppeteer] Final wait for animations and rendering...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // One more scroll to top to ensure everything is visible
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('[Puppeteer] ✓ Page fully loaded and ready for screenshot');
}

/**
 * Compress and resize image for storage and Claude API
 * Ensures: dimensions < 8000px, size < 3MB, format = JPEG
 */
async function compressImage(imageBuffer: Buffer, maxSizeBytes = 3 * 1024 * 1024): Promise<Buffer> {
  const MAX_DIMENSION = 7500; // Claude's limit is 8000px, leave buffer

  const originalSize = imageBuffer.length;
  console.log(`[Puppeteer] Original image size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);

  // Get image metadata
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const width = metadata.width || 1920;
  const height = metadata.height || 1080;

  console.log(`[Puppeteer] Original dimensions: ${width}x${height}`);

  // Step 1: Resize dimensions if needed (MUST be under 8000px for Claude)
  let workingBuffer = imageBuffer;
  const needsResize = width > MAX_DIMENSION || height > MAX_DIMENSION;

  if (needsResize) {
    console.log(`[Puppeteer] Image exceeds ${MAX_DIMENSION}px, resizing to fit...`);
    workingBuffer = await sharp(imageBuffer)
      .resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    const resizedMeta = await sharp(workingBuffer).metadata();
    console.log(`[Puppeteer] Resized to: ${resizedMeta.width}x${resizedMeta.height}, ${(workingBuffer.length / 1024 / 1024).toFixed(2)}MB`);
  }

  // Step 2: Compress by quality to meet file size requirement
  if (workingBuffer.length <= maxSizeBytes) {
    // If already under size after dimension resize, ensure JPEG and return
    const final = await sharp(workingBuffer)
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();
    console.log(`[Puppeteer] Final size: ${(final.length / 1024 / 1024).toFixed(2)}MB`);
    return final;
  }

  console.log(`[Puppeteer] Applying quality compression to meet ${(maxSizeBytes / 1024 / 1024).toFixed(1)}MB target...`);
  let quality = 80;
  let compressed = workingBuffer;

  while (quality >= 40) {
    compressed = await sharp(workingBuffer)
      .jpeg({ quality, progressive: true })
      .toBuffer();

    const compressedSize = compressed.length;
    console.log(`[Puppeteer] Quality ${quality}: ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);

    if (compressedSize <= maxSizeBytes) {
      console.log(`[Puppeteer] ✓ Successfully compressed to ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);
      return compressed;
    }

    quality -= 10;
  }

  // Step 3: If still too large, progressively reduce dimensions further
  console.log('[Puppeteer] Quality compression insufficient, reducing dimensions further...');
  const currentMeta = await sharp(workingBuffer).metadata();
  const currentWidth = currentMeta.width || MAX_DIMENSION;
  const currentHeight = currentMeta.height || MAX_DIMENSION;

  const resizeFactors = [0.8, 0.7, 0.6, 0.5];

  for (const factor of resizeFactors) {
    const targetWidth = Math.floor(currentWidth * factor);
    const targetHeight = Math.floor(currentHeight * factor);

    compressed = await sharp(workingBuffer)
      .resize(targetWidth, targetHeight, { fit: 'inside' })
      .jpeg({ quality: 75, progressive: true })
      .toBuffer();

    const compressedSize = compressed.length;
    console.log(`[Puppeteer] ${targetWidth}x${targetHeight}: ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);

    if (compressedSize <= maxSizeBytes) {
      console.log(`[Puppeteer] ✓ Successfully resized and compressed to ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);
      return compressed;
    }
  }

  // Last resort: very small size with low quality
  console.log('[Puppeteer] Using maximum compression as last resort...');
  compressed = await sharp(workingBuffer)
    .resize(2000, 2000, { fit: 'inside' })
    .jpeg({ quality: 60, progressive: true })
    .toBuffer();

  console.log(`[Puppeteer] Final size: ${(compressed.length / 1024 / 1024).toFixed(2)}MB`);
  return compressed;
}

/**
 * Comprehensive audit data capture - loads page once and performs all operations
 */
export async function captureAuditData(url: string): Promise<{
  desktopScreenshot: Buffer;
  mobileScreenshot: Buffer;
  accessibilityData: AccessibilityResult;
  seoData: {
    metaTitle?: string;
    metaDescription?: string;
    h1Tags?: string[];
    coreWebVitals?: { lcp: number; fid: number; cls: number };
  };
}> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setDefaultNavigationTimeout(90000);

    console.log('[Puppeteer] === Starting comprehensive audit ===');

    // Step 1: Load page at desktop viewport and wait for everything
    console.log('[Puppeteer] Step 1: Loading page at desktop viewport...');
    await page.setViewport({ width: 1920, height: 1080 });
    await waitForPageLoad(page, url);

    // Step 2: Extract SEO data (while page is loaded)
    console.log('[Puppeteer] Step 2: Extracting SEO data...');
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
        coreWebVitals: {
          lcp: 0,
          fid: 0,
          cls: 0,
        },
      };
    });

    // Step 3: Run accessibility tests (on same page load)
    console.log('[Puppeteer] Step 3: Running accessibility tests...');
    const axeResults = await new AxePuppeteer(page).analyze();

    const violations = axeResults.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact as 'minor' | 'moderate' | 'serious' | 'critical',
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.length,
    }));

    let accessibilityScore = 100;
    violations.forEach((v) => {
      switch (v.impact) {
        case 'critical':
          accessibilityScore -= 10;
          break;
        case 'serious':
          accessibilityScore -= 5;
          break;
        case 'moderate':
          accessibilityScore -= 2;
          break;
        case 'minor':
          accessibilityScore -= 1;
          break;
      }
    });
    accessibilityScore = Math.max(0, accessibilityScore);

    const accessibilityData: AccessibilityResult = {
      violations,
      score: accessibilityScore,
      totalTests: axeResults.violations.length,
    };

    // Step 4: Take desktop screenshot
    console.log('[Puppeteer] Step 4: Taking desktop screenshot...');
    const desktopScreenshotRaw = await page.screenshot({
      fullPage: true,
      type: 'png',
    });
    const desktopScreenshot = await compressImage(Buffer.from(desktopScreenshotRaw));

    // Step 5: Switch to mobile viewport and reload
    console.log('[Puppeteer] Step 5: Switching to mobile viewport...');
    await page.setViewport({ width: 375, height: 812 });
    await waitForPageLoad(page, url);

    // Step 6: Take mobile screenshot
    console.log('[Puppeteer] Step 6: Taking mobile screenshot...');
    const mobileScreenshotRaw = await page.screenshot({
      fullPage: true,
      type: 'png',
    });
    const mobileScreenshot = await compressImage(Buffer.from(mobileScreenshotRaw));

    await page.close();
    console.log('[Puppeteer] === Comprehensive audit complete ===');

    return {
      desktopScreenshot,
      mobileScreenshot,
      accessibilityData,
      seoData,
    };
  } catch (error) {
    await page.close();
    console.error('[Puppeteer] Error in comprehensive audit:', error);
    throw new Error(`Failed to capture audit data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function captureWebsite(url: string): Promise<CaptureResult> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set a longer timeout for slow websites
    await page.setDefaultNavigationTimeout(90000); // Increased to 90 seconds

    // Desktop capture (1920x1080)
    console.log('[Puppeteer] Starting desktop capture...');
    await page.setViewport({ width: 1920, height: 1080 });

    // Use comprehensive page load with scroll and image waiting
    await waitForPageLoad(page, url);

    console.log('[Puppeteer] Taking desktop screenshot...');
    const desktopScreenshot = await page.screenshot({
      fullPage: true,
      type: 'png',
    });

    // Mobile capture (375x812 - iPhone X)
    console.log('[Puppeteer] Starting mobile capture...');
    await page.setViewport({ width: 375, height: 812 });

    // Reload page for mobile viewport and wait comprehensively
    await waitForPageLoad(page, url);

    console.log('[Puppeteer] Taking mobile screenshot...');
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
    console.error('[Puppeteer] Error capturing website:', error);
    throw new Error(`Failed to capture website: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function runAccessibilityTests(url: string): Promise<AccessibilityResult> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setDefaultNavigationTimeout(90000);
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('[Puppeteer] Loading page for accessibility tests...');
    await waitForPageLoad(page, url);

    // Run axe-core accessibility tests
    console.log('[Puppeteer] Running accessibility tests...');
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
    await page.setDefaultNavigationTimeout(90000);
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('[Puppeteer] Loading page for SEO data extraction...');
    await waitForPageLoad(page, url);

    // Extract SEO metadata
    console.log('[Puppeteer] Extracting SEO metadata...');
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
    await (browser as Browser).close();
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
