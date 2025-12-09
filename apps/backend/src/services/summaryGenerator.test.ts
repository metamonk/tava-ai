import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateTherapistSummary,
  generateClientSummary,
  generateSessionSummary,
} from './summaryGenerator';
import { openai } from './aiService';

// Mock OpenAI
vi.mock('./aiService', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

const mockOpenAIResponse = (content: string) => ({
  choices: [
    {
      message: {
        content,
        role: 'assistant',
      },
      finish_reason: 'stop',
      index: 0,
    },
  ],
  created: Date.now(),
  id: 'test-id',
  model: 'gpt-4-turbo-preview',
  object: 'chat.completion',
});

describe('Summary Generator Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateTherapistSummary', () => {
    const mockTranscript = 'Patient discussed anxiety about work deadlines and sleep issues...';
    const mockSessionDate = '2024-01-15T10:00:00Z';

    const validTherapistSummary = {
      sessionFocus: 'Addressing work-related anxiety and sleep disturbances',
      keyDiscussionPoints: [
        'Work deadline stress',
        'Sleep quality issues',
        'Relationship with supervisor',
      ],
      clinicalObservations: [
        'Client showed increased affect when discussing supervisor',
        'Demonstrated insight into anxiety patterns',
      ],
      progressNotes: 'Client continues to make progress in identifying anxiety triggers.',
      followUpItems: ['Monitor sleep patterns', 'Practice relaxation techniques'],
    };

    it('should generate therapist summary from transcript', async () => {
      vi.mocked(openai.chat.completions.create).mockResolvedValue(
        mockOpenAIResponse(JSON.stringify(validTherapistSummary)) as never
      );

      const result = await generateTherapistSummary(mockTranscript, mockSessionDate);

      expect(result).toEqual(validTherapistSummary);
      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4-turbo-preview',
          response_format: { type: 'json_object' },
          temperature: 0.3,
        })
      );
    });

    it('should handle malformed JSON response', async () => {
      vi.mocked(openai.chat.completions.create).mockResolvedValue(
        mockOpenAIResponse('Invalid JSON {}}') as never
      );

      await expect(generateTherapistSummary(mockTranscript, mockSessionDate, 1)).rejects.toThrow(
        /Therapist summary generation failed/
      );
    });

    it('should handle missing required fields', async () => {
      const incompleteSummary = {
        sessionFocus: 'Some focus',
        // Missing other required fields
      };
      vi.mocked(openai.chat.completions.create).mockResolvedValue(
        mockOpenAIResponse(JSON.stringify(incompleteSummary)) as never
      );

      await expect(generateTherapistSummary(mockTranscript, mockSessionDate, 1)).rejects.toThrow(
        /Missing required field/
      );
    });

    it('should handle empty GPT response', async () => {
      vi.mocked(openai.chat.completions.create).mockResolvedValue({
        choices: [
          { message: { content: null, role: 'assistant' }, finish_reason: 'stop', index: 0 },
        ],
        created: Date.now(),
        id: 'test-id',
        model: 'gpt-4-turbo-preview',
        object: 'chat.completion',
      } as never);

      await expect(generateTherapistSummary(mockTranscript, mockSessionDate, 1)).rejects.toThrow(
        /Empty GPT response/
      );
    });
  });

  describe('generateClientSummary', () => {
    const mockTranscript = 'Patient discussed anxiety about work deadlines...';
    const mockSessionDate = '2024-01-15T10:00:00Z';

    const validClientSummary = {
      whatWeWorkedOn:
        'Today we talked about how work deadlines have been making you feel stressed and anxious.',
      keyTakeaways: [
        'You recognized that anxiety is often triggered by tight deadlines',
        'You have good coping skills that we can build on',
      ],
      encouragement:
        "You're doing great work by showing up and being open about your feelings. That takes courage!",
      nextSteps: [
        'Try the breathing exercise when you feel stressed at work',
        'Write down one positive thing each day',
      ],
    };

    it('should generate client-friendly summary', async () => {
      vi.mocked(openai.chat.completions.create).mockResolvedValue(
        mockOpenAIResponse(JSON.stringify(validClientSummary)) as never
      );

      const result = await generateClientSummary(mockTranscript, mockSessionDate);

      expect(result).toEqual(validClientSummary);
      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4-turbo-preview',
          response_format: { type: 'json_object' },
          temperature: 0.5, // Higher temperature for client summaries
        })
      );
    });

    it('should handle missing required fields', async () => {
      const incompleteSummary = {
        whatWeWorkedOn: 'We talked about things',
        // Missing other required fields
      };
      vi.mocked(openai.chat.completions.create).mockResolvedValue(
        mockOpenAIResponse(JSON.stringify(incompleteSummary)) as never
      );

      await expect(generateClientSummary(mockTranscript, mockSessionDate, 1)).rejects.toThrow(
        /Missing required field/
      );
    });
  });

  describe('generateSessionSummary', () => {
    const mockTranscript = 'Patient discussed anxiety...';
    const mockSessionDate = '2024-01-15T10:00:00Z';

    const validTherapistSummary = {
      sessionFocus: 'Anxiety management',
      keyDiscussionPoints: ['Work stress'],
      clinicalObservations: ['Good insight'],
      progressNotes: 'Progress noted',
      followUpItems: ['Monitor'],
    };

    const validClientSummary = {
      whatWeWorkedOn: 'We talked about your anxiety',
      keyTakeaways: ['Anxiety is manageable'],
      encouragement: "You're doing great!",
      nextSteps: ['Practice breathing'],
    };

    it('should generate both summaries in parallel', async () => {
      vi.mocked(openai.chat.completions.create)
        .mockResolvedValueOnce(mockOpenAIResponse(JSON.stringify(validTherapistSummary)) as never)
        .mockResolvedValueOnce(mockOpenAIResponse(JSON.stringify(validClientSummary)) as never);

      const result = await generateSessionSummary(mockTranscript, mockSessionDate);

      expect(result.therapistSummary).toEqual(validTherapistSummary);
      expect(result.clientSummary).toEqual(validClientSummary);
      expect(openai.chat.completions.create).toHaveBeenCalledTimes(2);
    });
  });
});
