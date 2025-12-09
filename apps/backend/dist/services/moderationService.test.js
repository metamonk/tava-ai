"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const moderationService_1 = require("./moderationService");
const aiService_1 = require("./aiService");
// Mock OpenAI
vitest_1.vi.mock('./aiService', () => ({
    openai: {
        moderations: {
            create: vitest_1.vi.fn(),
        },
    },
}));
(0, vitest_1.describe)('Moderation Service', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('moderateContent', () => {
        (0, vitest_1.it)('should call OpenAI Moderation API and return results', async () => {
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
            vitest_1.vi.mocked(aiService_1.openai.moderations.create).mockResolvedValue(mockResult);
            const result = await (0, moderationService_1.moderateContent)('Normal therapy session content');
            (0, vitest_1.expect)(aiService_1.openai.moderations.create).toHaveBeenCalledWith({
                model: 'text-moderation-latest',
                input: 'Normal therapy session content',
            });
            (0, vitest_1.expect)(result.flagged).toBe(false);
        });
        (0, vitest_1.it)('should handle API errors', async () => {
            vitest_1.vi.mocked(aiService_1.openai.moderations.create).mockRejectedValue(new Error('API Error'));
            await (0, vitest_1.expect)((0, moderationService_1.moderateContent)('Some content')).rejects.toThrow('Content moderation failed');
        });
    });
    (0, vitest_1.describe)('mapModerationToRiskLevel', () => {
        (0, vitest_1.it)('should return high risk for self-harm/intent', () => {
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
            (0, vitest_1.expect)((0, moderationService_1.mapModerationToRiskLevel)(moderation)).toBe('high');
        });
        (0, vitest_1.it)('should return high risk for self-harm/instructions', () => {
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
            (0, vitest_1.expect)((0, moderationService_1.mapModerationToRiskLevel)(moderation)).toBe('high');
        });
        (0, vitest_1.it)('should return high risk for scores > 0.7', () => {
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
            (0, vitest_1.expect)((0, moderationService_1.mapModerationToRiskLevel)(moderation)).toBe('high');
        });
        (0, vitest_1.it)('should return medium risk for violence flagged with moderate scores', () => {
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
            (0, vitest_1.expect)((0, moderationService_1.mapModerationToRiskLevel)(moderation)).toBe('medium');
        });
        (0, vitest_1.it)('should return low risk for flagged content with low scores', () => {
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
            (0, vitest_1.expect)((0, moderationService_1.mapModerationToRiskLevel)(moderation)).toBe('low');
        });
        (0, vitest_1.it)('should return none for safe content', () => {
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
            (0, vitest_1.expect)((0, moderationService_1.mapModerationToRiskLevel)(moderation)).toBe('none');
        });
    });
    (0, vitest_1.describe)('evaluateContentRisk', () => {
        (0, vitest_1.it)('should return risk level from moderation result', async () => {
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
            vitest_1.vi.mocked(aiService_1.openai.moderations.create).mockResolvedValue(mockResult);
            const result = await (0, moderationService_1.evaluateContentRisk)('Normal therapy content');
            (0, vitest_1.expect)(result).toBe('none');
        });
    });
});
