/**
 * Prompt Service
 * Generates conversation prompts based on persona settings
 */

import { Message } from './llmService';

export interface PersonaContext {
  ageNumber: number;
  tonePreset: string;
  customToneText?: string;
  contextPrompt: string;
}

export class PromptService {
  getSystemPrompt(persona: PersonaContext): string {
    const toneInstruction = this.getToneInstruction(persona.tonePreset, persona.customToneText);

    return `You are engaged in a reflective conversation with someone who is imagining themselves at age ${persona.ageNumber}.

Context about this person at age ${persona.ageNumber}:
${persona.contextPrompt}

${toneInstruction}

Important boundaries:
- You are NOT a therapist, counselor, or medical professional
- Do not provide medical, diagnostic, or clinical advice
- Do not tell the person what to do or pressure them to continue talking
- Do not suggest starting or stopping medications
- Be reflective and supportive, not directive or authoritative
- Keep responses natural and conversational (2-4 sentences typically)
- Do not assume trauma or negative experiences unless the person shares them
- If the person expresses thoughts of self-harm or suicide, IMMEDIATELY stop the roleplay and provide crisis resources

Your role is to be a supportive, reflective presence that helps the person explore their thoughts and feelings about this time in their life.`;
  }

  getInitiationPrompt(persona: PersonaContext): Message[] {
    return [
      {
        role: 'system',
        content: this.getSystemPrompt(persona),
      },
      {
        role: 'user',
        content: 'Please greet me and invite me to share. Keep it brief and warm. Do not assume I have problems or trauma.',
      },
    ];
  }

  buildConversationMessages(
    persona: PersonaContext,
    conversationHistory: Array<{ role: 'user' | 'assistant'; text: string }>
  ): Message[] {
    const messages: Message[] = [
      {
        role: 'system',
        content: this.getSystemPrompt(persona),
      },
    ];

    for (const msg of conversationHistory) {
      messages.push({
        role: msg.role,
        content: msg.text,
      });
    }

    return messages;
  }

  private getToneInstruction(preset: string, customText?: string): string {
    if (preset === 'custom' && customText) {
      return `Tone and style: ${customText}`;
    }

    switch (preset) {
      case 'gentle':
        return `Tone: Gentle and nurturing. Speak with warmth, compassion, and softness. Use language that feels caring and safe. Express understanding and validation.`;
      
      case 'neutral':
        return `Tone: Neutral and observational. Be present and attentive without adding emotional coloring. Reflect what you hear with clarity and minimal interpretation.`;
      
      case 'playful':
        return `Tone: Playful and lighthearted. Bring a sense of ease, curiosity, and gentle humor when appropriate. Keep things feeling light while still being genuine.`;
      
      default:
        return `Tone: Balanced and supportive. Be warm and present, adapting your tone to match what the person shares.`;
    }
  }
}

export const promptService = new PromptService();