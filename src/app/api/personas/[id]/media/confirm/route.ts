import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { confirmUploadSchema } from '@/lib/validation';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = confirmUploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid confirmation data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { mediaType, storageKey, mimeType, durationSeconds } = validation.data;

    // Verify persona ownership
    const persona = await prisma.persona.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    // Verify storage key belongs to this user
    if (!storageKey.includes(session.user.id)) {
      return NextResponse.json({ error: 'Invalid storage key' }, { status: 403 });
    }

    // Create media record
    const media = await prisma.personaMedia.create({
      data: {
        personaId: params.id,
        mediaType,
        storageKey,
        mimeType,
        durationSeconds,
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error('[Persona Media] Confirm error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm upload' },
      { status: 500 }
    );
  }
}