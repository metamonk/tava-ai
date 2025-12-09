import { type RiskLevel } from './moderationService';
/**
 * Evaluate risk level for a session based on its transcript
 * Updates the session's riskLevel in the database
 */
export declare function evaluateSessionRisk(sessionId: string): Promise<RiskLevel>;
/**
 * Evaluate risk level for plan text (without storing)
 * Useful for evaluating AI-generated plans before saving
 */
export declare function evaluatePlanRisk(planText: string): Promise<RiskLevel>;
//# sourceMappingURL=riskService.d.ts.map