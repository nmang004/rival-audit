import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, ReportWithAudits } from '@/types';

/**
 * GET /api/reports - List all reports for the authenticated user
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
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

    // Fetch all reports for this user
    const reports = await prisma.report.findMany({
      where: {
        createdById: dbUser.id,
      },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json<ApiResponse<ReportWithAudits[]>>({
      success: true,
      data: reports as ReportWithAudits[],
    });
  } catch (error) {
    console.error('[Reports API] Error fetching reports:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reports - Create a new report
 * Body: { name: string, description?: string, auditIds: string[] }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
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

    // Parse request body
    const body = await request.json();
    const { name, description, auditIds } = body;

    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Report name is required' },
        { status: 400 }
      );
    }

    if (!auditIds || !Array.isArray(auditIds) || auditIds.length === 0) {
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

    // Create report with ReportAudit junction records
    const report = await prisma.report.create({
      data: {
        name,
        description: description || null,
        createdById: dbUser.id,
        reportAudits: {
          create: auditIds.map((auditId: string, index: number) => ({
            auditId,
            order: index,
          })),
        },
      },
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

    console.log('[Reports API] Created report:', report.id, 'with', auditIds.length, 'audits');

    return NextResponse.json<ApiResponse<ReportWithAudits>>({
      success: true,
      data: report as ReportWithAudits,
    }, { status: 201 });
  } catch (error) {
    console.error('[Reports API] Error creating report:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
