import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { ApiResponse, ShareableLinkInfo } from '@/types';

/**
 * POST /api/reports/[id]/share - Generate shareable link
 */
export async function POST(
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
        { success: false, error: 'You do not have permission to share this report' },
        { status: 403 }
      );
    }

    // Generate unique token if one doesn't exist
    let shareableLink = report.shareableLink;

    if (!shareableLink) {
      // Generate unique token using nanoid
      shareableLink = nanoid(21);

      // Update report with shareable link
      await prisma.report.update({
        where: { id },
        data: { shareableLink },
      });

      console.log('[Share API] Generated shareable link for report:', id, 'Token:', shareableLink);
    } else {
      console.log('[Share API] Using existing shareable link for report:', id);
    }

    // Construct public URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const publicUrl = `${appUrl}/reports/share/${shareableLink}`;

    const result: ShareableLinkInfo = {
      shareableLink,
      publicUrl,
      createdAt: new Date(),
    };

    return NextResponse.json<ApiResponse<ShareableLinkInfo>>({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[Share API] Error generating shareable link:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to generate shareable link' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reports/[id]/share - Revoke shareable link
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
        { success: false, error: 'You do not have permission to revoke sharing for this report' },
        { status: 403 }
      );
    }

    // Revoke shareable link by setting it to null
    await prisma.report.update({
      where: { id },
      data: { shareableLink: null },
    });

    console.log('[Share API] Revoked shareable link for report:', id);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Shareable link revoked successfully',
    });
  } catch (error) {
    console.error('[Share API] Error revoking shareable link:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to revoke shareable link' },
      { status: 500 }
    );
  }
}
