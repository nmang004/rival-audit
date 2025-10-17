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
        args: [
          ...chromium.default.args,
          // Additional args for better stability in serverless
          '--disable-dev-shm-usage', // Reduce memory usage
          '--disable-features=IsolateOrigins', // Reduce process overhead while keeping site-per-process
          '--disable-blink-features=AutomationControlled', // Avoid detection
        ],
        defaultViewport: null,
        executablePath: await chromium.default.executablePath(),
        headless: true,
        // Increase protocol timeout to prevent EBADF errors
        protocolTimeout: 60000, // 60 seconds
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
 * Scroll through the page to trigger lazy loading
 * @param passes - Number of scroll passes (default: 3 for dev, 1 for production)
 * @param intervalMs - Wait time between scroll steps (default: 300ms for dev, 100ms for production)
 */
async function autoScroll(page: Page, passes = 3, intervalMs = 300): Promise<void> {
  for (let pass = 1; pass <= passes; pass++) {
    console.log(`[Puppeteer] Scroll pass ${pass}/${passes}...`);

    await page.evaluate(async (interval) => {
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
        }, interval);
      });
    }, intervalMs);

    // Wait for DOM changes to settle after scrolling (reduced in serverless mode)
    const isProduction = process.env.NODE_ENV === 'production';
    const stabilityTimeout = isProduction ? 2000 : 5000;
    const postScrollWait = isProduction ? 500 : 2000;

    console.log(`[Puppeteer] Waiting for content to load after pass ${pass}...`);
    await waitForDOMStability(page, stabilityTimeout);
    await new Promise(resolve => setTimeout(resolve, postScrollWait));
  }

  // Scroll back to top
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  const finalWait = process.env.NODE_ENV === 'production' ? 500 : 1500;
  await new Promise(resolve => setTimeout(resolve, finalWait));
}

/**
 * Wait for all images (including lazy-loaded) to load
 * @param timeout - Max wait time per image (shorter in production)
 */
async function waitForImages(page: Page): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';
  const imageTimeout = isProduction ? 3000 : 15000; // 3s in prod, 15s in dev
  const bgImageWait = isProduction ? 500 : 2000; // 500ms in prod, 2s in dev

  await page.evaluate(async (timeout, bgWait) => {
    // Wait for all img tags
    const images = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve); // Resolve even on error to not block
          setTimeout(resolve, timeout);
        });
      })
    );

    // Give background images time to load (reduced in production)
    await new Promise(resolve => setTimeout(resolve, bgWait));
  }, imageTimeout, bgImageWait);
}

/**
 * Wait for page to be fully loaded
 * SERVERLESS MODE: Optimized for speed to fit within Vercel timeout limits
 * DEVELOPMENT MODE: Comprehensive loading for best quality
 */
async function waitForPageLoad(page: Page, url: string): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`[Puppeteer] Navigating to: ${url} (${isProduction ? 'SERVERLESS' : 'DEV'} mode)`);

  // Navigate with appropriate wait strategy
  try {
    await page.goto(url, {
      waitUntil: isProduction ? 'domcontentloaded' : 'networkidle2', // Faster in prod
      timeout: isProduction ? 30000 : 90000 // 30s in prod, 90s in dev
    });
    console.log(`[Puppeteer] Page loaded with ${isProduction ? 'domcontentloaded' : 'networkidle2'}`);
  } catch (navError) {
    console.log('[Puppeteer] Navigation failed, trying fallback...');
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    console.log('[Puppeteer] Page loaded with domcontentloaded (fallback)');
  }

  if (isProduction) {
    // SERVERLESS MODE: Ultra-fast loading (target: <20 seconds total)
    console.log('[Puppeteer] ⚡ SERVERLESS: Quick load (2s wait)...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2s for JS execution

    console.log('[Puppeteer] ⚡ SERVERLESS: Single fast scroll...');
    await autoScroll(page, 1, 100); // 1 pass, 100ms intervals

    console.log('[Puppeteer] ⚡ SERVERLESS: Quick image wait...');
    await waitForImages(page); // 3s max per image

    // Scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('[Puppeteer] ✓ SERVERLESS: Page ready for screenshot');
  } else {
    // DEVELOPMENT MODE: Comprehensive loading (best quality)
    console.log('[Puppeteer] Waiting 5 seconds for initial content and JS execution...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('[Puppeteer] Waiting for DOM to stabilize...');
    await waitForDOMStability(page, 5000);

    console.log('[Puppeteer] Scrolling to trigger lazy-loaded content (3 passes)...');
    await autoScroll(page, 3, 300); // 3 passes, 300ms intervals

    console.log('[Puppeteer] Final DOM stability check...');
    await waitForDOMStability(page, 5000);

    console.log('[Puppeteer] Waiting for all images to load...');
    await waitForImages(page); // 15s max per image

    console.log('[Puppeteer] Final wait for animations and rendering...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('[Puppeteer] ✓ Page fully loaded and ready for screenshot');
  }
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
    let accessibilityData: AccessibilityResult;

    try {
      // Check if page is still connected before running axe
      if (!page.isClosed()) {
        // Run axe with timeout protection
        const axeTimeout = process.env.NODE_ENV === 'production' ? 15000 : 30000; // 15s in prod, 30s in dev
        const axeResults = await Promise.race([
          new AxePuppeteer(page)
            .options({ resultTypes: ['violations'] }) // Only get violations for faster analysis
            .analyze(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Axe analysis timeout')), axeTimeout)
          )
        ]);

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

        accessibilityData = {
          violations,
          score: accessibilityScore,
          totalTests: axeResults.violations.length,
        };
        console.log('[Puppeteer] ✓ Accessibility analysis complete');
      } else {
        throw new Error('Page closed before accessibility analysis');
      }
    } catch (axeError) {
      console.error('[Puppeteer] Accessibility analysis failed, using fallback:', axeError);
      // Provide fallback data if axe-core fails
      accessibilityData = {
        violations: [],
        score: 0, // Unknown score, set to 0
        totalTests: 0,
      };
      console.log('[Puppeteer] ⚠ Using fallback accessibility data');
    }

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

    // Safe page close
    try {
      await page.close();
    } catch (closeError) {
      console.warn('[Puppeteer] Warning closing page:', closeError);
    }
    console.log('[Puppeteer] === Comprehensive audit complete ===');

    return {
      desktopScreenshot,
      mobileScreenshot,
      accessibilityData,
      seoData,
    };
  } catch (error) {
    // Safe page close on error
    try {
      if (!page.isClosed()) {
        await page.close();
      }
    } catch (closeError) {
      console.warn('[Puppeteer] Warning closing page after error:', closeError);
    }
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

    try {
      // Check if page is still connected
      if (page.isClosed()) {
        throw new Error('Page closed before accessibility analysis');
      }

      // Run axe with timeout protection
      const axeTimeout = process.env.NODE_ENV === 'production' ? 15000 : 30000;
      const results = await Promise.race([
        new AxePuppeteer(page)
          .options({ resultTypes: ['violations'] })
          .analyze(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Axe analysis timeout')), axeTimeout)
        )
      ]);

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

      await page.close();

      return {
        violations,
        score,
        totalTests: results.violations.length,
      };
    } catch (axeError) {
      console.error('[Puppeteer] Accessibility analysis failed:', axeError);
      await page.close();

      // Return fallback data instead of throwing
      return {
        violations: [],
        score: 0,
        totalTests: 0,
      };
    }
  } catch (error) {
    if (!page.isClosed()) {
      await page.close();
    }
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
