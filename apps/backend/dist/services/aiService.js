import OpenAI from 'openai';
import { toFile } from 'openai';
// Initialize OpenAI client
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
// SPEAKER CLASSIFICATION PROMPT
const SPEAKER_CLASSIFICATION_PROMPT = `You are analyzing a therapy session transcript with two speakers labeled A and B.

Determine which speaker is the THERAPIST based on these indicators:
- Asks open-ended therapeutic questions ("How did that make you feel?", "Tell me more about...")
- Uses reflective listening ("So what I'm hearing is...", "It sounds like...")
- Uses clinical/professional language
- Guides the conversation structure, sets agenda
- Summarizes, validates, or assigns homework
- Maintains professional distance (doesn't share personal problems)

The CLIENT typically:
- Shares personal experiences and emotions
- Describes problems, concerns, or symptoms
- Responds to therapeutic prompts
- Discusses their own life situations

Analyze the ENTIRE conversation to make your determination. Look at patterns across multiple exchanges, not just individual statements.

Respond with ONLY valid JSON:
{"therapist": "A" | "B", "confidence": "high" | "medium" | "low", "reasoning": "brief explanation"}`;
async function classifySpeakers(rawSegments) {
    // Format transcript for analysis
    const transcriptForAnalysis = rawSegments
        .map(seg => `${seg.speaker}: ${seg.text}`)
        .join('\n');
    const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
            { role: 'system', content: SPEAKER_CLASSIFICATION_PROMPT },
            { role: 'user', content: transcriptForAnalysis },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1, // Low temperature for consistent classification
        max_tokens: 200,
    });
    const content = completion.choices[0].message.content;
    if (!content)
        throw new Error('Empty speaker classification response');
    return JSON.parse(content);
}
// WHISPER TRANSCRIPTION WITH DIARIZATION
export async function transcribeAudio(audioBuffer, mimeType = 'audio/wav') {
    try {
        // Determine file extension from mime type
        const extensionMap = {
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
        // Use GPT-4o transcribe with diarization for speaker identification
        const transcription = await openai.audio.transcriptions.create({
            file: file,
            model: 'gpt-4o-transcribe-diarize',
            language: 'en',
            response_format: 'diarized_json',
            chunking_strategy: 'auto',
        });
        // Check if we have segments with speaker info
        const response = transcription;
        // If no segments or no speaker info, return plain text (fallback)
        if (!response.segments || response.segments.length === 0 || !response.segments[0].speaker) {
            console.warn('Diarization not available, returning plain text');
            return response.text.trim();
        }
        // Extract raw segments with speaker labels
        const rawSegments = response.segments.map(seg => ({
            speaker: seg.speaker || 'UNKNOWN',
            text: seg.text.trim(),
            start: seg.start,
            end: seg.end,
        }));
        // Classify speakers (therapist vs client)
        const classification = await classifySpeakers(rawSegments);
        console.log(`Speaker classification: ${classification.therapist} is therapist (${classification.confidence} confidence)`);
        // Map generic labels to roles - find all unique speakers and determine client label
        const therapistLabel = classification.therapist;
        const uniqueSpeakers = [...new Set(rawSegments.map(s => s.speaker))];
        const clientLabel = uniqueSpeakers.find(s => s !== therapistLabel) || 'B';
        // Build diarized transcript structure
        const diarizedTranscript = {
            segments: rawSegments.map(seg => ({
                speaker: seg.speaker === therapistLabel ? 'therapist' : 'client',
                text: seg.text,
                start: seg.start,
                end: seg.end,
            })),
            fullText: rawSegments.map(seg => seg.text).join(' '),
        };
        // Return as JSON string (stored in transcript field)
        return JSON.stringify(diarizedTranscript);
    }
    catch (error) {
        console.error('Whisper transcription error:', error);
        throw new Error('Audio transcription failed');
    }
}
// Utility to parse transcript (handles both plain text and diarized JSON)
export function parseTranscript(transcript) {
    try {
        const parsed = JSON.parse(transcript);
        if (parsed.segments && Array.isArray(parsed.segments)) {
            return parsed;
        }
        return null;
    }
    catch {
        // Plain text transcript
        return null;
    }
}
// Format diarized transcript for AI prompts
export function formatTranscriptForPrompt(transcript) {
    const diarized = parseTranscript(transcript);
    if (!diarized) {
        // Plain text - return as-is
        return transcript;
    }
    // Format with speaker labels
    return diarized.segments
        .map(seg => `[${seg.speaker.toUpperCase()}]: ${seg.text}`)
        .join('\n\n');
}
// GPT-4 THERAPIST PLAN GENERATION
const THERAPIST_PLAN_PROMPT = `You are a licensed clinical psychologist creating a treatment plan from a therapy session transcript.

The transcript has speaker labels:
- [THERAPIST]: Statements made by the therapist
- [CLIENT]: Statements made by the client

Use these labels to accurately attribute information:

From CLIENT statements, extract:
1. Presenting concerns (issues they explicitly raised)
2. Their stated strengths and protective factors
3. Risks or red flags (self-harm, suicidal ideation, substance use mentions)

From THERAPIST statements, extract:
4. Clinical impressions (professional observations noted)
5. Interventions used (CBT, DBT, mindfulness, etc.)
6. Homework assigned

From the overall session, determine:
7. Short-term goals (achievable within 1-3 sessions)
8. Long-term goals (achievable within 3-6 months)

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
export async function generateTherapistPlan(transcript, maxRetries = 3) {
    // Format transcript with speaker labels if diarized
    const formattedTranscript = formatTranscriptForPrompt(transcript);
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    { role: 'system', content: THERAPIST_PLAN_PROMPT },
                    { role: 'user', content: `Transcript:\n${formattedTranscript}` },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3,
                max_tokens: 2000,
            });
            const content = completion.choices[0].message.content;
            if (!content)
                throw new Error('Empty GPT response');
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
            return parsed;
        }
        catch (error) {
            const err = error;
            lastError = err;
            console.error(`Therapist plan generation attempt ${attempt} failed:`, error);
            // Check if error is retryable (rate limit, timeout, network)
            const isRetryable = err.status === 429 || (err.status && err.status >= 500) || err.code === 'ETIMEDOUT';
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
export async function generateClientPlan(therapistPlan, maxRetries = 3) {
    let lastError = null;
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
            if (!content)
                throw new Error('Empty GPT response');
            // Validate client plan structure
            const parsed = JSON.parse(content);
            const required = ['yourProgress', 'goalsWeAreWorkingOn', 'thingsToTry', 'yourStrengths'];
            for (const field of required) {
                if (!(field in parsed)) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }
            return parsed;
        }
        catch (error) {
            const err = error;
            lastError = err;
            console.error(`Client plan generation attempt ${attempt} failed:`, error);
            const isRetryable = err.status === 429 || (err.status && err.status >= 500) || err.code === 'ETIMEDOUT';
            if (!isRetryable || attempt === maxRetries) {
                throw new Error(`Client plan generation failed after ${attempt} attempts: ${err.message}`);
            }
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        }
    }
    throw lastError || new Error('Client plan generation failed');
}
