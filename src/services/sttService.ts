/**
 * Speech-to-Text Service
 * Supports: OpenAI Whisper, Deepgram, or Mock
 */

export interface STTProvider {
  transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string>;
}

class OpenAISTTProvider implements STTProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OpenAI STT failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text;
  }
}

class DeepgramSTTProvider implements STTProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
    const response = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': mimeType,
      },
      body: audioBuffer,
    });

    if (!response.ok) {
      throw new Error(`Deepgram STT failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results?.channels[0]?.alternatives[0]?.transcript || '';
  }
}

class MockSTTProvider implements STTProvider {
  async transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
    console.log('[Mock STT] Transcribing audio of size:', audioBuffer.length);
    return 'This is a mock transcription. Configure STT_PROVIDER and API keys to use real transcription.';
  }
}

function getSTTProvider(): STTProvider {
  const provider = process.env.STT_PROVIDER || 'mock';

  switch (provider) {
    case 'openai':
      if (!process.env.OPENAI_API_KEY) {
        console.warn('OPENAI_API_KEY not set, falling back to mock STT');
        return new MockSTTProvider();
      }
      return new OpenAISTTProvider(process.env.OPENAI_API_KEY);

    case 'deepgram':
      if (!process.env.DEEPGRAM_API_KEY) {
        console.warn('DEEPGRAM_API_KEY not set, falling back to mock STT');
        return new MockSTTProvider();
      }
      return new DeepgramSTTProvider(process.env.DEEPGRAM_API_KEY);

    default:
      return new MockSTTProvider();
  }
}

export const sttService = getSTTProvider();