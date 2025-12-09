import { openai } from './aiService';

// TypeScript interfaces for session summaries
export interface TherapistSummary {
  sessionFocus: string;
  keyDiscussionPoints: string[];
  clinicalObservations: string[];
  progressNotes: string;
  followUpItems: string[];
}

export interface ClientSummary {
  whatWeWorkedOn: string;
  keyTakeaways: string[];
  encouragement: string;
  nextSteps: string[];
}

// GPT-4 THERAPIST SUMMARY GENERATION
const THERAPIST_SUMMARY_PROMPT = `You are a licensed clinical psychologist creating a session summary from a therapy session transcript.

Analyze the transcript and create a concise clinical session summary with:
1. Session Focus: A brief 1-2 sentence overview of the primary theme/focus of this session
2. Key Discussion Points: 3-5 main topics discussed during the session
3. Clinical Observations: 3-5 notable observations from a clinical perspective (affect, engagement, progress, challenges)
4. Progress Notes: A brief paragraph summarizing the client's progress and therapeutic movement
5. Follow-up Items: 2-4 specific items to address or monitor in future sessions

Use professional clinical language appropriate for medical records and clinical documentation.

Respond with ONLY valid JSON matching this schema:
{
  "sessionFocus": string,
  "keyDiscussionPoints": string[],
  "clinicalObservations": string[],
  "progressNotes": string,
  "followUpItems": string[]
}`;

export async function generateTherapistSummary(
  transcript: string,
  sessionDate: string,
  maxRetries = 3
): Promise<TherapistSummary> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: THERAPIST_SUMMARY_PROMPT },
          {
            role: 'user',
            content: `Session Date: ${sessionDate}\n\nTranscript:\n${transcript}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 1500,
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error('Empty GPT response');

      const parsed = JSON.parse(content);

      // Validate schema
      const required = [
        'sessionFocus',
        'keyDiscussionPoints',
        'clinicalObservations',
        'progressNotes',
        'followUpItems',
      ];
      for (const field of required) {
        if (!(field in parsed)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return parsed as TherapistSummary;
    } catch (error: unknown) {
      const err = error as Error & { status?: number; code?: string };
      lastError = err;
      console.error(`Therapist summary generation attempt ${attempt} failed:`, error);

      // Check if error is retryable (rate limit, timeout, network)
      const isRetryable =
        err.status === 429 || (err.status && err.status >= 500) || err.code === 'ETIMEDOUT';

      if (!isRetryable || attempt === maxRetries) {
        throw new Error(
          `Therapist summary generation failed after ${attempt} attempts: ${err.message}`
        );
      }

      // Exponential backoff: 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
    }
  }

  throw lastError || new Error('Therapist summary generation failed');
}

// GPT-4 CLIENT SUMMARY GENERATION
const CLIENT_SUMMARY_PROMPT = `You are creating a friendly, encouraging session recap for a therapy client (non-clinician).

Based on this session transcript, create a warm, accessible summary that:
- Uses simple, encouraging language at a 7th grade reading level
- Focuses on what was accomplished and positive movement
- Avoids clinical jargon and technical terminology
- Has a supportive, motivational tone
- Emphasizes the client's strengths and effort

Respond with ONLY valid JSON matching this schema:
{
  "whatWeWorkedOn": string (2-3 sentences describing what you worked on together),
  "keyTakeaways": string[] (3-4 important insights or realizations from the session),
  "encouragement": string (2-3 sentences of genuine encouragement and validation),
  "nextSteps": string[] (2-3 simple, specific actions or things to practice before next session)
}`;

export async function generateClientSummary(
  transcript: string,
  sessionDate: string,
  maxRetries = 3
): Promise<ClientSummary> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: CLIENT_SUMMARY_PROMPT },
          {
            role: 'user',
            content: `Session Date: ${sessionDate}\n\nTranscript:\n${transcript}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 1200,
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error('Empty GPT response');

      // Validate client summary structure
      const parsed = JSON.parse(content);
      const required = ['whatWeWorkedOn', 'keyTakeaways', 'encouragement', 'nextSteps'];
      for (const field of required) {
        if (!(field in parsed)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return parsed as ClientSummary;
    } catch (error: unknown) {
      const err = error as Error & { status?: number; code?: string };
      lastError = err;
      console.error(`Client summary generation attempt ${attempt} failed:`, error);

      const isRetryable =
        err.status === 429 || (err.status && err.status >= 500) || err.code === 'ETIMEDOUT';

      if (!isRetryable || attempt === maxRetries) {
        throw new Error(
          `Client summary generation failed after ${attempt} attempts: ${err.message}`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
    }
  }

  throw lastError || new Error('Client summary generation failed');
}

// Combined function to generate both summaries
export async function generateSessionSummary(
  transcript: string,
  sessionDate: string
): Promise<{ therapistSummary: TherapistSummary; clientSummary: ClientSummary }> {
  const [therapistSummary, clientSummary] = await Promise.all([
    generateTherapistSummary(transcript, sessionDate),
    generateClientSummary(transcript, sessionDate),
  ]);

  return {
    therapistSummary,
    clientSummary,
  };
}
