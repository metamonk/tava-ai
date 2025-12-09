import OpenAI from 'openai';
import { toFile } from 'openai';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// TypeScript interfaces for treatment plans
export interface TherapistPlan {
  presentingConcerns: string[];
  clinicalImpressions: string;
  shortTermGoals: string[];
  longTermGoals: string[];
  interventionsUsed: string[];
  homework: string[];
  strengths: string[];
  risks: string[];
}

export interface ClientPlan {
  yourProgress: string;
  goalsWeAreWorkingOn: string[];
  thingsToTry: string[];
  yourStrengths: string[];
}

// WHISPER TRANSCRIPTION
export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string = 'audio/wav'
): Promise<string> {
  try {
    // Determine file extension from mime type
    const extensionMap: Record<string, string> = {
      'audio/wav': 'wav',
      'audio/wave': 'wav',
      'audio/x-wav': 'wav',
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/mp4': 'mp4',
      'audio/m4a': 'm4a',
      'audio/x-m4a': 'm4a',
      'audio/webm': 'webm',
      'audio/ogg': 'ogg',
    };
    const extension = extensionMap[mimeType] || 'wav';

    // Convert buffer to file-like object for OpenAI SDK
    const file = await toFile(audioBuffer, `audio.${extension}`, { type: mimeType });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text',
    });

    // The response is a string when response_format is 'text'
    return (transcription as unknown as string).trim();
  } catch (error) {
    console.error('Whisper transcription error:', error);
    throw new Error('Audio transcription failed');
  }
}

// GPT-4 THERAPIST PLAN GENERATION
const THERAPIST_PLAN_PROMPT = `You are a licensed clinical psychologist creating a treatment plan from a therapy session transcript.

Analyze the transcript and extract:
1. Presenting concerns (main issues discussed)
2. Clinical impressions (professional assessment)
3. Short-term goals (achievable within 1-3 sessions)
4. Long-term goals (achievable within 3-6 months)
5. Interventions used (CBT, DBT, mindfulness, etc.)
6. Homework assigned
7. Strengths and protective factors
8. Risks or red flags (self-harm, suicidal ideation, etc.)

Respond with ONLY valid JSON matching this schema:
{
  "presentingConcerns": string[],
  "clinicalImpressions": string,
  "shortTermGoals": string[],
  "longTermGoals": string[],
  "interventionsUsed": string[],
  "homework": string[],
  "strengths": string[],
  "risks": string[]
}`;

export async function generateTherapistPlan(
  transcript: string,
  maxRetries = 3
): Promise<TherapistPlan> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: THERAPIST_PLAN_PROMPT },
          { role: 'user', content: `Transcript:\n${transcript}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error('Empty GPT response');

      const parsed = JSON.parse(content);

      // Validate schema
      const required = [
        'presentingConcerns',
        'clinicalImpressions',
        'shortTermGoals',
        'longTermGoals',
        'interventionsUsed',
        'homework',
        'strengths',
        'risks',
      ];
      for (const field of required) {
        if (!(field in parsed)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return parsed as TherapistPlan;
    } catch (error: unknown) {
      const err = error as Error & { status?: number; code?: string };
      lastError = err;
      console.error(`Therapist plan generation attempt ${attempt} failed:`, error);

      // Check if error is retryable (rate limit, timeout, network)
      const isRetryable =
        err.status === 429 || (err.status && err.status >= 500) || err.code === 'ETIMEDOUT';

      if (!isRetryable || attempt === maxRetries) {
        throw new Error(`Plan generation failed after ${attempt} attempts: ${err.message}`);
      }

      // Exponential backoff: 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
    }
  }

  throw lastError || new Error('Plan generation failed');
}

// GPT-4 CLIENT PLAN GENERATION
const CLIENT_PLAN_PROMPT = `You are creating a simplified, motivational treatment plan for a therapy client (non-clinician).

Based on this clinical plan, create a client-friendly version using:
- Simple, encouraging language (7th grade reading level)
- Focus on strengths and progress
- Clear, actionable goals
- No clinical jargon
- Motivational tone

Respond with ONLY valid JSON matching this schema:
{
  "yourProgress": string,
  "goalsWeAreWorkingOn": string[],
  "thingsToTry": string[],
  "yourStrengths": string[]
}`;

export async function generateClientPlan(
  therapistPlan: TherapistPlan,
  maxRetries = 3
): Promise<ClientPlan> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: CLIENT_PLAN_PROMPT },
          { role: 'user', content: JSON.stringify(therapistPlan) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 1500,
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error('Empty GPT response');

      // Validate client plan structure
      const parsed = JSON.parse(content);
      const required = ['yourProgress', 'goalsWeAreWorkingOn', 'thingsToTry', 'yourStrengths'];
      for (const field of required) {
        if (!(field in parsed)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return parsed as ClientPlan;
    } catch (error: unknown) {
      const err = error as Error & { status?: number; code?: string };
      lastError = err;
      console.error(`Client plan generation attempt ${attempt} failed:`, error);

      const isRetryable =
        err.status === 429 || (err.status && err.status >= 500) || err.code === 'ETIMEDOUT';

      if (!isRetryable || attempt === maxRetries) {
        throw new Error(`Client plan generation failed after ${attempt} attempts: ${err.message}`);
      }

      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
    }
  }

  throw lastError || new Error('Client plan generation failed');
}

// Re-export OpenAI type for use in other modules
export type { OpenAI };
