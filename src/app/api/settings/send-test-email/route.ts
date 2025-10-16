import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { sendEmail } from '@/lib/email';

// POST /api/settings/send-test-email - Send a test email
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user email from Clerk
    const user = await currentUser();

    if (!user?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    const userEmail = user.emailAddresses[0].emailAddress;
    const userName = user.firstName || 'User';

    // Send test email
    await sendEmail({
      to: userEmail,
      subject: '🧪 Test Email from Sales SEO Audit Tool',
      html: generateTestEmailTemplate(userName),
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${userEmail}`,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to send test email',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * Generate test email HTML template
 */
function generateTestEmailTemplate(userName: string): string {
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
      background: linear-gradient(135deg, oklch(0.24 0.13 265) 0%, oklch(0.20 0.11 265) 100%);
      color: white;
      padding: 40px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 600;
    }
    .header p {
      margin: 12px 0 0;
      opacity: 0.9;
      font-size: 16px;
    }
    .content {
      padding: 40px 24px;
    }
    .icon {
      font-size: 64px;
      text-align: center;
      margin-bottom: 24px;
    }
    .message-box {
      background: #f0fdf4;
      border: 2px solid #86efac;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      text-align: center;
    }
    .message-box h2 {
      color: #166534;
      margin: 0 0 12px;
      font-size: 24px;
    }
    .message-box p {
      color: #166534;
      margin: 0;
      font-size: 16px;
    }
    .info-section {
      background: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }
    .info-section h3 {
      margin: 0 0 12px;
      font-size: 18px;
      color: #111827;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-item:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 500;
      color: #6b7280;
    }
    .info-value {
      color: #111827;
    }
    .footer {
      padding: 24px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .cta-button {
      display: inline-block;
      background: oklch(0.71 0.15 60);
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 16px 0;
    }
    @media only screen and (max-width: 600px) {
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
      <h1>🎉 Success!</h1>
      <p>Your email notifications are working perfectly</p>
    </div>

    <div class="content">
      <div class="icon">✅</div>

      <div class="message-box">
        <h2>Test Email Delivered!</h2>
        <p>Your SendGrid integration is configured correctly and ready to use.</p>
      </div>

      <p>Hi ${userName},</p>

      <p>This is a test email from your Sales SEO Audit Tool settings page. If you're reading this, it means your email notifications are working perfectly!</p>

      <div class="info-section">
        <h3>What You Can Receive:</h3>
        <div class="info-item">
          <span class="info-label">Audit Completions</span>
          <span class="info-value">✓</span>
        </div>
        <div class="info-item">
          <span class="info-label">Status Changes</span>
          <span class="info-value">✓</span>
        </div>
        <div class="info-item">
          <span class="info-label">Weekly Digests</span>
          <span class="info-value">✓</span>
        </div>
        <div class="info-item">
          <span class="info-label">Project Notifications</span>
          <span class="info-value">✓</span>
        </div>
      </div>

      <p>You can customize your notification preferences anytime in your settings.</p>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings" class="cta-button">
          Go to Settings
        </a>
      </div>

      <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
        <strong>Tip:</strong> Make sure to add our email address to your contacts to ensure you never miss an important notification!
      </p>
    </div>

    <div class="footer">
      <p>This is a test message from your Sales SEO Audit Tool.</p>
      <p>Sent at ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>`;
}
