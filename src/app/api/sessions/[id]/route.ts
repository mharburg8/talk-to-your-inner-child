import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

    const sessionData = await prisma.session.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        persona: {
          select: {
            id: true,
            label: true,
            ageNumber: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        artifacts: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Generate signed URLs for all artifacts
    const artifactsWithUrls = await Promise.all(
      sessionData.artifacts.map(async (artifact) => ({
        ...artifact,
        url: await storageService.getSignedDownloadUrl(artifact.storageKey),
      }))
    );

    return NextResponse.json({
      session: {
        ...sessionData,
        artifacts: artifactsWithUrls,
      },
    });
  } catch (error) {
    console.error('[Session] Get error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
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

    const sessionData = await prisma.session.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        artifacts: true,
      },
    });

    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Collect storage keys
    const storageKeys = sessionData.artifacts.map(a => a.storageKey);

    // Soft delete session (cascades to messages and artifacts)
    await prisma.session.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    // Delete storage files
    await storageService.deleteFiles(storageKeys);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Session] Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}