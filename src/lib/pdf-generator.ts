import puppeteer from 'puppeteer';
import { PDFGenerationOptions, AuditWithScores } from '@/types';

/**
 * Generate PDF report from multiple audits
 */
export async function generatePDFReport(
  options: PDFGenerationOptions
): Promise<Buffer> {
  console.log('[PDF Generator] Starting PDF generation for report:', options.reportId);

  // Generate complete HTML string
  const html = generateReportHTML(options);

  // Launch Puppeteer browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Set content and wait for images to load
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    // Generate PDF with proper formatting
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; padding: 5px 0; color: #666;">
          <span>${options.reportName}</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; padding: 5px 0; color: #666;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    });

    console.log('[PDF Generator] PDF generated successfully, size:', Math.round(pdf.length / 1024), 'KB');

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

/**
 * Generate complete HTML for the report
 */
function generateReportHTML(options: PDFGenerationOptions): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        ${getReportStyles()}
      </style>
    </head>
    <body>
      ${generateCoverPage(options)}
      ${generateExecutiveSummary(options)}
      ${options.audits.map(audit => generateAuditSection(audit)).join('')}
    </body>
    </html>
  `;
}

/**
 * CSS styles for the PDF
 */
function getReportStyles(): string {
  return `
    @page {
      size: A4;
      margin: 0;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      margin: 0;
      padding: 0;
    }

    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      page-break-after: always;
      padding: 40px;
      text-align: center;
    }

    .cover-title {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 20px;
    }

    .cover-description {
      font-size: 18px;
      margin-bottom: 40px;
      max-width: 600px;
      opacity: 0.9;
    }

    .cover-meta {
      font-size: 14px;
      opacity: 0.8;
      margin-top: 60px;
    }

    .section {
      page-break-before: always;
      padding: 40px;
    }

    .audit-section {
      page-break-before: always;
      padding: 40px;
    }

    .scores-container {
      display: flex;
      justify-content: space-around;
      margin: 30px 0;
      flex-wrap: wrap;
    }

    .score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: bold;
      margin: 10px;
    }

    .score-good { background: #10b981; color: white; }
    .score-medium { background: #f59e0b; color: white; }
    .score-poor { background: #ef4444; color: white; }

    .screenshot {
      max-width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin: 20px 0;
    }

    .two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 20px 0;
    }

    h1 {
      color: #111827;
      font-size: 32px;
      margin-bottom: 20px;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
    }

    h2 {
      color: #374151;
      font-size: 24px;
      margin-top: 30px;
      margin-bottom: 15px;
    }

    h3 {
      color: #4b5563;
      font-size: 18px;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    .recommendation {
      background: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 15px;
      margin: 10px 0;
    }

    .metric-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 10px 0;
    }

    .metric-label {
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 28px;
      font-weight: bold;
      color: #111827;
      margin-top: 5px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    th {
      background: #f3f4f6;
      font-weight: bold;
      color: #374151;
    }

    .url-text {
      color: #2563eb;
      word-break: break-all;
    }
  `;
}

/**
 * Generate cover page
 */
function generateCoverPage(options: PDFGenerationOptions): string {
  return `
    <div class="cover-page">
      <div class="cover-title">${escapeHtml(options.reportName)}</div>
      ${options.reportDescription ? `<div class="cover-description">${escapeHtml(options.reportDescription)}</div>` : ''}
      <div style="font-size: 24px; margin-top: 40px;">
        ${options.audits.length} ${options.audits.length === 1 ? 'Website' : 'Websites'} Analyzed
      </div>
      <div class="cover-meta">
        Generated on ${formatDate(options.generatedDate)}<br/>
        Prepared by ${escapeHtml(options.generatedBy)}
      </div>
    </div>
  `;
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(options: PDFGenerationOptions): string {
  const avgSEO = calculateAverage(options.audits.map(a => a.seoScore));
  const avgA11y = calculateAverage(options.audits.map(a => a.accessibilityScore));
  const avgDesign = calculateAverage(options.audits.map(a => a.designScore));
  const totalKeywords = options.audits.reduce((sum, a) => sum + (a.totalKeywords || 0), 0);

  return `
    <div class="section">
      <h1>Executive Summary</h1>

      <p>
        This report analyzes ${options.audits.length} website${options.audits.length === 1 ? '' : 's'}
        for SEO performance, accessibility compliance, and design quality.
      </p>

      <h2>Overall Performance</h2>

      <div class="scores-container">
        <div>
          <div class="score-circle ${getScoreClass(avgSEO)}">
            ${avgSEO}
          </div>
          <div style="text-align: center; margin-top: 10px; font-weight: bold;">SEO Score</div>
        </div>
        <div>
          <div class="score-circle ${getScoreClass(avgA11y)}">
            ${avgA11y}
          </div>
          <div style="text-align: center; margin-top: 10px; font-weight: bold;">Accessibility</div>
        </div>
        <div>
          <div class="score-circle ${getScoreClass(avgDesign)}">
            ${avgDesign}
          </div>
          <div style="text-align: center; margin-top: 10px; font-weight: bold;">Design</div>
        </div>
      </div>

      ${totalKeywords > 0 ? `
        <div class="metric-card">
          <div class="metric-label">Total Keywords Tracked</div>
          <div class="metric-value">${totalKeywords.toLocaleString()}</div>
        </div>
      ` : ''}

      <h2>Key Findings</h2>
      <ul>
        <li>Average SEO score of ${avgSEO}/100 across all analyzed websites</li>
        <li>Average accessibility score of ${avgA11y}/100, indicating ${avgA11y >= 80 ? 'good' : avgA11y >= 60 ? 'moderate' : 'poor'} compliance</li>
        <li>Average design score of ${avgDesign}/10, reflecting ${avgDesign >= 8 ? 'excellent' : avgDesign >= 6 ? 'good' : 'needs improvement'} modern design practices</li>
        ${totalKeywords > 0 ? `<li>Tracking ${totalKeywords.toLocaleString()} total keywords across homepage${options.audits.filter(a => a.isHomepage).length > 1 ? 's' : ''}</li>` : ''}
      </ul>
    </div>
  `;
}

/**
 * Generate individual audit section
 */
function generateAuditSection(audit: AuditWithScores): string {
  return `
    <div class="audit-section">
      <h1>${escapeHtml(audit.url)}</h1>

      ${audit.clientName ? `<p><strong>Client:</strong> ${escapeHtml(audit.clientName)}</p>` : ''}

      <h2>Performance Scores</h2>

      <div class="scores-container">
        ${audit.seoScore !== null ? `
          <div>
            <div class="score-circle ${getScoreClass(audit.seoScore)}">
              ${audit.seoScore}
            </div>
            <div style="text-align: center; margin-top: 10px; font-weight: bold;">SEO</div>
          </div>
        ` : ''}
        ${audit.accessibilityScore !== null ? `
          <div>
            <div class="score-circle ${getScoreClass(audit.accessibilityScore)}">
              ${audit.accessibilityScore}
            </div>
            <div style="text-align: center; margin-top: 10px; font-weight: bold;">Accessibility</div>
          </div>
        ` : ''}
        ${audit.designScore !== null ? `
          <div>
            <div class="score-circle ${getScoreClass(audit.designScore * 10)}">
              ${audit.designScore}
            </div>
            <div style="text-align: center; margin-top: 10px; font-weight: bold;">Design</div>
          </div>
        ` : ''}
      </div>

      ${audit.isHomepage && audit.totalKeywords ? `
        <div class="metric-card">
          <div class="metric-label">Total Keywords</div>
          <div class="metric-value">${audit.totalKeywords.toLocaleString()}</div>
        </div>
      ` : ''}

      ${audit.screenshotDesktop || audit.screenshotMobile ? `
        <h2>Screenshots</h2>
        <div class="two-column">
          ${audit.screenshotDesktop ? `
            <div>
              <h3>Desktop View</h3>
              <img src="${audit.screenshotDesktop}" class="screenshot" alt="Desktop Screenshot" />
            </div>
          ` : ''}
          ${audit.screenshotMobile ? `
            <div>
              <h3>Mobile View</h3>
              <img src="${audit.screenshotMobile}" class="screenshot" alt="Mobile Screenshot" />
            </div>
          ` : ''}
        </div>
      ` : ''}

      ${audit.claudeAnalysis ? `
        <h2>AI Analysis</h2>
        <div class="recommendation">
          ${escapeHtml(audit.claudeAnalysis).replace(/\n/g, '<br/>')}
        </div>
      ` : ''}

      ${audit.topPages && audit.topPages.length > 0 ? `
        <h2>Top Pages by Traffic</h2>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Traffic</th>
              <th>Keywords</th>
            </tr>
          </thead>
          <tbody>
            ${audit.topPages.slice(0, 5).map(page => `
              <tr>
                <td class="url-text">${escapeHtml(page.url)}</td>
                <td>${page.traffic.toLocaleString()}</td>
                <td>${page.keywords}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}
    </div>
  `;
}

/**
 * Calculate average of numbers, ignoring nulls
 */
function calculateAverage(numbers: (number | null)[]): number {
  const valid = numbers.filter((n): n is number => n !== null);
  if (valid.length === 0) return 0;
  const sum = valid.reduce((a, b) => a + b, 0);
  return Math.round(sum / valid.length);
}

/**
 * Get CSS class for score
 */
function getScoreClass(score: number | null): string {
  if (score === null) return 'score-poor';
  if (score >= 80) return 'score-good';
  if (score >= 60) return 'score-medium';
  return 'score-poor';
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
