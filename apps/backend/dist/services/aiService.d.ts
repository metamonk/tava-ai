import OpenAI from 'openai';
export declare const openai: OpenAI;
export interface TranscriptSegment {
    speaker: 'therapist' | 'client';
    text: string;
    start: number;
    end: number;
}
export interface DiarizedTranscript {
    segments: TranscriptSegment[];
    fullText: string;
}
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
export declare function transcribeAudio(audioBuffer: Buffer, mimeType?: string): Promise<string>;
export declare function parseTranscript(transcript: string): DiarizedTranscript | null;
export declare function formatTranscriptForPrompt(transcript: string): string;
export declare function generateTherapistPlan(transcript: string, maxRetries?: number): Promise<TherapistPlan>;
export declare function generateClientPlan(therapistPlan: TherapistPlan, maxRetries?: number): Promise<ClientPlan>;
export type { OpenAI };
//# sourceMappingURL=aiService.d.ts.map