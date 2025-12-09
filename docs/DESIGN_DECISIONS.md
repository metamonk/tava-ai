# Design Decisions & Technical Write-Up

This document outlines the key technical decisions, tradeoffs, and future considerations for the Tava AI therapy platform.

## AI System Design Decisions

### GPT-4 Turbo for Plan Generation

**Choice**: `gpt-4-turbo-preview` with JSON structured output

**Rationale**:

- Required for complex structured output with high accuracy
- Superior at following JSON schema constraints compared to GPT-3.5
- Handles dual-mode generation (clinical vs motivational tone) reliably
- Better clinical reasoning and appropriate use of therapeutic terminology

**Tradeoff**: Higher cost ($0.01/1K input, $0.03/1K output) and latency (~20-30s) vs quality. For a healthcare application, quality and reliability are paramount.

### Dual-Prompt Strategy

**Choice**: Separate prompts for therapist and client plans

**Implementation**:

- Therapist plan generated first (temperature: 0.3 for consistency)
- Client plan generated from therapist plan context (temperature: 0.5 for warmth)

**Rationale**:

- Ensures consistent tone for each audience
- Therapist prompt emphasizes clinical language, ICD terminology, risk assessment
- Client prompt emphasizes plain language, encouragement, 7th-grade reading level
- Allows independent iteration on each prompt without affecting the other

**Tradeoff**: 2x AI calls vs single call with post-processing. Chose quality and prompt separation over speed.

### Whisper for Transcription

**Choice**: OpenAI Whisper API (`whisper-1`)

**Rationale**:

- Industry-leading accuracy for conversational audio
- Handles therapy-specific vocabulary well (clinical terms, emotional language)
- No fine-tuning required for MVP
- Simple API integration with consistent results

**Tradeoff**: OpenAI API dependency vs self-hosted solution. Chose simplicity and reliability for MVP.

### JSON Schema Validation

**Implementation**:

- GPT-4 `response_format: { type: 'json_object' }` for structured output
- Runtime validation of required fields
- Retry logic (max 3 attempts) for malformed outputs
- Exponential backoff for rate limits and server errors

**Rationale**: Prevents downstream errors from incomplete or malformed plans. Essential for healthcare data integrity.

### Risk Detection Approach

**Choice**: OpenAI Moderation API with custom risk level mapping

**Implementation**:

- HIGH: self-harm/intent, self-harm/instructions, or scores > 0.7
- MEDIUM: self-harm, violence flagged, or scores > 0.4
- LOW: any flagged content or scores > 0.2
- NONE: all clear

**Rationale**:

- Simple API-based approach suitable for MVP
- Provides immediate safety signal without custom model training
- Risk levels stored on sessions for therapist visibility
- Client never sees risk labels (privacy consideration)

**Tradeoff**: API-based detection vs custom trained model. Chose speed to market and reasonable accuracy.

## Key Product Tradeoffs

### Monorepo vs Separate Repositories

**Choice**: pnpm monorepo with `apps/` and `packages/` structure

**Pros**:

- Shared TypeScript types between frontend and backend
- Atomic commits across the stack
- Simpler CI/CD with single repository
- Easier local development with workspace dependencies

**Cons**:

- Larger repository size
- Tighter coupling between applications

**Rationale**: MVP benefits from velocity and shared types reduce integration bugs.

### Vercel + App Runner vs Single Platform

**Choice**: Split deployment (Next.js on Vercel, Express on App Runner)

**Pros**:

- Each platform optimized for its framework
- Vercel excels at Next.js with automatic optimizations
- App Runner provides flexibility for custom Node.js backend
- Lower cost than full AWS deployment

**Cons**:

- More moving parts
- Cross-origin considerations (CORS)
- Two deployment pipelines

**Rationale**: Platform specialization outweighs complexity for this use case.

### Drizzle ORM vs Prisma

**Choice**: Drizzle ORM with PostgreSQL

**Pros**:

- Lightweight with SQL-like TypeScript syntax
- Faster than Prisma at runtime
- Smaller bundle size
- Excellent type inference

**Cons**:

- Smaller ecosystem
- Less mature tooling
- Fewer learning resources

**Rationale**: Performance and type-safety without Prisma overhead. SQL-like syntax preferred by team.

### BetterAuth vs NextAuth

**Choice**: BetterAuth with Drizzle adapter

**Pros**:

- Modern, cleaner API
- Built for full-stack apps with API backends
- Native Drizzle adapter
- Better session management APIs

**Cons**:

- Newer, smaller community
- Fewer OAuth providers out of the box

**Rationale**: Better DX and seamless Drizzle integration. OAuth not needed for MVP.

### Session-Based vs JWT Authentication

**Choice**: Session-based authentication with HTTP-only cookies

**Pros**:

- Revocable sessions (critical for healthcare)
- Server-side session state enables richer features
- Better security against XSS (HTTP-only cookies)
- Simpler token management

**Cons**:

- Requires server-side session store
- Slightly more complex scaling

**Rationale**: Security > stateless convenience for healthcare context. Session revocation is essential.

### Plan Versioning Strategy

**Choice**: Immutable versions (new row per edit) with `isActive` flag

**Pros**:

- Complete history preserved
- Easy rollback capability
- Auditable changes (essential for healthcare)
- Simple query for "current plan"

**Cons**:

- More storage usage
- Slightly more complex queries for history

**Rationale**: Treatment plan history is critical for clinical context and regulatory compliance.

### Synchronous vs Async Plan Generation

**Choice**: Synchronous (client waits for result)

**Pros**:

- Simpler UX with immediate feedback
- No background job infrastructure needed
- Easier error handling

**Cons**:

- UI blocked for ~20-30 seconds
- Longer perceived wait time

**Rationale**: MVP simplicity. Acceptable wait time for this workflow. Async can be added later if needed.

## What to Build Next

### Priority 1: Evaluation Harness

Build a system to compare prompts and models quantitatively:

- Measure structure accuracy (JSON schema compliance)
- Measure reading level of client plans (Flesch-Kincaid)
- Track clinical completeness (coverage of key topics)
- A/B test therapist satisfaction with different prompts

### Priority 2: Explainability

Link plan sections to source transcript excerpts:

- Show "why" AI generated specific goals
- Citation-style UI showing transcript evidence
- Builds trust and clinical adoption
- Enables therapist verification of AI reasoning

### Priority 3: Therapist Preference Tuning

Personalize AI output per therapist:

- Let therapists specify preferred therapeutic modalities (CBT, ACT, DBT)
- Store example "golden" plans as few-shot examples
- Dynamic prompt construction based on therapist profile
- Track and learn from therapist edits

### Priority 4: Client Engagement Features

Extend client experience beyond passive plan viewing:

- Goal progress tracking (client marks homework complete)
- Between-session check-ins via simple forms
- Motivational reminders and notifications
- Progress visualization over time

### Priority 5: Mobile App

React Native or PWA for client mobile experience:

- Offline plan viewing
- Push notifications for new plans
- Simple, focused UI for client engagement
- Share API with web, build mobile UI layer

### Priority 6: Advanced Safety Features

Enhance risk detection and response:

- Real-time crisis detection during transcript processing
- Integration with crisis hotline resources
- Therapist notification system for high-risk sessions
- Audit trail for safety reviews
