import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { executeSitemapAudit } from '@/lib/workflows/sitemap-workflow';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sitemapUrl, clientName, clientEmail } = body;

    // Validate sitemap URL
    if (!sitemapUrl || typeof sitemapUrl !== 'string') {
      return NextResponse.json(
        { error: 'Sitemap URL is required' },
        { status: 400 }
      );
    }

    if (!sitemapUrl.endsWith('.xml')) {
      return NextResponse.json(
        { error: 'Invalid sitemap URL. Must end with .xml' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(sitemapUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log(`[Sitemap Audit API] Creating audit for: ${sitemapUrl}`);

    // Get or create user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create audit record
    const audit = await prisma.audit.create({
      data: {
        url: sitemapUrl,
        status: 'IN_PROGRESS',
        isSitemapAudit: true,
        clientName: clientName || null,
        clientEmail: clientEmail || null,
        createdById: user.id,
      },
    });

    console.log(`[Sitemap Audit API] Created audit ${audit.id}`);

    // Execute sitemap audit in background (don't await)
    executeSitemapAudit(audit.id, sitemapUrl)
      .then(() => {
        console.log(`[Sitemap Audit ${audit.id}] Completed successfully`);
      })
      .catch((error) => {
        console.error(`[Sitemap Audit ${audit.id}] Failed:`, error);
      });

    return NextResponse.json({
      success: true,
      data: audit,
    });
  } catch (error) {
    console.error('Error creating sitemap audit:', error);
    return NextResponse.json(
      { error: 'Failed to create sitemap audit' },
      { status: 500 }
    );
  }
}
