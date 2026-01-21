# Database
DATABASE_URL="postgresql://user:password@localhost:5432/inner_self?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# AWS S3 (or compatible service like R2, MinIO)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="inner-self-media"
AWS_S3_ENDPOINT="" # Optional: for S3-compatible services like Cloudflare R2

# Redis (optional, for BullMQ)
REDIS_URL="redis://localhost:6379"

# AI Service Providers (all optional, will use mocks if not set)
# Speech-to-Text
STT_PROVIDER="openai" # openai | deepgram | mock
OPENAI_API_KEY=""
DEEPGRAM_API_KEY=""

# LLM
LLM_PROVIDER="openai" # openai | anthropic | mock
# OPENAI_API_KEY="" # reuse from above if same
ANTHROPIC_API_KEY=""

# Text-to-Speech
TTS_PROVIDER="elevenlabs" # elevenlabs | cartesia | playht | mock
ELEVENLABS_API_KEY=""
CARTESIA_API_KEY=""
PLAYHT_API_KEY=""

# Application Settings
MAX_AUDIO_SIZE_MB="10"
MAX_SESSION_TURNS="100"
SIGNED_URL_EXPIRY_SECONDS="3600"