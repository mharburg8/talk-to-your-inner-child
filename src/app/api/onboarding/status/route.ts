import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const consent = await prisma.consentRecord.findFirst({
      where: {
        userId: session.user.id,
        consentVersion: 'v1_audio_2026_01',
      },
    });

    return NextResponse.json({
      hasConsent: !!consent,
      consentVersion: consent?.consentVersion,
      acceptedAt: consent?.acceptedAt,
    });
  } catch (error) {
    console.error('[Consent] Status error:', error);
    return NextResponse.json(
      { error: 'Failed to check consent status' },
      { status: 500 }
    );
  }
}