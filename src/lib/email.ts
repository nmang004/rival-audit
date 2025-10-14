import sgMail from '@sendgrid/mail';
import { Audit } from '@prisma/client';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: {
    content: string; // Base64 encoded
    filename: string;
    type: string;
    disposition: 'attachment';
  }[];
}

/**
 * Send email using SendGrid
 * Falls back to console logging if SendGrid is not configured
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'audits@example.com';

  // If SendGrid is not configured, log instead of sending
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[Email] SendGrid API key not configured, logging email instead:');
    console.log('[Email] To:', options.to);
    console.log('[Email] Subject:', options.subject);
    console.log('[Email] Attachments:', options.attachments?.map(a => a.filename).join(', ') || 'None');
    console.log('[Email] HTML Preview (first 200 chars):', options.html.substring(0, 200) + '...');
    return;
  }

  try {
    const msg = {
      to: Array.isArray(options.to) ? options.to : [options.to],
      from: fromEmail,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    };

    await sgMail.send(msg);
    console.log('[Email] Successfully sent to:', options.to);
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
    throw new Error('Failed to send email notification');
  }
}

/**
 * Generate HTML email template for audit signed notification
 */
function generateSignedEmailTemplate(
  audit: Audit,
  excelUrl: string,
  claudeAnalysis: string,
  auditUrl: string
): string {
  const domain = new URL(audit.url).hostname;

  // Extract first paragraph of Claude analysis for summary
  const summaryMatch = claudeAnalysis.match(/^(.+?)\n\n/);
  const summary = summaryMatch ? summaryMatch[1] : claudeAnalysis.substring(0, 300) + '...';

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 8px 0 0;
      opacity: 0.9;
      font-size: 16px;
    }
    .content {
      padding: 32px 24px;
    }
    .client-info {
      margin-bottom: 24px;
      padding: 20px;
      background: #f3f4f6;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    .client-info h2 {
      margin: 0 0 12px;
      font-size: 24px;
      color: #111827;
    }
    .client-info p {
      margin: 4px 0;
      font-size: 15px;
    }
    .client-info a {
      color: #2563eb;
      text-decoration: none;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 24px 0;
    }
    .metric-card {
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid #e5e7eb;
    }
    .metric-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .metric-value {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
    }
    .metric-value.good {
      color: #059669;
    }
    .metric-value.medium {
      color: #d97706;
    }
    .metric-value.poor {
      color: #dc2626;
    }
    .section {
      margin: 24px 0;
    }
    .section h3 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 12px;
    }
    .analysis-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 20px;
      line-height: 1.7;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      background: #2563eb;
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    .button:hover {
      background: #1d4ed8;
    }
    .attachments {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
    }
    .attachments p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    }
    .footer {
      padding: 24px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    @media only screen and (max-width: 600px) {
      .metrics {
        grid-template-columns: 1fr;
      }
      .header h1 {
        font-size: 24px;
      }
      .content {
        padding: 24px 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 New Project Signed!</h1>
      <p>SEO audit complete with strategic recommendations</p>
    </div>

    <div class="content">
      <div class="client-info">
        <h2>${audit.clientName || domain}</h2>
        <p><strong>Website:</strong> <a href="${audit.url}">${audit.url}</a></p>
        ${audit.clientEmail ? `<p><strong>Contact:</strong> ${audit.clientEmail}</p>` : ''}
      </div>

      <div class="section">
        <h3>Quick Metrics</h3>
        <div class="metrics">
          <div class="metric-card">
            <div class="metric-label">SEO Score</div>
            <div class="metric-value ${audit.seoScore && audit.seoScore >= 70 ? 'good' : audit.seoScore && audit.seoScore >= 50 ? 'medium' : 'poor'}">${audit.seoScore || 0}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Accessibility</div>
            <div class="metric-value ${audit.accessibilityScore && audit.accessibilityScore >= 70 ? 'good' : audit.accessibilityScore && audit.accessibilityScore >= 50 ? 'medium' : 'poor'}">${audit.accessibilityScore || 0}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Design Score</div>
            <div class="metric-value ${audit.designScore && audit.designScore >= 7 ? 'good' : audit.designScore && audit.designScore >= 5 ? 'medium' : 'poor'}">${audit.designScore || 0}/10</div>
          </div>
        </div>
      </div>

      ${audit.isHomepage && audit.totalKeywords ? `
      <div class="section">
        <h3>SEO Performance</h3>
        <div class="metric-card">
          <div class="metric-label">Total Keywords Ranking</div>
          <div class="metric-value good">${audit.totalKeywords.toLocaleString()}</div>
        </div>
      </div>
      ` : ''}

      <div class="section">
        <h3>Strategic Analysis Summary</h3>
        <div class="analysis-box">
          ${summary}
        </div>
      </div>

      <div class="button-container">
        <a href="${auditUrl}" class="button">View Full Audit Report</a>
      </div>

      <div class="attachments">
        <p><strong>📎 Attachments:</strong></p>
        <p>SEMRush keyword data and detailed analysis included as Excel spreadsheet.</p>
        <p>Download link: <a href="${excelUrl}">SEMRush_Report.xlsx</a></p>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated notification from your Sales SEO Audit Tool.</p>
      <p>Review the full audit report for detailed recommendations and next steps.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send audit signed notification to PM and Web Team
 */
export async function sendAuditSignedNotification(
  audit: Audit,
  excelUrl: string,
  claudeAnalysis: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const auditUrl = `${appUrl}/audits/${audit.id}`;
  const domain = new URL(audit.url).hostname;

  const recipients = [];
  if (process.env.PROJECT_MANAGER_EMAIL) {
    recipients.push(process.env.PROJECT_MANAGER_EMAIL);
  }
  if (process.env.WEB_TEAM_EMAIL) {
    recipients.push(process.env.WEB_TEAM_EMAIL);
  }

  // Default to console warning if no recipients configured
  if (recipients.length === 0) {
    console.warn('[Email] No email recipients configured (PROJECT_MANAGER_EMAIL, WEB_TEAM_EMAIL)');
    recipients.push('team@example.com'); // Fallback for logging
  }

  const html = generateSignedEmailTemplate(audit, excelUrl, claudeAnalysis, auditUrl);

  await sendEmail({
    to: recipients,
    subject: `🎉 New Project Signed: ${audit.clientName || domain}`,
    html,
  });

  console.log('[Email] Sent audit signed notification for:', audit.id);
}
