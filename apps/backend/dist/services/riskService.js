import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { therapySessions } from '../db/schema.js';
import { evaluateContentRisk } from './moderationService.js';
/**
 * Evaluate risk level for a session based on its transcript
 * Updates the session's riskLevel in the database
 */
export async function evaluateSessionRisk(sessionId) {
    try {
        // Fetch session
        const [session] = await db
            .select()
            .from(therapySessions)
            .where(eq(therapySessions.id, sessionId));
        if (!session) {
            throw new Error('Session not found');
        }
        if (!session.transcript) {
            throw new Error('Session has no transcript to evaluate');
        }
        // Evaluate risk using moderation API
        const riskLevel = await evaluateContentRisk(session.transcript);
        // Update session with risk level
        await db
            .update(therapySessions)
            .set({
            riskLevel,
            updatedAt: new Date(),
        })
            .where(eq(therapySessions.id, sessionId));
        console.log(`Session ${sessionId} risk level evaluated: ${riskLevel}`);
        return riskLevel;
    }
    catch (error) {
        console.error('Error evaluating session risk:', error);
        throw error;
    }
}
/**
 * Evaluate risk level for plan text (without storing)
 * Useful for evaluating AI-generated plans before saving
 */
export async function evaluatePlanRisk(planText) {
    try {
        return await evaluateContentRisk(planText);
    }
    catch (error) {
        console.error('Error evaluating plan risk:', error);
        throw error;
    }
}
