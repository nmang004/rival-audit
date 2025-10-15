import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, ReportWithAudits } from '@/types';

/**
 * GET /api/reports/[id] - Get single report with all audits
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

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

    // Fetch report
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
        { success: false, error: 'You do not have permission to view this report' },
        { status: 403 }
      );
    }

    return NextResponse.json<ApiResponse<ReportWithAudits>>({
      success: true,
      data: report as ReportWithAudits,
    });
  } catch (error) {
    console.error('[Reports API] Error fetching report:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reports/[id] - Update report (name, description, audit order)
 * Body: { name?: string, description?: string, auditIds?: string[] }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

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

    // Fetch report
    const report = await prisma.report.findUnique({
      where: { id },
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
        { success: false, error: 'You do not have permission to update this report' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description, auditIds } = body;

    // Update report metadata
    const updateData: { name?: string; description?: string | null } = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;

    // If auditIds provided, validate and update
    if (auditIds && Array.isArray(auditIds)) {
      if (auditIds.length === 0) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'At least one audit ID is required' },
          { status: 400 }
        );
      }

      // Verify all audits exist and belong to the user
      const audits = await prisma.audit.findMany({
        where: {
          id: { in: auditIds },
          createdById: dbUser.id,
        },
      });

      if (audits.length !== auditIds.length) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'One or more audit IDs are invalid or do not belong to you' },
          { status: 400 }
        );
      }

      // Delete existing ReportAudit records and create new ones
      await prisma.reportAudit.deleteMany({
        where: { reportId: id },
      });

      await prisma.reportAudit.createMany({
        data: auditIds.map((auditId: string, index: number) => ({
          reportId: id,
          auditId,
          order: index,
        })),
      });
    }

    // Update report
    const updatedReport = await prisma.report.update({
      where: { id },
      data: updateData,
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

    console.log('[Reports API] Updated report:', id);

    return NextResponse.json<ApiResponse<ReportWithAudits>>({
      success: true,
      data: updatedReport as ReportWithAudits,
    });
  } catch (error) {
    console.error('[Reports API] Error updating report:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reports/[id] - Delete report
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

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

    // Fetch report
    const report = await prisma.report.findUnique({
      where: { id },
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
        { success: false, error: 'You do not have permission to delete this report' },
        { status: 403 }
      );
    }

    // Delete report (ReportAudit records will be cascaded)
    await prisma.report.delete({
      where: { id },
    });

    console.log('[Reports API] Deleted report:', id);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('[Reports API] Error deleting report:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}
