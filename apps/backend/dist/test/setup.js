"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockModerationResponse = exports.mockOpenAIResponse = void 0;
const vitest_1 = require("vitest");
const dotenv_1 = __importDefault(require("dotenv"));
// Load test environment variables
dotenv_1.default.config({ path: '.env.test' });
// Set test environment
process.env.NODE_ENV = 'test';
(0, vitest_1.beforeAll)(async () => {
    console.log('Test suite starting...');
});
(0, vitest_1.afterAll)(async () => {
    console.log('Test suite completed');
});
(0, vitest_1.afterEach)(() => {
    // Clear any mocks after each test
    vitest_1.vi.clearAllMocks();
});
// Global test utilities
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
exports.mockOpenAIResponse = mockOpenAIResponse;
const mockModerationResponse = (flagged, categories = {}) => ({
    results: [
        {
            flagged,
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
                ...categories,
            },
            category_scores: {
                'self-harm': 0.01,
                'self-harm/intent': 0.01,
                'self-harm/instructions': 0.01,
                violence: 0.01,
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
});
exports.mockModerationResponse = mockModerationResponse;
