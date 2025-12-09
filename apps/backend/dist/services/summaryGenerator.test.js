"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const summaryGenerator_1 = require("./summaryGenerator");
const aiService_1 = require("./aiService");
// Mock OpenAI
vitest_1.vi.mock('./aiService', () => ({
    openai: {
        chat: {
            completions: {
                create: vitest_1.vi.fn(),
            },
        },
    },
}));
const mockOpenAIResponse = (content) => ({
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
(0, vitest_1.describe)('Summary Generator Service', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('generateTherapistSummary', () => {
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
        (0, vitest_1.it)('should generate therapist summary from transcript', async () => {
            vitest_1.vi.mocked(aiService_1.openai.chat.completions.create).mockResolvedValue(mockOpenAIResponse(JSON.stringify(validTherapistSummary)));
            const result = await (0, summaryGenerator_1.generateTherapistSummary)(mockTranscript, mockSessionDate);
            (0, vitest_1.expect)(result).toEqual(validTherapistSummary);
            (0, vitest_1.expect)(aiService_1.openai.chat.completions.create).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                model: 'gpt-4-turbo-preview',
                response_format: { type: 'json_object' },
                temperature: 0.3,
            }));
        });
        (0, vitest_1.it)('should handle malformed JSON response', async () => {
            vitest_1.vi.mocked(aiService_1.openai.chat.completions.create).mockResolvedValue(mockOpenAIResponse('Invalid JSON {}}'));
            await (0, vitest_1.expect)((0, summaryGenerator_1.generateTherapistSummary)(mockTranscript, mockSessionDate, 1)).rejects.toThrow(/Therapist summary generation failed/);
        });
        (0, vitest_1.it)('should handle missing required fields', async () => {
            const incompleteSummary = {
                sessionFocus: 'Some focus',
                // Missing other required fields
            };
            vitest_1.vi.mocked(aiService_1.openai.chat.completions.create).mockResolvedValue(mockOpenAIResponse(JSON.stringify(incompleteSummary)));
            await (0, vitest_1.expect)((0, summaryGenerator_1.generateTherapistSummary)(mockTranscript, mockSessionDate, 1)).rejects.toThrow(/Missing required field/);
        });
        (0, vitest_1.it)('should handle empty GPT response', async () => {
            vitest_1.vi.mocked(aiService_1.openai.chat.completions.create).mockResolvedValue({
                choices: [
                    { message: { content: null, role: 'assistant' }, finish_reason: 'stop', index: 0 },
                ],
                created: Date.now(),
                id: 'test-id',
                model: 'gpt-4-turbo-preview',
                object: 'chat.completion',
            });
            await (0, vitest_1.expect)((0, summaryGenerator_1.generateTherapistSummary)(mockTranscript, mockSessionDate, 1)).rejects.toThrow(/Empty GPT response/);
        });
    });
    (0, vitest_1.describe)('generateClientSummary', () => {
        const mockTranscript = 'Patient discussed anxiety about work deadlines...';
        const mockSessionDate = '2024-01-15T10:00:00Z';
        const validClientSummary = {
            whatWeWorkedOn: 'Today we talked about how work deadlines have been making you feel stressed and anxious.',
            keyTakeaways: [
                'You recognized that anxiety is often triggered by tight deadlines',
                'You have good coping skills that we can build on',
            ],
            encouragement: "You're doing great work by showing up and being open about your feelings. That takes courage!",
            nextSteps: [
                'Try the breathing exercise when you feel stressed at work',
                'Write down one positive thing each day',
            ],
        };
        (0, vitest_1.it)('should generate client-friendly summary', async () => {
            vitest_1.vi.mocked(aiService_1.openai.chat.completions.create).mockResolvedValue(mockOpenAIResponse(JSON.stringify(validClientSummary)));
            const result = await (0, summaryGenerator_1.generateClientSummary)(mockTranscript, mockSessionDate);
            (0, vitest_1.expect)(result).toEqual(validClientSummary);
            (0, vitest_1.expect)(aiService_1.openai.chat.completions.create).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                model: 'gpt-4-turbo-preview',
                response_format: { type: 'json_object' },
                temperature: 0.5, // Higher temperature for client summaries
            }));
        });
        (0, vitest_1.it)('should handle missing required fields', async () => {
            const incompleteSummary = {
                whatWeWorkedOn: 'We talked about things',
                // Missing other required fields
            };
            vitest_1.vi.mocked(aiService_1.openai.chat.completions.create).mockResolvedValue(mockOpenAIResponse(JSON.stringify(incompleteSummary)));
            await (0, vitest_1.expect)((0, summaryGenerator_1.generateClientSummary)(mockTranscript, mockSessionDate, 1)).rejects.toThrow(/Missing required field/);
        });
    });
    (0, vitest_1.describe)('generateSessionSummary', () => {
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
        (0, vitest_1.it)('should generate both summaries in parallel', async () => {
            vitest_1.vi.mocked(aiService_1.openai.chat.completions.create)
                .mockResolvedValueOnce(mockOpenAIResponse(JSON.stringify(validTherapistSummary)))
                .mockResolvedValueOnce(mockOpenAIResponse(JSON.stringify(validClientSummary)));
            const result = await (0, summaryGenerator_1.generateSessionSummary)(mockTranscript, mockSessionDate);
            (0, vitest_1.expect)(result.therapistSummary).toEqual(validTherapistSummary);
            (0, vitest_1.expect)(result.clientSummary).toEqual(validClientSummary);
            (0, vitest_1.expect)(aiService_1.openai.chat.completions.create).toHaveBeenCalledTimes(2);
        });
    });
});
