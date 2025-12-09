import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock OpenAI module before importing the service
const mockTranscriptionsCreate = vi.fn();
const mockChatCompletionsCreate = vi.fn();

vi.mock('openai', () => ({
  default: class MockOpenAI {
    audio = {
      transcriptions: {
        create: mockTranscriptionsCreate,
      },
    };
    chat = {
      completions: {
        create: mockChatCompletionsCreate,
      },
    };
  },
  toFile: vi.fn().mockResolvedValue({ name: 'audio.wav' }),
}));

// Import after mocking
import type { TherapistPlan } from './aiService';

describe('AI Service', () => {
  // Import dynamically to ensure mocks are in place
  let transcribeAudio: typeof import('./aiService').transcribeAudio;
  let generateTherapistPlan: typeof import('./aiService').generateTherapistPlan;
  let generateClientPlan: typeof import('./aiService').generateClientPlan;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Re-import to get fresh module with mocks
    const module = await import('./aiService');
    transcribeAudio = module.transcribeAudio;
    generateTherapistPlan = module.generateTherapistPlan;
    generateClientPlan = module.generateClientPlan;
  });

  describe('transcribeAudio', () => {
    it('should call Whisper API with correct parameters', async () => {
      const mockTranscription = 'Client discussed feelings of anxiety and stress related to work.';
      mockTranscriptionsCreate.mockResolvedValue(mockTranscription);

      const buffer = Buffer.from('fake audio data');
      const result = await transcribeAudio(buffer, 'audio/wav');

      expect(mockTranscriptionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'whisper-1',
          language: 'en',
          response_format: 'text',
        })
      );
      expect(result).toBe(mockTranscription);
    });

    it('should handle different audio formats', async () => {
      mockTranscriptionsCreate.mockResolvedValue('Transcript content');

      const buffer = Buffer.from('fake audio');
      await transcribeAudio(buffer, 'audio/mp3');

      expect(mockTranscriptionsCreate).toHaveBeenCalled();
    });

    it('should throw error on API failure', async () => {
      mockTranscriptionsCreate.mockRejectedValue(new Error('API Error'));

      const buffer = Buffer.from('fake audio');
      await expect(transcribeAudio(buffer)).rejects.toThrow('Audio transcription failed');
    });

    it('should trim whitespace from transcript', async () => {
      mockTranscriptionsCreate.mockResolvedValue('  Transcript with whitespace  ');

      const buffer = Buffer.from('fake audio');
      const result = await transcribeAudio(buffer);

      expect(result).toBe('Transcript with whitespace');
    });
  });

  describe('generateTherapistPlan', () => {
    const validTherapistPlan: TherapistPlan = {
      presentingConcerns: ['Anxiety', 'Work stress'],
      clinicalImpressions:
        'Client presents with moderate anxiety symptoms related to workplace stressors.',
      shortTermGoals: ['Implement daily relaxation techniques', 'Identify anxiety triggers'],
      longTermGoals: ['Develop comprehensive coping strategy', 'Reduce anxiety symptoms by 50%'],
      interventionsUsed: ['CBT', 'Mindfulness'],
      homework: ['Practice breathing exercises', 'Keep anxiety journal'],
      strengths: ['High motivation', 'Strong social support'],
      risks: [],
    };

    it('should call GPT-4 with correct system prompt and transcript', async () => {
      mockChatCompletionsCreate.mockResolvedValue({
        choices: [
          {
            message: { content: JSON.stringify(validTherapistPlan) },
            finish_reason: 'stop',
          },
        ],
      });

      const transcript = 'Session transcript content';
      await generateTherapistPlan(transcript);

      expect(mockChatCompletionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4-turbo-preview',
          temperature: 0.3,
          response_format: { type: 'json_object' },
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining(transcript),
            }),
          ]),
        })
      );
    });

    it('should parse JSON response correctly', async () => {
      mockChatCompletionsCreate.mockResolvedValue({
        choices: [
          {
            message: { content: JSON.stringify(validTherapistPlan) },
            finish_reason: 'stop',
          },
        ],
      });

      const result = await generateTherapistPlan('Test transcript');

      expect(result).toEqual(validTherapistPlan);
      expect(result.presentingConcerns).toContain('Anxiety');
      expect(result.clinicalImpressions).toBeDefined();
    });

    it('should throw error on empty GPT response', async () => {
      mockChatCompletionsCreate.mockResolvedValue({
        choices: [
          {
            message: { content: null },
            finish_reason: 'stop',
          },
        ],
      });

      await expect(generateTherapistPlan('transcript')).rejects.toThrow();
    });

    it('should throw error when required field is missing', async () => {
      const incompletePlan = { presentingConcerns: ['Anxiety'] };
      mockChatCompletionsCreate.mockResolvedValue({
        choices: [
          {
            message: { content: JSON.stringify(incompletePlan) },
            finish_reason: 'stop',
          },
        ],
      });

      await expect(generateTherapistPlan('transcript')).rejects.toThrow('Missing required field');
    });

    it('should retry on rate limit errors', async () => {
      const rateLimitError = new Error('Rate limit') as Error & { status: number };
      rateLimitError.status = 429;

      mockChatCompletionsCreate.mockRejectedValueOnce(rateLimitError).mockResolvedValueOnce({
        choices: [
          {
            message: { content: JSON.stringify(validTherapistPlan) },
            finish_reason: 'stop',
          },
        ],
      });

      const result = await generateTherapistPlan('transcript');

      expect(mockChatCompletionsCreate).toHaveBeenCalledTimes(2);
      expect(result).toEqual(validTherapistPlan);
    }, 10000);

    it('should throw after max retries on persistent API errors', async () => {
      const serverError = new Error('Server error') as Error & { status: number };
      serverError.status = 500;

      mockChatCompletionsCreate.mockRejectedValue(serverError);

      await expect(generateTherapistPlan('transcript', 2)).rejects.toThrow(
        'Plan generation failed'
      );
      expect(mockChatCompletionsCreate).toHaveBeenCalledTimes(2);
    }, 15000);
  });

  describe('generateClientPlan', () => {
    const therapistPlan: TherapistPlan = {
      presentingConcerns: ['Anxiety', 'Sleep issues'],
      clinicalImpressions: 'Moderate GAD with secondary insomnia',
      shortTermGoals: ['Improve sleep hygiene', 'Reduce worry'],
      longTermGoals: ['Sustained anxiety reduction'],
      interventionsUsed: ['CBT', 'Sleep hygiene education'],
      homework: ['Sleep diary', 'Breathing exercises'],
      strengths: ['Motivated', 'Insightful'],
      risks: [],
    };

    const validClientPlan = {
      yourProgress: 'You are doing great work in recognizing your patterns!',
      goalsWeAreWorkingOn: ['Getting better sleep', 'Feeling calmer during the day'],
      thingsToTry: ['Try the breathing exercises we discussed', 'Write in your sleep diary'],
      yourStrengths: ['You are motivated and insightful'],
    };

    it('should call GPT-4 with therapist plan as input', async () => {
      mockChatCompletionsCreate.mockResolvedValue({
        choices: [
          {
            message: { content: JSON.stringify(validClientPlan) },
            finish_reason: 'stop',
          },
        ],
      });

      await generateClientPlan(therapistPlan);

      expect(mockChatCompletionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4-turbo-preview',
          temperature: 0.5,
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({
              role: 'user',
              content: JSON.stringify(therapistPlan),
            }),
          ]),
        })
      );
    });

    it('should return client-friendly plan without clinical terminology', async () => {
      mockChatCompletionsCreate.mockResolvedValue({
        choices: [
          {
            message: { content: JSON.stringify(validClientPlan) },
            finish_reason: 'stop',
          },
        ],
      });

      const result = await generateClientPlan(therapistPlan);

      expect(result).toHaveProperty('yourProgress');
      expect(result).toHaveProperty('goalsWeAreWorkingOn');
      expect(result).toHaveProperty('thingsToTry');
      expect(result).toHaveProperty('yourStrengths');
      expect(result).not.toHaveProperty('clinicalImpressions');
      expect(result).not.toHaveProperty('risks');
    });

    it('should throw error when required client plan field is missing', async () => {
      const incompletePlan = { yourProgress: 'Good job!' };
      mockChatCompletionsCreate.mockResolvedValue({
        choices: [
          {
            message: { content: JSON.stringify(incompletePlan) },
            finish_reason: 'stop',
          },
        ],
      });

      await expect(generateClientPlan(therapistPlan)).rejects.toThrow('Missing required field');
    });

    it('should retry on transient failures', async () => {
      const timeoutError = new Error('Timeout') as Error & { code: string };
      timeoutError.code = 'ETIMEDOUT';

      mockChatCompletionsCreate.mockRejectedValueOnce(timeoutError).mockResolvedValueOnce({
        choices: [
          {
            message: { content: JSON.stringify(validClientPlan) },
            finish_reason: 'stop',
          },
        ],
      });

      const result = await generateClientPlan(therapistPlan);

      expect(mockChatCompletionsCreate).toHaveBeenCalledTimes(2);
      expect(result.yourProgress).toBeDefined();
    }, 10000);
  });
});
