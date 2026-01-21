/**
 * Text-to-Speech Service
 * Supports: ElevenLabs, Cartesia, PlayHT, or Mock
 */

export interface TTSProvider {
  synthesizeVoice(text: string, voiceReferenceKey: string): Promise<Buffer>;
}

class ElevenLabsTTSProvider implements TTSProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async synthesizeVoice(text: string, voiceReferenceKey: string): Promise<Buffer> {
    // Note: ElevenLabs requires voice cloning setup first
    // This is a simplified implementation
    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'default';
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS failed: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

class CartesiaTTSProvider implements TTSProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async synthesizeVoice(text: string, voiceReferenceKey: string): Promise<Buffer> {
    // Cartesia API implementation
    const response = await fetch('https://api.cartesia.ai/tts/bytes', {
      method: 'POST',
      headers: {
        'Cartesia-Version': '2024-06-10',
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: 'sonic-english',
        transcript: text,
        voice: {
          mode: 'id',
          id: 'default', // Replace with actual voice ID after cloning
        },
        output_format: {
          container: 'wav',
          encoding: 'pcm_f32le',
          sample_rate: 44100,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Cartesia TTS failed: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

class PlayHTTTSProvider implements TTSProvider {
  private apiKey: string;
  private userId: string;

  constructor(apiKey: string, userId: string) {
    this.apiKey = apiKey;
    this.userId = userId;
  }

  async synthesizeVoice(text: string, voiceReferenceKey: string): Promise<Buffer> {
    // PlayHT API implementation
    const response = await fetch('https://api.play.ht/api/v2/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-User-ID': this.userId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: 'default', // Replace with cloned voice ID
        output_format: 'mp3',
        speed: 1.0,
      }),
    });

    if (!response.ok) {
      throw new Error(`PlayHT TTS failed: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

class MockTTSProvider implements TTSProvider {
  async synthesizeVoice(text: string, voiceReferenceKey: string): Promise<Buffer> {
    console.log('[Mock TTS] Synthesizing:', text.substring(0, 50));
    console.log('[Mock TTS] Voice reference:', voiceReferenceKey);
    
    // Generate a minimal valid WAV file (silence)
    // WAV header for 1 second of silence at 44100 Hz, 16-bit, mono
    const sampleRate = 44100;
    const numChannels = 1;
    const bitsPerSample = 16;
    const duration = 1;
    const numSamples = sampleRate * duration;
    const dataSize = numSamples * numChannels * (bitsPerSample / 8);
    const fileSize = 44 + dataSize;

    const buffer = Buffer.alloc(fileSize);
    
    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(fileSize - 8, 4);
    buffer.write('WAVE', 8);
    
    // fmt chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
    buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    
    // data chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    
    // Silence (zeros)
    buffer.fill(0, 44);

    return buffer;
  }
}

function getTTSProvider(): TTSProvider {
  const provider = process.env.TTS_PROVIDER || 'mock';

  switch (provider) {
    case 'elevenlabs':
      if (!process.env.ELEVENLABS_API_KEY) {
        console.warn('ELEVENLABS_API_KEY not set, falling back to mock TTS');
        return new MockTTSProvider();
      }
      return new ElevenLabsTTSProvider(process.env.ELEVENLABS_API_KEY);

    case 'cartesia':
      if (!process.env.CARTESIA_API_KEY) {
        console.warn('CARTESIA_API_KEY not set, falling back to mock TTS');
        return new MockTTSProvider();
      }
      return new CartesiaTTSProvider(process.env.CARTESIA_API_KEY);

    case 'playht':
      if (!process.env.PLAYHT_API_KEY || !process.env.PLAYHT_USER_ID) {
        console.warn('PLAYHT_API_KEY or PLAYHT_USER_ID not set, falling back to mock TTS');
        return new MockTTSProvider();
      }
      return new PlayHTTTSProvider(
        process.env.PLAYHT_API_KEY,
        process.env.PLAYHT_USER_ID
      );

    default:
      return new MockTTSProvider();
  }
}

export const ttsService = getTTSProvider();