import Anthropic from '@anthropic-ai/sdk';
import { ClaudeAnalysisResult, AccessibilityResult } from '@/types';
import sharp from 'sharp';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Safety check and final compression for Claude API
// Ensures: dimensions < 8000px, size < 4.5MB, format = JPEG
async function resizeImageForClaude(imageBuffer: Buffer): Promise<Buffer> {
  const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB to leave buffer below 5MB
  const MAX_DIMENSION = 7500; // Claude's limit is 8000px, leave buffer

  const originalSize = imageBuffer.length;
  console.log(`[Claude] Checking image: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);

  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    console.log('[Claude] Unable to read image metadata, applying default compression');
    const fallback = await sharp(imageBuffer)
      .resize(7500, 7500, { fit: 'inside' })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();
    console.log(`[Claude] Fallback: ${(fallback.length / 1024 / 1024).toFixed(2)}MB`);
    return fallback;
  }

  const width = metadata.width;
  const height = metadata.height;
  console.log(`[Claude] Image dimensions: ${width}x${height}`);

  // Safety check: Dimensions MUST be under 8000px
  let workingBuffer = imageBuffer;
  const needsDimensionResize = width > MAX_DIMENSION || height > MAX_DIMENSION;

  if (needsDimensionResize) {
    console.log(`[Claude] ⚠️ Dimensions exceed ${MAX_DIMENSION}px! Resizing...`);
    workingBuffer = await sharp(imageBuffer)
      .resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    const resizedMeta = await sharp(workingBuffer).metadata();
    console.log(`[Claude] Resized to: ${resizedMeta.width}x${resizedMeta.height}, ${(workingBuffer.length / 1024 / 1024).toFixed(2)}MB`);
  }

  // If already under size limit and is JPEG, return as-is
  if (workingBuffer.length <= MAX_FILE_SIZE && metadata.format === 'jpeg' && !needsDimensionResize) {
    console.log('[Claude] ✓ Image already meets requirements');
    return workingBuffer;
  }

  // If under size but needed dimension resize or format conversion
  if (workingBuffer.length <= MAX_FILE_SIZE) {
    const final = await sharp(workingBuffer)
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();
    console.log(`[Claude] ✓ Final: ${(final.length / 1024 / 1024).toFixed(2)}MB`);
    return final;
  }

  // Compress by quality to meet file size requirement
  console.log('[Claude] Applying quality compression...');
  let quality = 80;
  let compressed = workingBuffer;

  while (quality >= 40) {
    compressed = await sharp(workingBuffer)
      .jpeg({ quality, progressive: true })
      .toBuffer();

    const compressedSize = compressed.length;
    console.log(`[Claude] Quality ${quality}: ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);

    if (compressedSize <= MAX_FILE_SIZE) {
      console.log(`[Claude] ✓ Compressed to ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);
      return compressed;
    }

    quality -= 10;
  }

  // Further reduce dimensions if still too large
  console.log('[Claude] Still too large, reducing dimensions further...');
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
    console.log(`[Claude] ${targetWidth}x${targetHeight}: ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);

    if (compressedSize <= MAX_FILE_SIZE) {
      console.log(`[Claude] ✓ Resized to ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);
      return compressed;
    }
  }

  // Last resort
  console.log('[Claude] Using maximum compression...');
  compressed = await sharp(workingBuffer)
    .resize(2000, 2000, { fit: 'inside' })
    .jpeg({ quality: 60, progressive: true })
    .toBuffer();

  console.log(`[Claude] Final: ${(compressed.length / 1024 / 1024).toFixed(2)}MB`);
  return compressed;
}

// Retry helper with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error as Error;
      const isRetryable = (error as { status?: number }).status === 529;

      if (!isRetryable || attempt === maxRetries - 1) {
        throw error;
      }

      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Claude API overloaded, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Analyze a single screenshot
async function analyzeSingleScreenshot(
  screenshot: Buffer,
  viewportType: 'desktop' | 'mobile',
  url: string,
  contextData: string
): Promise<{ designScore: number; observations: string[] }> {
  const resized = await resizeImageForClaude(screenshot);

  const message = await retryWithBackoff(() => anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: resized.toString('base64'),
            },
          },
          {
            type: 'text',
            text: `Analyze this ${viewportType} screenshot of ${url}.

${contextData}

Evaluate based on these criteria:
1. **Design Modernity**: Visual design, typography, color scheme, overall aesthetic
2. **UI/UX Quality**: Navigation clarity, call-to-action prominence, user flow
3. **Visual Hierarchy**: Information architecture and content organization
4. **Brand Perception**: Professional appearance and trust signals
${viewportType === 'mobile' ? '5. **Mobile Optimization**: Touch targets, readability, responsive layout' : '5. **Desktop Layout**: Use of space, content density, visual balance'}

Provide a JSON response:
{
  "designScore": <number 1-10>,
  "observations": ["<specific observation 1>", "<specific observation 2>", "<specific observation 3>", "<specific observation 4>"]
}`,
          },
        ],
      },
    ],
  }));

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return { designScore: 5, observations: [] };
  }

  return JSON.parse(jsonMatch[0]);
}

export async function analyzeWithClaude(
  desktopScreenshot: Buffer,
  mobileScreenshot: Buffer,
  url: string,
  accessibilityData: AccessibilityResult,
  seoData: {
    metaTitle?: string;
    metaDescription?: string;
    h1Tags?: string[];
  }
): Promise<ClaudeAnalysisResult> {
  try {
    const contextData = `CONTEXT:
- Accessibility Score: ${accessibilityData.score}/100
- Violations: ${accessibilityData.violations.length} (${accessibilityData.violations.filter((v) => v.impact === 'critical').length} critical)
- Meta Title: ${seoData.metaTitle || 'Missing'}
- H1 Tags: ${seoData.h1Tags?.length || 0}`;

    // Analyze desktop and mobile separately to reduce payload
    console.log('[Claude] Analyzing desktop screenshot...');
    const desktopAnalysis = await analyzeSingleScreenshot(
      desktopScreenshot,
      'desktop',
      url,
      contextData
    );

    console.log('[Claude] Analyzing mobile screenshot...');
    const mobileAnalysis = await analyzeSingleScreenshot(
      mobileScreenshot,
      'mobile',
      url,
      contextData
    );

    // Combine analyses with a final synthesis request
    console.log('[Claude] Synthesizing final analysis...');
    const message = await retryWithBackoff(() => anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `You are an expert web design and UX analyst. Create a comprehensive sales-ready audit report for ${url}.

DESKTOP ANALYSIS (Score: ${desktopAnalysis.designScore}/10):
${desktopAnalysis.observations.map((obs, i) => `${i + 1}. ${obs}`).join('\n')}

MOBILE ANALYSIS (Score: ${mobileAnalysis.designScore}/10):
${mobileAnalysis.observations.map((obs, i) => `${i + 1}. ${obs}`).join('\n')}

${contextData}

EVALUATION CRITERIA:
1. **Design Modernity**: Visual design, typography, color scheme, and overall aesthetic
2. **Mobile Responsiveness**: Compare desktop vs mobile experience quality
3. **UI/UX Quality**: Navigation clarity, call-to-action prominence, user flow
4. **Visual Hierarchy**: Information architecture and content organization
5. **Brand Perception**: Professional appearance and trust signals
6. **Accessibility Impact**: How accessibility issues affect user experience
7. **Competitive Positioning**: How it compares to modern web standards

Create a comprehensive JSON report:
{
  "designScore": <average of desktop and mobile scores, 1-10>,
  "analysis": "<2-3 paragraph professional analysis covering the criteria above, suitable for presenting to a potential client>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "weaknesses": ["<specific weakness 1>", "<specific weakness 2>", "<specific weakness 3>"],
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", "<actionable recommendation 3>", "<actionable recommendation 4>", "<actionable recommendation 5>"]
}

Make it persuasive and highlight opportunities for improvement while acknowledging what works well. Format professionally for a sales pitch.`,
        },
      ],
    }));

    // Parse Claude's response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response (Claude might include explanatory text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Claude response as JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]) as ClaudeAnalysisResult;

    return {
      designScore: Math.max(1, Math.min(10, parsed.designScore)),
      analysis: parsed.analysis,
      recommendations: parsed.recommendations.slice(0, 5),
      strengths: parsed.strengths.slice(0, 3),
      weaknesses: parsed.weaknesses.slice(0, 3),
    };
  } catch (error) {
    console.error('Error analyzing with Claude:', error);
    throw new Error('Failed to analyze website with Claude AI');
  }
}

export async function analyzeSitemapForGaps(
  urls: string[],
  domain: string
): Promise<{ contentGaps: unknown[]; urlStructureIssues: unknown[] }> {
  try {
    const message = await retryWithBackoff(() => anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Analyze this sitemap for content gaps and URL structure issues.

Domain: ${domain}
Total URLs: ${urls.length}

URLs:
${urls.slice(0, 200).join('\n')}

${urls.length > 200 ? `... and ${urls.length - 200} more URLs` : ''}

Please identify:
1. **Content Gaps**: Missing essential pages that most businesses should have (About, Contact, Services, Blog, etc.)
2. **URL Structure Issues**: Inconsistent patterns, overly complex URLs, poor SEO structure

Respond in this JSON format:
{
  "contentGaps": [
    {"category": "<category>", "description": "<description>", "priority": "high|medium|low", "suggestedPages": ["<page1>", "<page2>"]}
  ],
  "urlStructureIssues": [
    {"type": "<issue type>", "description": "<description>", "affectedUrls": ["<url1>", "<url2>"], "recommendation": "<recommendation>"}
  ]
}`,
        },
      ],
    }));

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return { contentGaps: [], urlStructureIssues: [] };
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing sitemap:', error);
    return { contentGaps: [], urlStructureIssues: [] };
  }
}

/**
 * Generate strategic SEO recommendations for a signed client
 * Combines previous audit analysis with SEMRush data for actionable roadmap
 */
export async function analyzeWithClaudeForStrategy(
  audit: {
    url: string;
    seoScore: number | null;
    accessibilityScore: number | null;
    designScore: number | null;
    claudeAnalysis: string | null;
  },
  semrushData: {
    totalKeywords: number;
    organicTraffic: number;
    keywords: Array<{
      keyword: string;
      position: number;
      volume: number;
      difficulty: number;
    }>;
    topPages: Array<{
      url: string;
      traffic: number;
      keywords: number;
      position: number;
    }>;
  }
): Promise<string> {
  try {
    // Get top keywords for analysis
    const topKeywords = semrushData.keywords
      .slice(0, 10)
      .map(k => `${k.keyword} (Pos: ${k.position}, Vol: ${k.volume})`)
      .join('\n');

    // Get underperforming keywords (positions 11-20)
    const underperformingKeywords = semrushData.keywords
      .filter(k => k.position > 10 && k.position <= 20)
      .slice(0, 5)
      .map(k => `${k.keyword} (Pos: ${k.position}, Vol: ${k.volume})`)
      .join('\n');

    const message = await retryWithBackoff(() => anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3072,
      messages: [
        {
          role: 'user',
          content: `You are an expert SEO strategist. A new client has just signed with us and you need to provide actionable strategic recommendations for their project kickoff.

CLIENT INFORMATION:
- Website: ${audit.url}
- SEO Score: ${audit.seoScore || 'N/A'}/100
- Accessibility Score: ${audit.accessibilityScore || 'N/A'}/100
- Design Score: ${audit.designScore || 'N/A'}/10

PREVIOUS AUDIT ANALYSIS:
${audit.claudeAnalysis || 'No previous analysis available'}

SEMRUSH DATA:
- Total Keywords Ranking: ${semrushData.totalKeywords.toLocaleString()}
- Estimated Monthly Traffic: ${semrushData.organicTraffic.toLocaleString()}

TOP PERFORMING KEYWORDS:
${topKeywords}

UNDERPERFORMING KEYWORDS (11-20):
${underperformingKeywords}

TOP TRAFFIC PAGES:
${semrushData.topPages.slice(0, 5).map(p => `${p.url} (Traffic: ${p.traffic}, Keywords: ${p.keywords})`).join('\n')}

TASK:
Create a comprehensive strategic SEO roadmap for this client. The project team (PM and Web developers) will use this to plan their work. Format your response as a detailed markdown document with the following sections:

## 1. Executive Summary
Brief overview of the client's current position and key opportunities (2-3 sentences)

## 2. Quick Wins (0-30 days)
- List 3-5 immediate actions that will show fast results
- Focus on low-hanging fruit (technical fixes, easy optimizations)
- Be specific with page URLs and exact changes

## 3. Medium-Term Strategy (1-3 months)
- Content strategy based on keyword opportunities
- Technical SEO improvements needed
- UX/UI enhancements that impact SEO
- Specific recommendations for underperforming keywords

## 4. Long-Term Growth (3-6 months)
- Authority building opportunities
- Content expansion areas based on gaps
- Competitive positioning strategies
- Link building recommendations

## 5. Priority Action Items
Create a numbered list of the top 5 most important tasks to start immediately:
1. [Task] - Impact: [High/Medium/Low] | Effort: [High/Medium/Low] | Timeline: [X days/weeks]
2. [Task] - Impact: [High/Medium/Low] | Effort: [High/Medium/Low] | Timeline: [X days/weeks]
... (continue for 5 items)

## 6. Keyword Optimization Opportunities
### Underperforming Keywords to Optimize
- List specific keywords in positions 11-20 that could easily move to page 1
- Provide specific optimization tactics for each

### New Keyword Targets
- Based on gaps in current rankings
- Include search volume and difficulty assessment

## 7. Content Recommendations
- Specific pages to create or optimize
- Content topics based on keyword research
- Internal linking opportunities

## 8. Technical SEO Priorities
- Critical issues to address based on audit scores
- Performance optimization needs
- Accessibility improvements

Be specific, actionable, and data-driven. Focus on tangible outcomes the team can execute. Use markdown formatting with clear headers and bullet points.`,
        },
      ],
    }));

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    console.log('[Claude] Generated strategic analysis for signed client:', audit.url);

    return responseText;
  } catch (error) {
    console.error('Error generating strategic analysis with Claude:', error);
    // Return a fallback analysis
    return `# Strategic SEO Roadmap

## Executive Summary
Client website analysis complete. Focus areas: SEO optimization, technical improvements, and content strategy.

## Quick Wins (0-30 days)
- Optimize meta titles and descriptions
- Fix critical accessibility issues
- Improve page load performance
- Optimize top-performing pages

## Medium-Term Strategy (1-3 months)
- Content expansion based on keyword opportunities
- Technical SEO improvements
- Internal linking optimization

## Long-Term Growth (3-6 months)
- Authority building through content marketing
- Competitive positioning
- Link building campaigns

## Priority Action Items
1. Technical SEO audit - Impact: High | Effort: Medium | Timeline: 1 week
2. Content optimization - Impact: High | Effort: Medium | Timeline: 2 weeks
3. Accessibility fixes - Impact: Medium | Effort: Low | Timeline: 1 week
4. Performance optimization - Impact: High | Effort: Medium | Timeline: 2 weeks
5. Keyword research expansion - Impact: Medium | Effort: Low | Timeline: 1 week`;
  }
}
