import { WebClient } from '@slack/web-api';
import { Audit } from '@prisma/client';

// Initialize Slack client if token is available
const slack = process.env.SLACK_BOT_TOKEN
  ? new WebClient(process.env.SLACK_BOT_TOKEN)
  : null;

export interface SlackNotificationOptions {
  audit: Audit;
  excelUrl: string;
  auditUrl: string;
}

/**
 * Get color based on score
 */
function getScoreColor(score: number | null, max = 100): string {
  if (!score) return '#6b7280'; // gray
  const percentage = max === 10 ? (score / 10) * 100 : score;
  if (percentage >= 70) return '#059669'; // green
  if (percentage >= 50) return '#d97706'; // orange
  return '#dc2626'; // red
}

/**
 * Format score display
 */
function formatScore(score: number | null, max = 100): string {
  if (!score) return 'N/A';
  return max === 10 ? `${score}/10` : `${score}/100`;
}

/**
 * Generate Slack Block Kit message
 */
function generateSlackBlocks(options: SlackNotificationOptions) {
  const { audit, excelUrl, auditUrl } = options;
  const domain = new URL(audit.url).hostname;

  // Determine overall color based on scores
  const avgScore = audit.seoScore && audit.accessibilityScore && audit.designScore
    ? Math.round((audit.seoScore + audit.accessibilityScore + (audit.designScore * 10)) / 3)
    : 50;
  const color = getScoreColor(avgScore);

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🎉 New Project Signed',
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Client:*\n${audit.clientName || domain}`,
        },
        {
          type: 'mrkdwn',
          text: `*Website:*\n<${audit.url}|${domain}>`,
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Performance Scores*',
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*SEO Score:*\n${formatScore(audit.seoScore)}`,
        },
        {
          type: 'mrkdwn',
          text: `*Accessibility:*\n${formatScore(audit.accessibilityScore)}`,
        },
        {
          type: 'mrkdwn',
          text: `*Design Score:*\n${formatScore(audit.designScore, 10)}`,
        },
        ...(audit.isHomepage && audit.totalKeywords
          ? [
              {
                type: 'mrkdwn',
                text: `*Keywords:*\n${audit.totalKeywords.toLocaleString()}`,
              },
            ]
          : []),
      ],
    },
  ];

  // Add AI analysis preview if available
  if (audit.claudeAnalysis) {
    const preview = audit.claudeAnalysis.substring(0, 200) + '...';
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*AI Analysis Preview:*\n${preview}`,
      },
    });
  }

  // Add action buttons
  blocks.push({
    type: 'divider',
  } as never);

  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'View Full Audit',
          emoji: true,
        },
        url: auditUrl,
        style: 'primary',
      },
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Download Excel Report',
          emoji: true,
        },
        url: excelUrl,
      },
    ],
  } as never);

  return { blocks, color };
}

/**
 * Send audit signed notification to Slack channel
 * Falls back to console logging if Slack is not configured
 */
export async function sendAuditSignedSlackNotification(
  options: SlackNotificationOptions
): Promise<void> {
  const channelId = process.env.SLACK_CHANNEL_ID;
  const domain = new URL(options.audit.url).hostname;

  // If Slack is not configured, log instead of sending
  if (!slack || !channelId) {
    console.warn('[Slack] Slack bot token or channel ID not configured, logging notification instead:');
    console.log('[Slack] Channel:', channelId || 'not-configured');
    console.log('[Slack] Message: New Project Signed -', options.audit.clientName || domain);
    console.log('[Slack] Audit URL:', options.auditUrl);
    console.log('[Slack] Excel URL:', options.excelUrl);
    return;
  }

  try {
    const { blocks, color } = generateSlackBlocks(options);

    await slack.chat.postMessage({
      channel: channelId,
      text: `New Project Signed: ${options.audit.clientName || domain}`, // Fallback text
      blocks,
      attachments: [
        {
          color,
          blocks: [],
        },
      ],
      unfurl_links: false,
      unfurl_media: false,
    });

    console.log('[Slack] Successfully posted notification for audit:', options.audit.id);
  } catch (error) {
    console.error('[Slack] Failed to post notification:', error);
    throw new Error('Failed to send Slack notification');
  }
}

/**
 * Send a simple test message to verify Slack configuration
 */
export async function sendTestSlackMessage(): Promise<boolean> {
  const channelId = process.env.SLACK_CHANNEL_ID;

  if (!slack || !channelId) {
    console.warn('[Slack] Cannot send test message - Slack not configured');
    return false;
  }

  try {
    await slack.chat.postMessage({
      channel: channelId,
      text: '✅ Slack integration test successful! Your Sales SEO Audit Tool is now connected.',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '✅ *Slack Integration Test*\n\nYour Sales SEO Audit Tool is now connected and ready to send notifications!',
          },
        },
      ],
    });

    console.log('[Slack] Test message sent successfully');
    return true;
  } catch (error) {
    console.error('[Slack] Failed to send test message:', error);
    return false;
  }
}
