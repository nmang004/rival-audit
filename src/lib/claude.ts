import Anthropic from '@anthropic-ai/sdk';
import { ClaudeAnalysisResult, AccessibilityResult } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

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
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: desktopScreenshot.toString('base64'),
              },
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: mobileScreenshot.toString('base64'),
              },
            },
            {
              type: 'text',
              text: `You are an expert web design and UX analyst performing a comprehensive website audit for a sales team.

URL: ${url}

CONTEXT DATA:
- Accessibility Score: ${accessibilityData.score}/100
- Total Accessibility Violations: ${accessibilityData.violations.length}
- Critical Violations: ${accessibilityData.violations.filter((v) => v.impact === 'critical').length}
- Meta Title: ${seoData.metaTitle || 'Missing'}
- Meta Description: ${seoData.metaDescription || 'Missing'}
- H1 Tags: ${seoData.h1Tags?.join(', ') || 'None found'}

TASK:
Analyze the desktop and mobile screenshots provided and give a comprehensive assessment suitable for presenting to a potential client.

Please provide your analysis in the following JSON format:
{
  "designScore": <number 1-10>,
  "analysis": "<comprehensive multi-paragraph analysis>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>", "<recommendation 4>", "<recommendation 5>"]
}

ANALYSIS CRITERIA:
1. **Design Modernity** (1-10 score): Evaluate visual design, typography, color scheme, and overall aesthetic
2. **Mobile Responsiveness**: Compare desktop vs mobile experience
3. **UI/UX Quality**: Navigation clarity, call-to-action prominence, user flow
4. **Visual Hierarchy**: Information architecture and content organization
5. **Brand Perception**: Professional appearance and trust signals
6. **Accessibility Impact**: How accessibility issues affect user experience
7. **Competitive Positioning**: How it compares to modern web standards

The analysis should be persuasive and highlight opportunities for improvement while acknowledging what works well. Format it professionally for a sales pitch to the website owner.`,
            },
          ],
        },
      ],
    });

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
): Promise<{ contentGaps: any[]; urlStructureIssues: any[] }> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
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
    });

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
