import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sttService } from '@/services/sttService';
import { llmService } from '@/services/llmService';
import { ttsService } from '@/services/ttsService';
import { safetyService } from '@/services/safetyService';
import { promptService } from '@/services/promptService';
import { storageService } from '@/services/storageService';
import { generateStorageKey } from '@/lib/utils';

const MAX_SESSION_TURNS = parseInt(process.env.MAX_SESSION_TURNS || '100', 10);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data with audio
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file required' }, { status: 400 });
    }

    // Verify session ownership
    const sessionData = await prisma.session.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        persona: {
          include: {
            media: {
              where: {
                mediaType: 'voice_reference',
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          take: 50, // Limit context window
        },
      },
    });

    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check turn limit
    if (sessionData.messages.length >= MAX_SESSION_TURNS * 2) {
      return NextResponse.json(
        { error: 'Session turn limit reached' },
        { status: 429 }
      );
    }

    const voiceReference = sessionData.persona.media[0];
    if (!voiceReference) {
      return NextResponse.json(
        { error: 'Persona missing voice reference' },
        { status: 400 }
      );
    }

    // Convert audio to buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Step 1: Transcribe user audio
    const userText = await sttService.transcribeAudio(audioBuffer, audioFile.type);

    // Step 2: Safety check on user input
    const safetyCheck = safetyService.checkContent(userText);

    if (!safetyCheck.isSafe) {
      // Log safety event
      await prisma.safetyEvent.create({
        data: {
          sessionId: params.id,
          userId: session.user.id,
          category: safetyCheck.category!,
          snippet: safetyCheck.snippet!,
        },
      });

      // Store user message
      await prisma.sessionMessage.create({
        data: {
          sessionId: params.id,
          role: 'user',
          text: userText,
        },
      });

      // Return crisis response without TTS
      return NextResponse.json({
        userTranscript: userText,
        assistantTranscript: safetyCheck.crisisResponse!,
        assistantAudioUrl: null,
        crisisDetected: true,
      });
    }

    // Step 3: Store user message
    await prisma.sessionMessage.create({
      data: {
        sessionId: params.id,
        role: 'user',
        text: userText,
      },
    });

    // Step 4: Build conversation context
    const personaContext = {
      ageNumber: sessionData.persona.ageNumber,
      tonePreset: sessionData.toneSnapshot,
      customToneText: sessionData.persona.customToneText || undefined,
      contextPrompt: sessionData.contextSnapshot,
    };

    const conversationHistory = sessionData.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      text: m.text,
    }));

    conversationHistory.push({
      role: 'user',
      text: userText,
    });

    const llmMessages = promptService.buildConversationMessages(
      personaContext,
      conversationHistory
    );

    // Step 5: Generate LLM response
    const assistantText = await llmService.generateResponse(llmMessages);

    // Step 6: Safety check on assistant output
    const assistantSafetyCheck = safetyService.checkContent(assistantText);
    if (!assistantSafetyCheck.isSafe) {
      console.warn('[Turn] Assistant response triggered safety check:', assistantText);
    }

    // Step 7: Store assistant message
    await prisma.sessionMessage.create({
      data: {
        sessionId: params.id,
        role: 'assistant',
        text: assistantText,
      },
    });

    // Step 8: Generate TTS audio
    const assistantAudioBuffer = await ttsService.synthesizeVoice(
      assistantText,
      voiceReference.storageKey
    );

    // Step 9: Upload assistant audio
    const audioKey = generateStorageKey(
      session.user.id,
      'assistant-audio',
      `turn-${Date.now()}.wav`
    );
    await storageService.uploadFile(audioKey, assistantAudioBuffer, 'audio/wav');

    // Step 10: Store artifact
    await prisma.sessionArtifact.create({
      data: {
        sessionId: params.id,
        artifactType: 'assistant_audio',
        storageKey: audioKey,
        mimeType: 'audio/wav',
      },
    });

    // Step 11: Get signed URL
    const assistantAudioUrl = await storageService.getSignedDownloadUrl(audioKey);

    return NextResponse.json({
      userTranscript: userText,
      assistantTranscript: assistantText,
      assistantAudioUrl,
      crisisDetected: false,
    });
  } catch (error) {
    console.error('[Turn] Processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process turn', details: (error as Error).message },
      { status: 500 }
    );
  }
}