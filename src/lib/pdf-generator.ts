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
      justify-content: space-between;
      background: linear-gradient(135deg, #002264 0%, #003387 50%, #002264 100%);
      color: white;
      page-break-after: always;
      padding: 60px;
      text-align: center;
    }

    .cover-brand {
      margin-bottom: 40px;
    }

    .brand-logo {
      font-size: 48px;
      font-weight: 900;
      letter-spacing: 3px;
      color: #f78d30;
      margin-bottom: 12px;
      text-transform: uppercase;
    }

    .brand-tagline {
      font-size: 18px;
      opacity: 0.95;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      font-weight: 300;
    }

    .cover-title {
      font-size: 64px;
      font-weight: bold;
      margin: 60px 0 30px;
      line-height: 1.2;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .cover-description {
      font-size: 22px;
      margin: 0 auto 80px;
      max-width: 800px;
      opacity: 0.95;
      line-height: 1.7;
    }

    .cover-stats {
      margin: 80px 0;
    }

    .stat-large {
      display: inline-block;
      padding: 40px 80px;
      background: rgba(247, 141, 48, 0.15);
      border: 4px solid #f78d30;
      border-radius: 20px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .stat-number {
      font-size: 96px;
      font-weight: bold;
      color: #f78d30;
      line-height: 1;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .stat-label {
      font-size: 24px;
      margin-top: 15px;
      opacity: 0.95;
      font-weight: 300;
    }

    .cover-meta {
      font-size: 18px;
      opacity: 0.85;
      line-height: 2;
      font-weight: 300;
    }

    .cover-footer {
      font-size: 16px;
      opacity: 0.75;
      border-top: 1px solid rgba(255, 255, 255, 0.25);
      padding-top: 30px;
      line-height: 2;
    }

    .cover-footer-brand {
      font-weight: 600;
      color: #f78d30;
      margin-bottom: 8px;
    }

    .overview-box {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 3px solid #002264;
      border-radius: 16px;
      padding: 40px;
      margin: 40px 0;
      box-shadow: 0 4px 12px rgba(0, 34, 100, 0.1);
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
      margin-top: 30px;
    }

    .overview-item {
      text-align: center;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .overview-label {
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .overview-value {
      font-size: 42px;
      font-weight: bold;
      color: #002264;
      line-height: 1;
    }

    .summary-table {
      margin: 40px 0;
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .summary-table thead th {
      background: #002264;
      color: white;
      font-weight: bold;
      padding: 18px;
      text-align: left;
      font-size: 14px;
      letter-spacing: 0.5px;
    }

    .summary-table tbody tr {
      background: white;
    }

    .summary-table tbody tr:nth-child(even) {
      background: #f9fafb;
    }

    .summary-table tbody td {
      padding: 16px 18px;
      border-bottom: 1px solid #e5e7eb;
    }

    .score-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 14px;
    }

    .score-badge.excellent {
      background: #10b981;
      color: white;
    }

    .score-badge.good {
      background: #3b82f6;
      color: white;
    }

    .score-badge.medium {
      background: #f59e0b;
      color: white;
    }

    .score-badge.poor {
      background: #ef4444;
      color: white;
    }

    .recommendations-section {
      margin: 40px 0;
    }

    .recommendation-priority {
      background: linear-gradient(to right, #fff7ed, #ffffff);
      border-left: 6px solid #f78d30;
      padding: 25px 30px;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(247, 141, 48, 0.1);
    }

    .recommendation-priority h4 {
      color: #002264;
      margin: 0 0 12px 0;
      font-size: 20px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .recommendation-priority p {
      color: #4b5563;
      margin: 0;
      line-height: 1.7;
      font-size: 15px;
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
      <!-- Rival Digital Branding -->
      <div class="cover-brand">
        <div class="brand-logo">RIVAL DIGITAL</div>
        <div class="brand-tagline">Sales SEO Audit Report</div>
      </div>

      <!-- Report Title -->
      <div class="cover-title">${escapeHtml(options.reportName)}</div>

      <!-- Description -->
      ${options.reportDescription ? `
        <div class="cover-description">${escapeHtml(options.reportDescription)}</div>
      ` : ''}

      <!-- Audit Count -->
      <div class="cover-stats">
        <div class="stat-large">
          <div class="stat-number">${options.audits.length}</div>
          <div class="stat-label">${options.audits.length === 1 ? 'Website' : 'Websites'} Analyzed</div>
        </div>
      </div>

      <!-- Generation Info -->
      <div class="cover-meta">
        <div><strong>Generated:</strong> ${formatDate(options.generatedDate)}</div>
        <div><strong>Prepared by:</strong> ${escapeHtml(options.generatedBy)}</div>
      </div>

      <!-- Footer -->
      <div class="cover-footer">
        <div class="cover-footer-brand">Rival Digital</div>
        <div>www.rivaldigital.com | Professional SEO Audit Services</div>
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

      <!-- Overview Box -->
      <div class="overview-box">
        <h2 style="margin-top: 0;">Report Overview</h2>
        <div class="overview-grid">
          <div class="overview-item">
            <div class="overview-label">Websites Analyzed</div>
            <div class="overview-value">${options.audits.length}</div>
          </div>
          <div class="overview-item">
            <div class="overview-label">Analysis Date</div>
            <div class="overview-value" style="font-size: 20px; font-weight: 600; color: #f78d30;">
              ${formatDate(options.generatedDate)}
            </div>
          </div>
          <div class="overview-item">
            <div class="overview-label">Total Keywords</div>
            <div class="overview-value">${totalKeywords.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <!-- Performance Summary Table -->
      <h2>Performance Summary</h2>
      <table class="summary-table">
        <thead>
          <tr>
            <th>Website</th>
            <th>SEO Score</th>
            <th>Accessibility</th>
            <th>Design</th>
          </tr>
        </thead>
        <tbody>
          ${options.audits.map(audit => `
            <tr>
              <td class="url-text" style="font-weight: 600;">${truncateUrl(audit.url, 45)}</td>
              <td><span class="score-badge ${getScoreBadgeClass(audit.seoScore)}">${audit.seoScore || 'N/A'}</span></td>
              <td><span class="score-badge ${getScoreBadgeClass(audit.accessibilityScore)}">${audit.accessibilityScore || 'N/A'}</span></td>
              <td><span class="score-badge ${getScoreBadgeClass(audit.designScore ? audit.designScore * 10 : null)}">${audit.designScore || 'N/A'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Recommendations -->
      <h2>Priority Recommendations</h2>
      <div class="recommendations-section">
        ${generateTopRecommendations(options.audits, avgSEO, avgA11y, avgDesign)}
      </div>

      <!-- Overall Performance Scores -->
      <h2>Overall Performance</h2>
      <div class="scores-container">
        <div>
          <div class="score-circle ${getScoreClass(avgSEO)}">
            ${avgSEO}
          </div>
          <div style="text-align: center; margin-top: 15px; font-weight: bold; font-size: 16px;">SEO Score</div>
        </div>
        <div>
          <div class="score-circle ${getScoreClass(avgA11y)}">
            ${avgA11y}
          </div>
          <div style="text-align: center; margin-top: 15px; font-weight: bold; font-size: 16px;">Accessibility</div>
        </div>
        <div>
          <div class="score-circle ${getScoreClass(avgDesign)}">
            ${avgDesign}
          </div>
          <div style="text-align: center; margin-top: 15px; font-weight: bold; font-size: 16px;">Design</div>
        </div>
      </div>
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

/**
 * Truncate URL for display
 */
function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    const path = urlObj.pathname + urlObj.search;

    if (domain.length + path.length > maxLength) {
      const availableLength = maxLength - domain.length - 3;
      if (availableLength > 10) {
        return domain + path.substring(0, availableLength) + '...';
      }
      return domain + '...';
    }

    return domain + path;
  } catch {
    return url.substring(0, maxLength) + '...';
  }
}

/**
 * Get score badge class based on value
 */
function getScoreBadgeClass(score: number | null): string {
  if (score === null) return 'poor';
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'medium';
  return 'poor';
}

/**
 * Generate top recommendations based on scores
 */
function generateTopRecommendations(
  audits: AuditWithScores[],
  avgSEO: number,
  avgA11y: number,
  avgDesign: number
): string {
  const recommendations: string[] = [];

  // SEO Recommendation
  if (avgSEO < 70) {
    recommendations.push(`
      <div class="recommendation-priority">
        <h4>🎯 Improve SEO Performance</h4>
        <p>Average SEO score of ${avgSEO}/100 indicates significant optimization opportunities. Focus on meta tags, heading structure, keyword optimization, and content quality to improve search engine rankings.</p>
      </div>
    `);
  } else if (avgSEO < 85) {
    recommendations.push(`
      <div class="recommendation-priority">
        <h4>🎯 Optimize SEO Further</h4>
        <p>With an average SEO score of ${avgSEO}/100, you're performing well but there's room for improvement. Fine-tune technical SEO elements and enhance content strategy.</p>
      </div>
    `);
  }

  // Accessibility Recommendation
  if (avgA11y < 80) {
    recommendations.push(`
      <div class="recommendation-priority">
        <h4>♿ Enhance Accessibility</h4>
        <p>Average accessibility score of ${avgA11y}/100 requires attention. Prioritize WCAG 2.1 Level AA compliance for better user experience, legal compliance, and broader audience reach.</p>
      </div>
    `);
  }

  // Design Recommendation
  if (avgDesign < 7) {
    recommendations.push(`
      <div class="recommendation-priority">
        <h4>🎨 Modernize Design</h4>
        <p>Average design score of ${avgDesign}/10 suggests design improvements are needed. Consider updating UI/UX elements, improving visual hierarchy, and ensuring mobile responsiveness.</p>
      </div>
    `);
  }

  // Keywords Recommendation
  const homepages = audits.filter(a => a.isHomepage);
  const withKeywords = homepages.filter(a => a.totalKeywords && a.totalKeywords > 0);

  if (homepages.length > 0 && withKeywords.length < homepages.length) {
    const missing = homepages.length - withKeywords.length;
    recommendations.push(`
      <div class="recommendation-priority">
        <h4>🔑 Expand Keyword Strategy</h4>
        <p>${missing} homepage${missing > 1 ? 's' : ''} missing comprehensive keyword data. Conduct thorough keyword research to identify high-value search terms and optimize content accordingly.</p>
      </div>
    `);
  }

  // Low-performing sites
  const poorSEO = audits.filter(a => a.seoScore && a.seoScore < 60);
  if (poorSEO.length > 0) {
    const urls = poorSEO.map(a => truncateUrl(a.url, 30)).join(', ');
    recommendations.push(`
      <div class="recommendation-priority">
        <h4>⚠️ Address Critical SEO Issues</h4>
        <p>${poorSEO.length} site${poorSEO.length > 1 ? 's' : ''} (${urls}) scoring below 60/100 require immediate attention. These sites may be losing significant organic traffic.</p>
      </div>
    `);
  }

  return recommendations.length > 0
    ? recommendations.join('')
    : '<div class="recommendation-priority"><h4>✅ Excellent Overall Performance</h4><p>No critical recommendations at this time. Continue monitoring performance and implementing incremental improvements.</p></div>';
}
