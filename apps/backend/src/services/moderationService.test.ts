import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  moderateContent,
  mapModerationToRiskLevel,
  evaluateContentRisk,
} from './moderationService';
import { openai } from './aiService';

// Mock OpenAI
vi.mock('./aiService', () => ({
  openai: {
    moderations: {
      create: vi.fn(),
    },
  },
}));

describe('Moderation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('moderateContent', () => {
    it('should call OpenAI Moderation API and return results', async () => {
      const mockResult = {
        results: [
          {
            flagged: false,
            categories: {
              'self-harm': false,
              'self-harm/intent': false,
              'self-harm/instructions': false,
              violence: false,
              'violence/graphic': false,
              sexual: false,
              'sexual/minors': false,
              harassment: false,
              'harassment/threatening': false,
              hate: false,
              'hate/threatening': false,
            },
            category_scores: {
              'self-harm': 0.01,
              'self-harm/intent': 0.01,
              'self-harm/instructions': 0.01,
              violence: 0.02,
              'violence/graphic': 0.01,
              sexual: 0.01,
              'sexual/minors': 0.01,
              harassment: 0.01,
              'harassment/threatening': 0.01,
              hate: 0.01,
              'hate/threatening': 0.01,
            },
          },
        ],
      };

      vi.mocked(openai.moderations.create).mockResolvedValue(mockResult as never);

      const result = await moderateContent('Normal therapy session content');

      expect(openai.moderations.create).toHaveBeenCalledWith({
        model: 'text-moderation-latest',
        input: 'Normal therapy session content',
      });
      expect(result.flagged).toBe(false);
    });

    it('should handle API errors', async () => {
      vi.mocked(openai.moderations.create).mockRejectedValue(new Error('API Error'));

      await expect(moderateContent('Some content')).rejects.toThrow('Content moderation failed');
    });
  });

  describe('mapModerationToRiskLevel', () => {
    it('should return high risk for self-harm/intent', () => {
      const moderation = {
        flagged: true,
        categories: {
          'self-harm': false,
          'self-harm/intent': true,
          'self-harm/instructions': false,
          violence: false,
          'violence/graphic': false,
          sexual: false,
          'sexual/minors': false,
          harassment: false,
          'harassment/threatening': false,
          hate: false,
          'hate/threatening': false,
        },
        category_scores: {
          'self-harm': 0.1,
          'self-harm/intent': 0.9,
          'self-harm/instructions': 0.1,
          violence: 0.1,
          'violence/graphic': 0.1,
          sexual: 0.01,
          'sexual/minors': 0.01,
          harassment: 0.01,
          'harassment/threatening': 0.01,
          hate: 0.01,
          'hate/threatening': 0.01,
        },
      };

      expect(mapModerationToRiskLevel(moderation)).toBe('high');
    });

    it('should return high risk for self-harm/instructions', () => {
      const moderation = {
        flagged: true,
        categories: {
          'self-harm': false,
          'self-harm/intent': false,
          'self-harm/instructions': true,
          violence: false,
          'violence/graphic': false,
          sexual: false,
          'sexual/minors': false,
          harassment: false,
          'harassment/threatening': false,
          hate: false,
          'hate/threatening': false,
        },
        category_scores: {
          'self-harm': 0.1,
          'self-harm/intent': 0.1,
          'self-harm/instructions': 0.85,
          violence: 0.1,
          'violence/graphic': 0.1,
          sexual: 0.01,
          'sexual/minors': 0.01,
          harassment: 0.01,
          'harassment/threatening': 0.01,
          hate: 0.01,
          'hate/threatening': 0.01,
        },
      };

      expect(mapModerationToRiskLevel(moderation)).toBe('high');
    });

    it('should return high risk for scores > 0.7', () => {
      const moderation = {
        flagged: true,
        categories: {
          'self-harm': false,
          'self-harm/intent': false,
          'self-harm/instructions': false,
          violence: true,
          'violence/graphic': false,
          sexual: false,
          'sexual/minors': false,
          harassment: false,
          'harassment/threatening': false,
          hate: false,
          'hate/threatening': false,
        },
        category_scores: {
          'self-harm': 0.1,
          'self-harm/intent': 0.1,
          'self-harm/instructions': 0.1,
          violence: 0.85,
          'violence/graphic': 0.1,
          sexual: 0.01,
          'sexual/minors': 0.01,
          harassment: 0.01,
          'harassment/threatening': 0.01,
          hate: 0.01,
          'hate/threatening': 0.01,
        },
      };

      expect(mapModerationToRiskLevel(moderation)).toBe('high');
    });

    it('should return medium risk for violence flagged with moderate scores', () => {
      const moderation = {
        flagged: true,
        categories: {
          'self-harm': false,
          'self-harm/intent': false,
          'self-harm/instructions': false,
          violence: true,
          'violence/graphic': false,
          sexual: false,
          'sexual/minors': false,
          harassment: false,
          'harassment/threatening': false,
          hate: false,
          'hate/threatening': false,
        },
        category_scores: {
          'self-harm': 0.1,
          'self-harm/intent': 0.1,
          'self-harm/instructions': 0.1,
          violence: 0.55,
          'violence/graphic': 0.1,
          sexual: 0.01,
          'sexual/minors': 0.01,
          harassment: 0.01,
          'harassment/threatening': 0.01,
          hate: 0.01,
          'hate/threatening': 0.01,
        },
      };

      expect(mapModerationToRiskLevel(moderation)).toBe('medium');
    });

    it('should return low risk for flagged content with low scores', () => {
      const moderation = {
        flagged: true,
        categories: {
          'self-harm': false,
          'self-harm/intent': false,
          'self-harm/instructions': false,
          violence: false,
          'violence/graphic': false,
          sexual: false,
          'sexual/minors': false,
          harassment: true,
          'harassment/threatening': false,
          hate: false,
          'hate/threatening': false,
        },
        category_scores: {
          'self-harm': 0.01,
          'self-harm/intent': 0.01,
          'self-harm/instructions': 0.01,
          violence: 0.1,
          'violence/graphic': 0.1,
          sexual: 0.01,
          'sexual/minors': 0.01,
          harassment: 0.25,
          'harassment/threatening': 0.1,
          hate: 0.01,
          'hate/threatening': 0.01,
        },
      };

      expect(mapModerationToRiskLevel(moderation)).toBe('low');
    });

    it('should return none for safe content', () => {
      const moderation = {
        flagged: false,
        categories: {
          'self-harm': false,
          'self-harm/intent': false,
          'self-harm/instructions': false,
          violence: false,
          'violence/graphic': false,
          sexual: false,
          'sexual/minors': false,
          harassment: false,
          'harassment/threatening': false,
          hate: false,
          'hate/threatening': false,
        },
        category_scores: {
          'self-harm': 0.01,
          'self-harm/intent': 0.01,
          'self-harm/instructions': 0.01,
          violence: 0.02,
          'violence/graphic': 0.01,
          sexual: 0.01,
          'sexual/minors': 0.01,
          harassment: 0.01,
          'harassment/threatening': 0.01,
          hate: 0.01,
          'hate/threatening': 0.01,
        },
      };

      expect(mapModerationToRiskLevel(moderation)).toBe('none');
    });
  });

  describe('evaluateContentRisk', () => {
    it('should return risk level from moderation result', async () => {
      const mockResult = {
        results: [
          {
            flagged: false,
            categories: {
              'self-harm': false,
              'self-harm/intent': false,
              'self-harm/instructions': false,
              violence: false,
              'violence/graphic': false,
              sexual: false,
              'sexual/minors': false,
              harassment: false,
              'harassment/threatening': false,
              hate: false,
              'hate/threatening': false,
            },
            category_scores: {
              'self-harm': 0.01,
              'self-harm/intent': 0.01,
              'self-harm/instructions': 0.01,
              violence: 0.02,
              'violence/graphic': 0.01,
              sexual: 0.01,
              'sexual/minors': 0.01,
              harassment: 0.01,
              'harassment/threatening': 0.01,
              hate: 0.01,
              'hate/threatening': 0.01,
            },
          },
        ],
      };

      vi.mocked(openai.moderations.create).mockResolvedValue(mockResult as never);

      const result = await evaluateContentRisk('Normal therapy content');

      expect(result).toBe('none');
    });
  });
});
