import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { consentSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = consentSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid consent data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { consentVersion, scopes } = validation.data;

    // Check if consent already exists
    const existing = await prisma.consentRecord.findFirst({
      where: {
        userId: session.user.id,
        consentVersion,
      },
    });

    if (existing) {
      return NextResponse.json({ consent: existing });
    }

    // Create new consent record
    const consent = await prisma.consentRecord.create({
      data: {
        userId: session.user.id,
        consentVersion,
        scopes,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      },
    });

    return NextResponse.json({ consent }, { status: 201 });
  } catch (error) {
    console.error('[Consent] Accept error:', error);
    return NextResponse.json(
      { error: 'Failed to accept consent' },
      { status: 500 }
    );
  }
}