"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateSessionRisk = evaluateSessionRisk;
exports.evaluatePlanRisk = evaluatePlanRisk;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const moderationService_1 = require("./moderationService");
/**
 * Evaluate risk level for a session based on its transcript
 * Updates the session's riskLevel in the database
 */
async function evaluateSessionRisk(sessionId) {
    try {
        // Fetch session
        const [session] = await db_1.db
            .select()
            .from(schema_1.therapySessions)
            .where((0, drizzle_orm_1.eq)(schema_1.therapySessions.id, sessionId));
        if (!session) {
            throw new Error('Session not found');
        }
        if (!session.transcript) {
            throw new Error('Session has no transcript to evaluate');
        }
        // Evaluate risk using moderation API
        const riskLevel = await (0, moderationService_1.evaluateContentRisk)(session.transcript);
        // Update session with risk level
        await db_1.db
            .update(schema_1.therapySessions)
            .set({
            riskLevel,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.therapySessions.id, sessionId));
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
async function evaluatePlanRisk(planText) {
    try {
        return await (0, moderationService_1.evaluateContentRisk)(planText);
    }
    catch (error) {
        console.error('Error evaluating plan risk:', error);
        throw error;
    }
}
