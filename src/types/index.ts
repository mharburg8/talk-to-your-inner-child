import { Persona, PersonaMedia, Session, SessionMessage, SessionArtifact } from '@prisma/client';

export type PersonaWithMedia = Persona & {
  media: PersonaMedia[];
  _count?: {
    sessions: number;
  };
};

export type SessionWithDetails = Session & {
  persona: {
    id: string;
    label: string;
    ageNumber: number;
  };
  messages: SessionMessage[];
  artifacts: (SessionArtifact & { url?: string })[];
  _count?: {
    messages: number;
  };
};

export interface TurnResponse {
  userTranscript: string;
  assistantTranscript: string;
  assistantAudioUrl: string | null;
  crisisDetected: boolean;
}

export interface ConsentStatus {
  hasConsent: boolean;
  consentVersion?: string;
  acceptedAt?: Date;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
    };
  }

  interface User {
    id: string;
    email: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}