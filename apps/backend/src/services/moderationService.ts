import { openai } from './aiService.js';

export type RiskLevel = 'none' | 'low' | 'medium' | 'high';

export interface ModerationResult {
  flagged: boolean;
  categories: {
    'self-harm': boolean;
    'self-harm/intent': boolean;
    'self-harm/instructions': boolean;
    violence: boolean;
    'violence/graphic': boolean;
    sexual: boolean;
    'sexual/minors': boolean;
    harassment: boolean;
    'harassment/threatening': boolean;
    hate: boolean;
    'hate/threatening': boolean;
  };
  category_scores: {
    'self-harm': number;
    'self-harm/intent': number;
    'self-harm/instructions': number;
    violence: number;
    'violence/graphic': number;
    sexual: number;
    'sexual/minors': number;
    harassment: number;
    'harassment/threatening': number;
    hate: number;
    'hate/threatening': number;
  };
}

/**
 * Call OpenAI Moderation API to analyze content for safety concerns
 */
export async function moderateContent(text: string): Promise<ModerationResult> {
  try {
    const response = await openai.moderations.create({
      model: 'text-moderation-latest',
      input: text,
    });

    const result = response.results[0];
    return {
      flagged: result.flagged,
      categories: result.categories as ModerationResult['categories'],
      category_scores: result.category_scores as ModerationResult['category_scores'],
    };
  } catch (error) {
    console.error('OpenAI Moderation API error:', error);
    throw new Error('Content moderation failed');
  }
}

/**
 * Map moderation results to risk levels for therapy context
 *
 * Risk mapping:
 * - HIGH: self-harm/intent or self-harm/instructions flagged OR any score > 0.7
 * - MEDIUM: self-harm or violence flagged OR any score > 0.4
 * - LOW: any category flagged OR any score > 0.2
 * - NONE: all scores <= 0.2 and nothing flagged
 */
export function mapModerationToRiskLevel(moderation: ModerationResult): RiskLevel {
  const { categories, category_scores } = moderation;

  // HIGH RISK: Self-harm intent/instructions or very high scores
  if (
    categories['self-harm/intent'] ||
    categories['self-harm/instructions'] ||
    Object.values(category_scores).some((score) => score > 0.7)
  ) {
    return 'high';
  }

  // MEDIUM RISK: Self-harm, violence, or moderately high scores
  if (
    categories['self-harm'] ||
    categories.violence ||
    categories['violence/graphic'] ||
    Object.values(category_scores).some((score) => score > 0.4)
  ) {
    return 'medium';
  }

  // LOW RISK: Any flagged content or elevated scores
  if (moderation.flagged || Object.values(category_scores).some((score) => score > 0.2)) {
    return 'low';
  }

  // NONE: All clear
  return 'none';
}

/**
 * Combined function: moderate content and return risk level
 */
export async function evaluateContentRisk(text: string): Promise<RiskLevel> {
  const moderationResult = await moderateContent(text);
  return mapModerationToRiskLevel(moderationResult);
}
