# Talk To Your Inner Self

A production-ready web application for audio-based conversations with age personas, built with Next.js 14, TypeScript, and AI services.

## ⚠️ Important Disclaimer

This application is for reflective self-exploration only. It is NOT:
- A substitute for professional mental health care
- A therapy or counseling service
- Medical or diagnostic advice

If you're experiencing a mental health crisis, please contact a qualified professional or crisis helpline immediately.

## Features

### V1 (Current)
- ✅ User authentication with NextAuth
- ✅ Onboarding consent flow (versioned)
- ✅ Create age personas with context and tone
- ✅ Upload voice references for TTS
- ✅ Turn-based audio conversations
- ✅ Safety detection for crisis content
- ✅ Session transcripts and playback
- ✅ Complete data deletion controls

### V2 (Architected, Not Implemented)
- 📋 Image and video persona references
- 📋 Visual conversation synchronization
- 📋 Extended media pack system

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth with credentials provider
- **Storage**: AWS S3 (or compatible: R2, MinIO)
- **Queue** (optional): BullMQ + Redis
- **AI Services** (pluggable):
  - STT: OpenAI Whisper, Deepgram, or Mock
  - LLM: OpenAI GPT-4, Anthropic Claude, or Mock
  - TTS: ElevenLabs, Cartesia, PlayHT, or Mock

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- AWS S3 or compatible storage (optional: Redis for queues)
- AI service API keys (optional, defaults to mocks)

## Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd talk-to-your-inner-self
npm install
```

### 2. Set Up Environment Variables

Copy the example env file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database (required)
DATABASE_URL="postgresql://user:password@localhost:5432/inner_self"

# NextAuth (required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# AWS S3 (required for production, optional for development)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_S3_BUCKET="inner-self-media"

# Redis (optional, for background jobs)
REDIS_URL="redis://localhost:6379"

# AI Providers (optional, uses mocks if not set)
STT_PROVIDER="mock"  # openai | deepgram | mock
LLM_PROVIDER="mock"  # openai | anthropic | mock
TTS_PROVIDER="mock"  # elevenlabs | cartesia | playht | mock

# Only set if using real providers
# OPENAI_API_KEY=""
# ANTHROPIC_API_KEY=""
# ELEVENLABS_API_KEY=""
```

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed with demo user
npm run prisma:seed
```

Demo credentials after seeding:
- Email: `demo@example.com`
- Password: `demo123`

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
talk-to-your-inner-self/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # SQL migrations
│   └── seed.ts                # Seed script
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # NextAuth
│   │   │   ├── onboarding/   # Consent endpoints
│   │   │   ├── personas/     # Persona CRUD + media
│   │   │   └── sessions/     # Session management + turns
│   │   ├── auth/             # Auth pages
│   │   ├── onboarding/       # Consent UI
│   │   ├── dashboard/        # Main dashboard
│   │   ├── personas/         # Persona management
│   │   └── sessions/         # Session interface
│   ├── components/           # React components
│   ├── lib/                  # Utilities
│   │   ├── prisma.ts         # Prisma client
│   │   ├── auth.ts           # NextAuth config
│   │   ├── s3.ts             # S3 operations
│   │   └── validation.ts     # Zod schemas
│   ├── services/             # Provider abstractions
│   │   ├── sttService.ts     # Speech-to-text
│   │   ├── llmService.ts     # LLM generation
│   │   ├── ttsService.ts     # Text-to-speech
│   │   ├── storageService.ts # S3 wrapper
│   │   ├── safetyService.ts  # Crisis detection
│   │   └── promptService.ts  # Prompt generation
│   └── types/                # TypeScript types
└── scripts/
    └── cleanup-storage.ts    # Orphaned file cleanup
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Not implemented (use NextAuth)
- `POST /api/auth/signin` - NextAuth handles this
- `GET/POST /api/auth/[...nextauth]` - NextAuth routes

### Onboarding
- `POST /api/onboarding/accept-consent` - Accept versioned consent
- `GET /api/onboarding/status` - Check consent status

### Personas
- `GET /api/personas` - List user personas
- `POST /api/personas` - Create persona
- `GET /api/personas/[id]` - Get persona details
- `PATCH /api/personas/[id]` - Update persona
- `DELETE /api/personas/[id]` - Delete persona (cascades)
- `POST /api/personas/[id]/media/upload-url` - Get signed upload URL
- `POST /api/personas/[id]/media/confirm` - Confirm upload

### Sessions
- `GET /api/sessions` - List user sessions
- `POST /api/sessions` - Create session (initiates first message)
- `GET /api/sessions/[id]` - Get session with transcript
- `DELETE /api/sessions/[id]` - Delete session
- `POST /api/sessions/[id]/turn` - Process conversation turn

## Configuration

### Switching AI Providers

Set environment variables to switch providers:

```env
# Use OpenAI for everything
STT_PROVIDER="openai"
LLM_PROVIDER="openai"
TTS_PROVIDER="elevenlabs"  # Or cartesia, playht
OPENAI_API_KEY="sk-..."
ELEVENLABS_API_KEY="..."

# Use Anthropic for LLM
LLM_PROVIDER="anthropic"
ANTHROPIC_API_KEY="sk-ant-..."

# Use Deepgram for STT
STT_PROVIDER="deepgram"
DEEPGRAM_API_KEY="..."
```

### Mock Mode (No API Keys Required)

Leave providers as `"mock"` to use local simulation:
- Mock STT returns placeholder transcript
- Mock LLM returns echo response
- Mock TTS generates silent WAV files

Perfect for development and testing!

## Database Management

```bash
# Open Prisma Studio
npm run prisma:studio

# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

Important Vercel settings:
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: `.next`

### Docker (Alternative)

```dockerfile
# Coming soon - see Docker deployment guide
```

## Security Considerations

### Rate Limiting
Add rate limiting in production:
```typescript
// src/middleware.ts
// Implement rate limiting per user
```

### File Upload Validation
Currently validates:
- Audio MIME types
- File size limits (10MB default)
- User ownership

Add virus scanning for production.

### CORS and CSP
Configure in `next.config.js` for production.

## Safety Features

### Crisis Detection
The app monitors user input for self-harm/suicide content:
- Stops persona simulation
- Provides crisis resources (988 Lifeline, emergency services)
- Logs event for review
- Does not show "you've been flagged" messaging

### Persona Boundaries
The AI persona:
- Cannot claim to be a therapist
- Cannot give medical/diagnostic advice
- Cannot tell user what to do
- Focuses on reflection, not direction

## Data Deletion

Users have full control:
- **Delete Account**: Removes all personas, sessions, and storage
- **Delete Persona**: Removes persona, media, and all sessions
- **Delete Session**: Removes transcript and audio files

Deletion is cascading and includes S3 cleanup.

## Development Tips

### Testing Locally Without S3
The app will work with mocked services. S3 operations will log but won't actually upload.

### Testing Voice Upload
Use any audio file (WAV, MP3, WebM, OGG) under 10MB.

### Viewing Logs
All services log to console with `[ServiceName]` prefixes.

## Troubleshooting

### Database connection issues
```bash
# Verify DATABASE_URL is correct
npx prisma studio
```

### S3 upload fails
- Check AWS credentials
- Verify bucket exists
- Check bucket CORS policy

### Mock services not working
- Make sure no provider env vars are set
- Check console logs for `[Mock ...]` messages

### NextAuth session issues
- Verify NEXTAUTH_SECRET is set
- Clear cookies and try again
- Check NEXTAUTH_URL matches your domain

## Contributing

This is a reference implementation. Feel free to fork and customize for your needs.

## License

MIT License - see LICENSE file

## Support

For questions or issues, please open a GitHub issue.