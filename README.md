# Tava AI - Mental Health Treatment Planning Platform

AI-assisted mental health treatment planning application that transforms therapy session recordings into comprehensive, personalized treatment plans for both therapists and clients.

## Features

- **Audio Transcription**: Upload therapy session audio files and get accurate transcripts via OpenAI Whisper
- **Dual-Mode Treatment Plans**: AI generates clinical plans for therapists and friendly summaries for clients
- **Session Summaries**: Automated clinical notes and encouraging client recaps
- **Risk Detection**: AI-powered safety monitoring using OpenAI Moderation API
- **Plan Versioning**: Track plan history with immutable versions
- **Role-Based Access**: Separate dashboards and views for therapists and clients

## Tech Stack

### Frontend

- **Next.js 16** with App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **BetterAuth** for authentication

### Backend

- **Express.js** with TypeScript
- **PostgreSQL** on AWS RDS
- **Drizzle ORM** with migrations
- **BetterAuth** with Drizzle adapter

### AI Services

- **OpenAI Whisper** (`whisper-1`) - Audio transcription
- **OpenAI GPT-4 Turbo** (`gpt-4-turbo-preview`) - Plan and summary generation
- **OpenAI Moderation API** - Risk detection

### Infrastructure

- **Vercel** - Frontend hosting
- **AWS App Runner** - Backend hosting
- **AWS RDS** - PostgreSQL database
- **AWS ECR** - Container registry
- **GitHub Actions** - CI/CD

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│     Backend     │────▶│   PostgreSQL    │
│   (Next.js)     │     │   (Express)     │     │    (AWS RDS)    │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │   OpenAI API    │
                        │  Whisper/GPT-4  │
                        │                 │
                        └─────────────────┘
```

### Monorepo Structure

```
tava-ai/
├── apps/
│   ├── frontend/          # Next.js application
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities
│   └── backend/           # Express.js API
│       ├── src/
│       │   ├── routes/    # API endpoints
│       │   ├── services/  # AI services
│       │   ├── db/        # Drizzle schema
│       │   └── middleware/# Auth middleware
│       └── uploads/       # Audio file storage
├── packages/
│   └── shared/            # Shared types
├── docs/                  # Documentation
└── .github/workflows/     # CI/CD
```

## Local Development Setup

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 14+ (or Docker)
- OpenAI API key

### Environment Variables

**Frontend** (`apps/frontend/.env`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000
```

**Backend** (`apps/backend/.env`):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/tava_ai
OPENAI_API_KEY=sk-...
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
PORT=8080
NODE_ENV=development
```

### Running with Docker (PostgreSQL)

```bash
# Start PostgreSQL
docker run -d \
  --name tava-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tava_ai \
  -p 5432:5432 \
  postgres:15

# Run migrations
cd apps/backend
pnpm run db:push
```

### Running Locally

```bash
# Install dependencies
pnpm install

# Start backend (terminal 1)
cd apps/backend
pnpm run dev

# Start frontend (terminal 2)
cd apps/frontend
pnpm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080

## AI Integration

### Prompting Strategy

The application uses a **dual-prompt strategy** for plan generation:

1. **Therapist Plan** (temperature: 0.3)
   - Clinical language, professional terminology
   - Structured JSON output with presenting concerns, goals, interventions
   - Risk assessment included

2. **Client Plan** (temperature: 0.5)
   - Simple, encouraging language (7th grade reading level)
   - Motivational focus on strengths and progress
   - Actionable homework items

### Structured Output Schemas

**Therapist Plan:**

```typescript
{
  presentingConcerns: string[];
  clinicalImpressions: string;
  shortTermGoals: string[];
  longTermGoals: string[];
  interventionsUsed: string[];
  homework: string[];
  strengths: string[];
  risks: string[];
}
```

**Client Plan:**

```typescript
{
  yourProgress: string;
  goalsWeAreWorkingOn: string[];
  thingsToTry: string[];
  yourStrengths: string[];
}
```

### Risk Detection

The application uses OpenAI's Moderation API to detect:

- Self-harm indicators (high risk)
- Violence/threats (medium-high risk)
- Other concerning content (low risk)

Risk levels are stored on sessions and displayed only to therapists.

## Database Schema

| Table              | Description                            |
| ------------------ | -------------------------------------- |
| `users`            | User accounts (therapists and clients) |
| `therapy_sessions` | Session records with transcripts       |
| `plans`            | Treatment plans with versioning        |
| `auth_sessions`    | BetterAuth sessions                    |
| `account`          | OAuth/credential accounts              |
| `verification`     | Email verification tokens              |

## Testing

```bash
# Run tests
cd apps/backend
pnpm test

# Run with coverage
pnpm test:coverage

# Run with UI
pnpm test:ui
```

## Deployment

### Frontend (Vercel)

Auto-deploys on push to `main` branch. Configure in Vercel dashboard:

- Framework: Next.js
- Build command: `pnpm --filter frontend build`
- Environment variables as listed above

### Backend (AWS App Runner)

Deployed via GitHub Actions using ECR:

```bash
# Manual deployment (if needed)
docker build -t tava-backend ./apps/backend
docker tag tava-backend:latest <ecr-url>:latest
docker push <ecr-url>:latest
```

## Limitations

- Audio file size limit: 25MB
- No offline support
- No video session support
- No multi-therapist collaboration per client
- Synchronous plan generation (20-30 second wait)
- GPT-4 occasionally produces malformed JSON (validation catches this)

## Future Ideas

- Evaluation harness to compare prompts/models
- Explainability features (link plan sections to transcript)
- Therapist preference tuning (per-therapist AI behavior)
- Client goal progress tracking
- Mobile app with offline support
- Real-time crisis detection and alerts
- Multi-language support

## License

Private - All rights reserved
