import { z } from 'zod';

export const ALLOWED_AUDIO_TYPES = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/webm', 'audio/ogg'];
export const MAX_AUDIO_SIZE = parseInt(process.env.MAX_AUDIO_SIZE_MB || '10', 10) * 1024 * 1024;

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const consentSchema = z.object({
  consentVersion: z.string(),
  scopes: z.array(z.string()),
});

export const createPersonaSchema = z.object({
  label: z.string().min(1, 'Label is required').max(100),
  ageNumber: z.number().int().min(1).max(120),
  tonePreset: z.enum(['gentle', 'neutral', 'playful', 'custom']),
  customToneText: z.string().max(500).optional(),
  contextPrompt: z.string().min(1, 'Context is required').max(2000),
});

export const updatePersonaSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  tonePreset: z.enum(['gentle', 'neutral', 'playful', 'custom']).optional(),
  customToneText: z.string().max(500).optional(),
  contextPrompt: z.string().min(1).max(2000).optional(),
});

export const uploadUrlSchema = z.object({
  mediaType: z.enum(['voice_reference', 'image_reference', 'video_reference']),
  mimeType: z.string(),
  fileName: z.string(),
});

export const confirmUploadSchema = z.object({
  mediaType: z.enum(['voice_reference', 'image_reference', 'video_reference']),
  storageKey: z.string(),
  mimeType: z.string(),
  durationSeconds: z.number().optional(),
});

export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid audio format. Allowed: WAV, MP3, WebM, OGG' };
  }

  if (file.size > MAX_AUDIO_SIZE) {
    return { valid: false, error: `File too large. Maximum size: ${MAX_AUDIO_SIZE / 1024 / 1024}MB` };
  }

  return { valid: true };
}