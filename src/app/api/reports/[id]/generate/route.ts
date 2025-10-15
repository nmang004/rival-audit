import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { generatePDFReport } from '@/lib/pdf-generator';
import { uploadPDF } from '@/lib/storage';
import { ApiResponse, PDFGenerationResult, AuditWithScores, KeywordTrendData, TopPage } from '@/types';
import { Prisma } from '@prisma/client';

/**
 * POST /api/reports/[id]/generate - Generate PDF for report
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    console.log('[PDF Generation API] Starting PDF generation for report:', id);

    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch report with all audits
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        createdBy: true,
        reportAudits: {
          include: {
            audit: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (report.createdById !== dbUser.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You do not have permission to generate PDF for this report' },
        { status: 403 }
      );
    }

    // Transform audits to AuditWithScores format
    const auditsWithScores: AuditWithScores[] = report.reportAudits.map(ra => {
      const audit = ra.audit;

      // Parse JSON fields safely
      let keywordTrendData: KeywordTrendData[] | null = null;
      let topPages: TopPage[] | null = null;

      if (audit.keywordTrendData) {
        try {
          const parsed = audit.keywordTrendData as Prisma.JsonValue;
          if (Array.isArray(parsed)) {
            keywordTrendData = parsed as KeywordTrendData[];
          }
        } catch (e) {
          console.warn('[PDF Generation] Failed to parse keywordTrendData for audit', audit.id);
        }
      }

      if (audit.topPages) {
        try {
          const parsed = audit.topPages as Prisma.JsonValue;
          if (Array.isArray(parsed)) {
            topPages = parsed as TopPage[];
          }
        } catch (e) {
          console.warn('[PDF Generation] Failed to parse topPages for audit', audit.id);
        }
      }

      return {
        id: audit.id,
        url: audit.url,
        clientName: audit.clientName,
        seoScore: audit.seoScore,
        accessibilityScore: audit.accessibilityScore,
        designScore: audit.designScore,
        claudeAnalysis: audit.claudeAnalysis,
        screenshotDesktop: audit.screenshotDesktop,
        screenshotMobile: audit.screenshotMobile,
        isHomepage: audit.isHomepage,
        totalKeywords: audit.totalKeywords,
        createdAt: audit.createdAt,
        keywordTrendData,
        topPages,
      };
    });

    // Generate PDF
    console.log('[PDF Generation API] Generating PDF with', auditsWithScores.length, 'audits');

    const pdfBuffer = await generatePDFReport({
      reportId: report.id,
      reportName: report.name,
      reportDescription: report.description || undefined,
      audits: auditsWithScores,
      generatedBy: dbUser.name,
      generatedDate: new Date(),
    });

    // Upload PDF to storage
    const filename = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}_Report.pdf`;
    const pdfUrl = await uploadPDF(pdfBuffer, filename, report.id);

    console.log('[PDF Generation API] PDF uploaded to:', pdfUrl);

    // Update report record with PDF URL
    await prisma.report.update({
      where: { id },
      data: { pdfUrl },
    });

    const result: PDFGenerationResult = {
      pdfUrl,
      generatedAt: new Date(),
      fileSize: pdfBuffer.length,
    };

    return NextResponse.json<ApiResponse<PDFGenerationResult>>({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[PDF Generation API] Error generating PDF:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
