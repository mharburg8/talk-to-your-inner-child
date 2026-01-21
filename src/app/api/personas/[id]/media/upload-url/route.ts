import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadUrlSchema } from '@/lib/validation';
import { generateStorageKey } from '@/lib/utils';
import { storageService } from '@/services/storageService';

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
    const validation = uploadUrlSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid upload request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { mediaType, mimeType, fileName } = validation.data;

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

    // Generate storage key
    const storageKey = generateStorageKey(
      session.user.id,
      `persona-media/${mediaType}`,
      fileName
    );

    // Get signed upload URL
    const uploadUrl = await storageService.getSignedUploadUrl(storageKey, mimeType);

    return NextResponse.json({
      uploadUrl,
      storageKey,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('[Persona Media] Upload URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}