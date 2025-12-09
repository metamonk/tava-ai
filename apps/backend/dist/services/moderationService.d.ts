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
export declare function moderateContent(text: string): Promise<ModerationResult>;
/**
 * Map moderation results to risk levels for therapy context
 *
 * Risk mapping:
 * - HIGH: self-harm/intent or self-harm/instructions flagged OR any score > 0.7
 * - MEDIUM: self-harm or violence flagged OR any score > 0.4
 * - LOW: any category flagged OR any score > 0.2
 * - NONE: all scores <= 0.2 and nothing flagged
 */
export declare function mapModerationToRiskLevel(moderation: ModerationResult): RiskLevel;
/**
 * Combined function: moderate content and return risk level
 */
export declare function evaluateContentRisk(text: string): Promise<RiskLevel>;
//# sourceMappingURL=moderationService.d.ts.map