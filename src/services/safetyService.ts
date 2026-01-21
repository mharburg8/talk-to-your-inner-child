/**
 * Safety Service
 * Detects crisis content and provides appropriate responses
 */

export interface SafetyCheckResult {
  isSafe: boolean;
  category?: 'self_harm' | 'suicide' | 'crisis';
  snippet?: string;
  crisisResponse?: string;
}

export class SafetyService {
  private selfHarmPatterns = [
    /\b(kill|hurt|harm|cut|end)\s+(myself|my\s*self)\b/i,
    /\bsuicid(e|al)\b/i,
    /\bwant\s+to\s+die\b/i,
    /\bno\s+reason\s+to\s+live\b/i,
    /\bdon'?t\s+want\s+to\s+be\s+here\b/i,
    /\bend\s+it\s+all\b/i,
    /\bbetter\s+off\s+dead\b/i,
  ];

  checkContent(text: string): SafetyCheckResult {
    const lowerText = text.toLowerCase();

    for (const pattern of this.selfHarmPatterns) {
      if (pattern.test(lowerText)) {
        return {
          isSafe: false,
          category: lowerText.includes('suicid') ? 'suicide' : 'self_harm',
          snippet: text.substring(0, 200),
          crisisResponse: this.getCrisisResponse(),
        };
      }
    }

    return { isSafe: true };
  }

  private getCrisisResponse(): string {
    return `I'm concerned about what you've shared. Your safety is important, and I want to make sure you get the support you need right now.

If you're in the United States, please reach out to the 988 Suicide and Crisis Lifeline by calling or texting 988. They provide free, confidential support 24/7.

If you're outside the US, please contact your local emergency services or crisis helpline.

You can also:
- Reach out to a trusted friend, family member, or mental health professional
- Go to your nearest emergency room if you're in immediate danger

Remember, you don't have to face this alone. There are people who want to help and support you through this difficult time.

I'm here to listen, but I'm not equipped to provide crisis support. Please reach out to a trained professional who can help you right now.`;
  }
}

export const safetyService = new SafetyService();