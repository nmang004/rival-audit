import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { executeAudit } from '@/lib/workflows/audit-workflow';

const createAuditSchema = z.object({
  url: z.string().url('Invalid URL format'),
  clientName: z.string().optional(),
  clientEmail: z.string().email('Invalid email').optional(),
});

// GET /api/audits - List all audits for the current user
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const validation = createAuditSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
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

    // Start audit execution asynchronously
    executeAudit(audit.id, url).catch((error) => {
      console.error(`Error executing audit ${audit.id}:`, error);
    });

    return NextResponse.json({
      success: true,
      data: audit,
      message: 'Audit created and execution started',
    });
  } catch (error) {
    console.error('Error creating audit:', error);
    return NextResponse.json(
      { error: 'Failed to create audit' },
      { status: 500 }
    );
  }
}
