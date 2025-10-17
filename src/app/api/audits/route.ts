import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { executeAudit } from '@/lib/workflows/audit-workflow';

// Configure Vercel function to allow longer execution time (180 seconds = 3 minutes)
export const maxDuration = 180; // Maximum duration in seconds (requires Vercel Pro/Enterprise plan)
export const dynamic = 'force-dynamic'; // Ensure the route is always dynamic

const createAuditSchema = z.object({
  url: z.string().url('Invalid URL format'),
  clientName: z.string().optional(),
  clientEmail: z.string().email('Invalid email').optional(),
});

// GET /api/audits - List all audits for the current user
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user from database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // Auto-create user if they don't exist (for development)
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: 'user@example.com', // Will be updated by webhook later
          name: 'User',
          role: 'SALES',
        },
      });
    }

    // Get all audits for this user
    const audits = await prisma.audit.findMany({
      where: { createdById: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: audits });
  } catch (error) {
    console.error('Error fetching audits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audits' },
      { status: 500 }
    );
  }
}

// POST /api/audits - Create a new audit and start execution
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user from database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // Auto-create user if they don't exist (for development)
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: 'user@example.com', // Will be updated by webhook later
          name: 'User',
          role: 'SALES',
        },
      });
    }

    const body = await req.json();
    const validation = createAuditSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { url, clientName, clientEmail } = validation.data;

    // Create audit record
    const audit = await prisma.audit.create({
      data: {
        url,
        clientName,
        clientEmail,
        status: 'IN_PROGRESS',
        createdById: user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`[Audit ${audit.id}] Starting audit execution for URL: ${url}`);

    // Execute audit synchronously and wait for completion
    // This is necessary on Vercel because serverless functions terminate after response
    try {
      await executeAudit(audit.id, url);
      console.log(`[Audit ${audit.id}] Audit execution completed successfully`);

      // Fetch the updated audit with results
      const completedAudit = await prisma.audit.findUnique({
        where: { id: audit.id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: completedAudit,
        message: 'Audit completed successfully',
      });
    } catch (auditError) {
      // Log the error
      console.error(`[Audit ${audit.id}] Audit execution failed:`, auditError);

      // Note: Audit status remains IN_PROGRESS to indicate incomplete execution
      // Consider adding a FAILED status to the AuditStatus enum in the future

      // Return error response
      return NextResponse.json(
        {
          success: false,
          error: 'Audit execution failed',
          details: auditError instanceof Error ? auditError.message : String(auditError),
          auditId: audit.id,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating audit:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create audit',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
