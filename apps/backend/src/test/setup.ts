import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  console.log('Test suite starting...');
});

afterAll(async () => {
  console.log('Test suite completed');
});

afterEach(() => {
  // Clear any mocks after each test
  vi.clearAllMocks();
});

// Global test utilities
export const mockOpenAIResponse = (content: string) => ({
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

export const mockModerationResponse = (
  flagged: boolean,
  categories: Record<string, boolean> = {}
) => ({
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
