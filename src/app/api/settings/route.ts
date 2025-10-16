import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  // Email Preferences
  emailNotifications: z.boolean().optional(),
  digestFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'NONE']).optional(),
  notifyOnComplete: z.boolean().optional(),
  notifyOnStatusChange: z.boolean().optional(),

  // Report Branding
  companyName: z.string().optional().nullable(),
  companyLogo: z.string().optional().nullable(),
  brandPrimaryColor: z.string().optional().nullable(),
  brandSecondaryColor: z.string().optional().nullable(),
  reportFooterText: z.string().optional().nullable(),

  // Export Preferences
  defaultExportFormat: z.enum(['PDF', 'EXCEL', 'JSON']).optional(),
  includeScreenshots: z.boolean().optional(),
  includeClaudeAnalysis: z.boolean().optional(),

  // UI Preferences
  theme: z.enum(['LIGHT', 'DARK', 'AUTO']).optional(),
  defaultView: z.enum(['GRID', 'TABLE']).optional(),
  itemsPerPage: z.number().int().min(6).max(48).optional(),
});

// GET /api/settings - Get user settings with masked API keys
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        settings: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If settings don't exist, return default settings
    if (!user.settings) {
      return NextResponse.json({
        success: true,
        data: {
          emailNotifications: true,
          digestFrequency: 'WEEKLY',
          notifyOnComplete: true,
          notifyOnStatusChange: true,
          defaultExportFormat: 'PDF',
          includeScreenshots: true,
          includeClaudeAnalysis: true,
          theme: 'LIGHT',
          defaultView: 'GRID',
          itemsPerPage: 12,
        },
      });
    }

    return NextResponse.json({ success: true, data: user.settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update user settings
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
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

    const body = await req.json();
    const validation = updateSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Upsert settings
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        ...data,
      },
    });

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
