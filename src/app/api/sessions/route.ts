import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { llmService } from '@/services/llmService';
import { ttsService } from '@/services/ttsService';
import { promptService } from '@/services/promptService';
import { storageService } from '@/services/storageService';
import { generateStorageKey } from '@/lib/utils';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.session.findMany({
      where: {
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
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('[Sessions] List error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
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
    const { personaId } = body;

    if (!personaId) {
      return NextResponse.json({ error: 'Persona ID required' }, { status: 400 });
    }

    // Verify persona ownership
    const persona = await prisma.persona.findFirst({
      where: {
        id: personaId,
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        media: {
          where: {
            mediaType: 'voice_reference',
          },
        },
      },
    });

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    if (persona.media.length === 0) {
      return NextResponse.json(
        { error: 'Persona requires voice reference' },
        { status: 400 }
      );
    }

    const voiceReference = persona.media[0];

    // Create session
    const newSession = await prisma.session.create({
      data: {
        userId: session.user.id,
        personaId: persona.id,
        toneSnapshot: persona.tonePreset,
        contextSnapshot: persona.contextPrompt,
      },
    });

    // Generate initial greeting
    const personaContext = {
      ageNumber: persona.ageNumber,
      tonePreset: persona.tonePreset,
      customToneText: persona.customToneText || undefined,
      contextPrompt: persona.contextPrompt,
    };

    const initiationMessages = promptService.getInitiationPrompt(personaContext);
    const assistantText = await llmService.generateResponse(initiationMessages);

    // Store assistant message
    await prisma.sessionMessage.create({
      data: {
        sessionId: newSession.id,
        role: 'assistant',
        text: assistantText,
      },
    });

    // Generate assistant audio
    const audioBuffer = await ttsService.synthesizeVoice(
      assistantText,
      voiceReference.storageKey
    );

    // Upload audio to storage
    const audioKey = generateStorageKey(
      session.user.id,
      'assistant-audio',
      `init-${Date.now()}.wav`
    );
    await storageService.uploadFile(audioKey, audioBuffer, 'audio/wav');

    // Store artifact
    await prisma.sessionArtifact.create({
      data: {
        sessionId: newSession.id,
        artifactType: 'assistant_audio',
        storageKey: audioKey,
        mimeType: 'audio/wav',
      },
    });

    // Get signed URL for audio
    const audioUrl = await storageService.getSignedDownloadUrl(audioKey);

    return NextResponse.json(
      {
        session: newSession,
        initialMessage: {
          text: assistantText,
          audioUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Sessions] Create error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}