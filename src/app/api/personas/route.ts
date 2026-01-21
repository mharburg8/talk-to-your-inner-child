import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createPersonaSchema } from '@/lib/validation';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const personas = await prisma.persona.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        media: {
          where: {
            mediaType: 'voice_reference',
          },
        },
        _count: {
          select: {
            sessions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ personas });
  } catch (error) {
    console.error('[Personas] List error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = createPersonaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid persona data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { label, ageNumber, tonePreset, customToneText, contextPrompt } = validation.data;

    const persona = await prisma.persona.create({
      data: {
        userId: session.user.id,
        label,
        ageNumber,
        tonePreset,
        customToneText,
        contextPrompt,
      },
    });

    return NextResponse.json({ persona }, { status: 201 });
  } catch (error) {
    console.error('[Personas] Create error:', error);
    return NextResponse.json(
      { error: 'Failed to create persona' },
      { status: 500 }
    );
  }
}