import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updatePersonaSchema } from '@/lib/validation';
import { storageService } from '@/services/storageService';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const persona = await prisma.persona.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        media: true,
        sessions: {
          where: { deletedAt: null },
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    return NextResponse.json({ persona });
  } catch (error) {
    console.error('[Persona] Get error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch persona' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = updatePersonaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid update data', details: validation.error.issues },
        { status: 400 }
      );
    }

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

    const updated = await prisma.persona.update({
      where: { id: params.id },
      data: validation.data,
    });

    return NextResponse.json({ persona: updated });
  } catch (error) {
    console.error('[Persona] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update persona' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const persona = await prisma.persona.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        media: true,
        sessions: {
          include: {
            artifacts: true,
          },
        },
      },
    });

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    // Collect all storage keys to delete
    const storageKeys: string[] = [];
    
    // Add persona media
    persona.media.forEach(m => storageKeys.push(m.storageKey));
    
    // Add session artifacts
    persona.sessions.forEach(s => {
      s.artifacts.forEach(a => storageKeys.push(a.storageKey));
    });

    // Soft delete persona (cascades to sessions, messages, artifacts, media)
    await prisma.persona.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    // Delete storage files
    await storageService.deleteFiles(storageKeys);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Persona] Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete persona' },
      { status: 500 }
    );
  }
}