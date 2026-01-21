# Remaining Files Implementation Guide

I've provided the core architecture and critical files. Here are the remaining files you need to complete the implementation:

## Configuration Files

### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `postcss.config.js`
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### `.gitignore`
```
node_modules/
.next/
.env
.env.local
*.log
dist/
build/
.DS_Store
*.pem
```

## UI Components (`src/components/ui/`)

### `Button.tsx`
Simple button component with variants (primary, secondary, danger)

### `Input.tsx`
Form input with label and error states

### `Select.tsx`
Dropdown select component

### `TextArea.tsx`
Multi-line text input

### `Card.tsx`
Container component with padding and shadow

### `Modal.tsx`
Overlay modal for confirmations

## Feature Components (`src/components/`)

### `AudioPlayer.tsx`
```typescript
'use client';
import { useRef, useState } from 'react';

export default function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggle = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} />
      <button onClick={toggle} className="px-4 py-2 bg-primary-600 text-white rounded">
        {isPlaying ? '⏸️ Pause' : '▶️ Play'}
      </button>
    </div>
  );
}
```

### `TranscriptView.tsx`
```typescript
'use client';
import { SessionMessage } from '@prisma/client';

export default function TranscriptView({ messages }: { messages: SessionMessage[] }) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-3 rounded-lg ${
            msg.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-white mr-8'
          }`}
        >
          <div className="text-xs text-gray-500 mb-1">
            {msg.role === 'user' ? 'You' : 'Inner Self'}
          </div>
          <div className="text-sm">{msg.text}</div>
        </div>
      ))}
    </div>
  );
}
```

### `PersonaCard.tsx`
Display persona in a card with edit/delete actions

### `SessionCard.tsx`
Display session summary with play button

### `ConsentForm.tsx`
Display consent text and accept button

## Pages

### `src/app/auth/signin/page.tsx`
```typescript
'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid credentials');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
          >
            Sign In
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-primary-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### `src/app/auth/signup/page.tsx`
Similar to signin but calls API to create user first:
```typescript
const res = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
// Then signIn
```

Note: You need to create `POST /api/auth/signup` route that creates user with bcrypt hashed password.

### `src/app/onboarding/page.tsx`
```typescript
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = async () => {
    const res = await fetch('/api/onboarding/status');
    const data = await res.json();
    if (data.hasConsent) {
      router.push('/dashboard');
    }
  };

  const handleAccept = async () => {
    await fetch('/api/onboarding/accept-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consentVersion: 'v1_audio_2026_01',
        scopes: ['audio_processing', 'voice_synthesis', 'storage_retention'],
      }),
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Before We Begin</h1>
        
        <div className="space-y-4 text-sm text-gray-700">
          <p className="font-semibold">This is NOT therapy:</p>
          <p>This application is a tool for self-reflection, not professional mental health treatment.</p>
          
          <p className="font-semibold">You are in control:</p>
          <p>You can stop, pause, or delete your data at any time.</p>
          
          <p className="font-semibold">We will:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Process your voice recordings to create synthesized responses</li>
            <li>Store your audio files and transcripts securely</li>
            <li>Allow you to delete everything whenever you choose</li>
          </ul>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>I understand and accept these terms</span>
          </label>
        </div>

        <button
          onClick={handleAccept}
          disabled={!accepted}
          className="mt-6 w-full bg-primary-600 text-white py-3 rounded-lg disabled:opacity-50"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}
```

### `src/app/dashboard/page.tsx`
Fetch and display personas and recent sessions. Links to create new persona and view sessions.

### `src/app/personas/new/page.tsx`
Form to create persona with:
- Label input
- Age number input
- Tone preset select
- Custom tone text (if custom selected)
- Context prompt textarea
- Voice file upload with signed URL flow

### `src/app/personas/[id]/page.tsx`
Display persona details, list sessions, "Start Session" button

### `src/app/sessions/[id]/page.tsx`
Most complex page:
1. Fetch session with messages and artifacts
2. Display transcript with TranscriptView
3. Show AudioRecorder
4. On recording complete, send to `/api/sessions/[id]/turn`
5. Display assistant response and play audio
6. Handle crisis detection by showing resources

## Middleware

### `src/middleware.ts`
```typescript
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/personas/:path*', '/sessions/:path*'],
};
```

## Scripts

### `scripts/cleanup-storage.ts`
Background job to delete orphaned S3 files (files not referenced in DB)

## Additional API Routes Needed

### `src/app/api/auth/signup/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  return NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 201 });
}
```

## Testing Checklist

1. ✅ Sign up new user
2. ✅ Accept onboarding consent
3. ✅ Create persona with voice upload
4. ✅ Start session (AI initiates)
5. ✅ Record and send user audio
6. ✅ Receive and play assistant response
7. ✅ View transcript
8. ✅ Delete session
9. ✅ Delete persona
10. ✅ Test crisis detection (input self-harm language)

## Production Deployment Notes

1. Set all environment variables in hosting platform
2. Run migrations: `npx prisma migrate deploy`
3. Enable S3 CORS for your domain
4. Set up monitoring (Sentry, Datadog)
5. Configure rate limiting
6. Enable virus scanning on uploads
7. Set up scheduled job for storage cleanup
8. Configure CDN for static assets
9. Enable database backups
10. Set up SSL/TLS

## Known Limitations & Future Improvements

- Turn-based only (no streaming)
- No real-time voice (could add WebRTC)
- No mobile app (could use React Native)
- Voice cloning requires provider setup
- Background jobs need separate worker process
- No admin dashboard
- No analytics/insights
- No conversation export
- No multi-language support

## Architecture for V2 Visual Features

When ready to add V2:

1. Update consent form with new version
2. Add image/video upload UI
3. Extend `persona_media` with new types
4. Add visual generation service
5. Sync video with audio timeline
6. Update session page to display video

The database and storage are already ready!