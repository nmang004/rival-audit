import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET /api/audits/[id] - Get a single audit by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // Auto-create user if they don't exist (for development)
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: 'user@example.com',
          name: 'User',
          role: 'SALES',
        },
      });
    }

    const audit = await prisma.audit.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    // Check if user owns this audit
    if (audit.createdById !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: audit });
  } catch (error) {
    console.error('Error fetching audit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit' },
      { status: 500 }
    );
  }
}

// PATCH /api/audits/[id] - Update audit
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // Auto-create user if they don't exist (for development)
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: 'user@example.com',
          name: 'User',
          role: 'SALES',
        },
      });
    }

    const audit = await prisma.audit.findUnique({
      where: { id },
    });

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    if (audit.createdById !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();

    // Check if status is being updated
    const isStatusChange = body.status && body.status !== audit.status;
    const previousStatus = audit.status;
    const newStatus = body.status;

    const updatedAudit = await prisma.audit.update({
      where: { id },
      data: body,
    });

    // Log status change if status was updated
    if (isStatusChange) {
      await prisma.statusChange.create({
        data: {
          auditId: id,
          fromStatus: previousStatus,
          toStatus: newStatus,
          changedBy: userId,
        },
      });

      console.log(`[Audit ${id}] Status changed: ${previousStatus} → ${newStatus}`);

      // Trigger signed workflow if status changed to SIGNED
      if (newStatus === 'SIGNED' && previousStatus !== 'SIGNED') {
        console.log(`[Audit ${id}] Triggering signed workflow...`);

        // Import workflow dynamically to avoid circular dependencies
        import('@/lib/workflows/signed-workflow')
          .then(({ executeSignedWorkflow }) => {
            return executeSignedWorkflow(id);
          })
          .then(() => {
            console.log(`[Audit ${id}] Signed workflow completed successfully`);
          })
          .catch((error) => {
            console.error(`[Audit ${id}] Signed workflow failed:`, error);
          });
      }
    }

    return NextResponse.json({ success: true, data: updatedAudit });
  } catch (error) {
    console.error('Error updating audit:', error);
    return NextResponse.json(
      { error: 'Failed to update audit' },
      { status: 500 }
    );
  }
}

// DELETE /api/audits/[id] - Delete audit
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // Auto-create user if they don't exist (for development)
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: 'user@example.com',
          name: 'User',
          role: 'SALES',
        },
      });
    }

    const audit = await prisma.audit.findUnique({
      where: { id },
    });

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    if (audit.createdById !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.audit.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Audit deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting audit:', error);
    return NextResponse.json(
      { error: 'Failed to delete audit' },
      { status: 500 }
    );
  }
}
