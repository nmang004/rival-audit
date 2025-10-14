import prisma from '../prisma';
import { getSEMRushData } from '../semrush';
import { generateSEMRushExcel } from '../excel-generator';
import { uploadFile } from '../storage';
import { sendAuditSignedNotification } from '../email';
import { sendAuditSignedSlackNotification } from '../slack';
import { analyzeWithClaudeForStrategy } from '../claude';
import { SEMRushData } from '@/types';
import { Prisma } from '@prisma/client';

export interface SignedWorkflowResult {
  excelUrl: string | null;
  strategicAnalysis: string | null;
  notificationsSent: {
    email: boolean;
    slack: boolean;
  };
}

/**
 * Execute complete signed status workflow
 * This is triggered when an audit status changes to SIGNED
 */
export async function executeSignedWorkflow(
  auditId: string
): Promise<SignedWorkflowResult> {
  console.log(`[Signed Workflow ${auditId}] Starting workflow execution...`);

  const result: SignedWorkflowResult = {
    excelUrl: null,
    strategicAnalysis: null,
    notificationsSent: {
      email: false,
      slack: false,
    },
  };

  try {
    // Step 1: Fetch the audit from database
    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
    });

    if (!audit) {
      console.error(`[Signed Workflow ${auditId}] Audit not found`);
      throw new Error('Audit not found');
    }

    console.log(`[Signed Workflow ${auditId}] Audit found:`, audit.url);

    // Step 2: Fetch full SEMRush data (if homepage)
    let semrushData: SEMRushData | null = null;

    if (audit.isHomepage) {
      console.log(`[Signed Workflow ${auditId}] Homepage detected, fetching full SEMRush data...`);
      try {
        semrushData = await getSEMRushData(audit.url);
        console.log(`[Signed Workflow ${auditId}] SEMRush data retrieved:`, {
          totalKeywords: semrushData.totalKeywords,
          keywordCount: semrushData.keywords.length,
          topPagesCount: semrushData.topPages.length,
        });

        // Store SEMRush data in audit
        await prisma.audit.update({
          where: { id: auditId },
          data: {
            semrushData: semrushData as unknown as Prisma.InputJsonValue,
          },
        });
      } catch (error) {
        console.error(`[Signed Workflow ${auditId}] Failed to fetch SEMRush data:`, error);
        // Continue workflow even if SEMRush fails
      }
    } else {
      console.log(`[Signed Workflow ${auditId}] Not a homepage, skipping SEMRush data fetch`);
    }

    // Step 3: Generate Excel report (if we have SEMRush data)
    if (semrushData) {
      console.log(`[Signed Workflow ${auditId}] Generating Excel report...`);
      try {
        const domain = new URL(audit.url).hostname;
        const excelBuffer = await generateSEMRushExcel({
          domain,
          semrushData,
          clientName: audit.clientName || undefined,
          auditDate: new Date(),
        });

        // Step 4: Upload Excel to storage
        console.log(`[Signed Workflow ${auditId}] Uploading Excel to storage...`);
        const excelFilename = `SEMRush_Report_${domain}_${Date.now()}.xlsx`;
        const excelUrl = await uploadFile(excelBuffer, excelFilename);

        result.excelUrl = excelUrl;

        // Store Excel URL in database
        await prisma.audit.update({
          where: { id: auditId },
          data: {
            excelReportUrl: excelUrl,
          },
        });

        console.log(`[Signed Workflow ${auditId}] Excel uploaded:`, excelUrl);
      } catch (error) {
        console.error(`[Signed Workflow ${auditId}] Failed to generate/upload Excel:`, error);
        // Continue workflow even if Excel generation fails
      }
    }

    // Step 5: Generate strategic analysis with Claude (if we have SEMRush data)
    if (semrushData) {
      console.log(`[Signed Workflow ${auditId}] Generating strategic analysis with Claude...`);
      try {
        const strategicAnalysis = await analyzeWithClaudeForStrategy(
          {
            url: audit.url,
            seoScore: audit.seoScore,
            accessibilityScore: audit.accessibilityScore,
            designScore: audit.designScore,
            claudeAnalysis: audit.claudeAnalysis,
          },
          semrushData
        );

        result.strategicAnalysis = strategicAnalysis;

        // Append strategic analysis to existing Claude analysis
        const enhancedAnalysis = `${audit.claudeAnalysis || ''}\n\n---\n\n# Strategic SEO Roadmap\n\n${strategicAnalysis}`;

        await prisma.audit.update({
          where: { id: auditId },
          data: {
            claudeAnalysis: enhancedAnalysis,
          },
        });

        console.log(`[Signed Workflow ${auditId}] Strategic analysis generated and stored`);
      } catch (error) {
        console.error(`[Signed Workflow ${auditId}] Failed to generate strategic analysis:`, error);
        // Continue workflow even if strategic analysis fails
      }
    }

    // Step 6: Send email notification
    if (result.excelUrl) {
      console.log(`[Signed Workflow ${auditId}] Sending email notification...`);
      try {
        await sendAuditSignedNotification(
          audit,
          result.excelUrl,
          result.strategicAnalysis || audit.claudeAnalysis || 'No analysis available'
        );

        result.notificationsSent.email = true;
        console.log(`[Signed Workflow ${auditId}] Email notification sent successfully`);
      } catch (error) {
        console.error(`[Signed Workflow ${auditId}] Failed to send email:`, error);
        // Continue workflow even if email fails
      }
    } else {
      console.log(`[Signed Workflow ${auditId}] Skipping email notification (no Excel report)`);
    }

    // Step 7: Send Slack notification
    if (result.excelUrl) {
      console.log(`[Signed Workflow ${auditId}] Sending Slack notification...`);
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const auditUrl = `${appUrl}/audits/${auditId}`;

        await sendAuditSignedSlackNotification({
          audit,
          excelUrl: result.excelUrl,
          auditUrl,
        });

        result.notificationsSent.slack = true;
        console.log(`[Signed Workflow ${auditId}] Slack notification sent successfully`);
      } catch (error) {
        console.error(`[Signed Workflow ${auditId}] Failed to send Slack notification:`, error);
        // Continue workflow even if Slack fails
      }
    } else {
      console.log(`[Signed Workflow ${auditId}] Skipping Slack notification (no Excel report)`);
    }

    // Step 8: Log completion
    console.log(`[Signed Workflow ${auditId}] Workflow completed successfully:`, {
      excelUrl: result.excelUrl,
      strategicAnalysis: !!result.strategicAnalysis,
      emailSent: result.notificationsSent.email,
      slackSent: result.notificationsSent.slack,
    });

    return result;
  } catch (error) {
    console.error(`[Signed Workflow ${auditId}] Workflow failed:`, error);
    throw error;
  }
}
