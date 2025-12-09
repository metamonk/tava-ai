"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const auth_1 = require("../middleware/auth");
const aiService_1 = require("../services/aiService");
const summaryGenerator_1 = require("../services/summaryGenerator");
const riskService_1 = require("../services/riskService");
const router = (0, express_1.Router)();
// POST /api/plans/generate/:sessionId - Generate plan from session transcript
router.post('/generate/:sessionId', auth_1.requireAuth, (0, auth_1.requireRole)('therapist'), async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Get session
        const [session] = await db_1.db
            .select()
            .from(schema_1.therapySessions)
            .where((0, drizzle_orm_1.eq)(schema_1.therapySessions.id, sessionId));
        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }
        if (session.therapistId !== req.user.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        if (!session.transcript) {
            res.status(400).json({ error: 'Session has no transcript' });
            return;
        }
        // Generate plans and summaries in parallel (with retry logic built into services)
        const [therapistPlanData, sessionSummaries] = await Promise.all([
            (0, aiService_1.generateTherapistPlan)(session.transcript),
            (0, summaryGenerator_1.generateSessionSummary)(session.transcript, new Date(session.date).toISOString()),
        ]);
        const clientPlanData = await (0, aiService_1.generateClientPlan)(therapistPlanData);
        // Evaluate risk of generated therapist plan (non-blocking, log errors)
        const therapistPlanText = JSON.stringify(therapistPlanData, null, 2);
        (0, riskService_1.evaluatePlanRisk)(therapistPlanText).catch((error) => {
            console.error('Plan risk evaluation failed:', error);
        });
        // Get next version number
        const existingPlans = await db_1.db
            .select()
            .from(schema_1.plans)
            .where((0, drizzle_orm_1.eq)(schema_1.plans.sessionId, sessionId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.plans.versionNumber));
        const versionNumber = existingPlans.length > 0 ? existingPlans[0].versionNumber + 1 : 1;
        // Deactivate previous plans
        if (existingPlans.length > 0) {
            await db_1.db.update(schema_1.plans).set({ isActive: false }).where((0, drizzle_orm_1.eq)(schema_1.plans.sessionId, sessionId));
        }
        // Save new plan with summaries
        const [plan] = await db_1.db
            .insert(schema_1.plans)
            .values({
            sessionId,
            clientId: session.clientId,
            therapistId: session.therapistId,
            versionNumber,
            therapistPlanText,
            clientPlanText: JSON.stringify(clientPlanData, null, 2),
            therapistSummary: JSON.stringify(sessionSummaries.therapistSummary, null, 2),
            clientSummary: JSON.stringify(sessionSummaries.clientSummary, null, 2),
            isActive: true,
        })
            .returning();
        res.json({ plan });
    }
    catch (error) {
        console.error('Plan generation error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Plan generation failed',
        });
    }
});
// GET /api/plans - Get all plans for authenticated user
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id;
        const { sessionId, activeOnly } = req.query;
        let query = db_1.db.select().from(schema_1.plans);
        if (userRole === 'therapist') {
            // Therapists can see plans they created
            if (sessionId) {
                query = query.where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.plans.therapistId, userId), (0, drizzle_orm_1.eq)(schema_1.plans.sessionId, sessionId)));
            }
            else {
                query = query.where((0, drizzle_orm_1.eq)(schema_1.plans.therapistId, userId));
            }
        }
        else {
            // Clients can only see active plans where they are the client
            if (activeOnly === 'true') {
                query = query.where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.plans.clientId, userId), (0, drizzle_orm_1.eq)(schema_1.plans.isActive, true)));
            }
            else {
                query = query.where((0, drizzle_orm_1.eq)(schema_1.plans.clientId, userId));
            }
        }
        const userPlans = await query.orderBy((0, drizzle_orm_1.desc)(schema_1.plans.createdAt));
        res.json({ plans: userPlans });
    }
    catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});
// GET /api/plans/:id - Get specific plan
router.get('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const [plan] = await db_1.db.select().from(schema_1.plans).where((0, drizzle_orm_1.eq)(schema_1.plans.id, id));
        if (!plan) {
            res.status(404).json({ error: 'Plan not found' });
            return;
        }
        // Verify access
        if (req.user.role === 'therapist' && plan.therapistId !== req.user.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        if (req.user.role === 'client' && plan.clientId !== req.user.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        // Parse the JSON plan texts for easier frontend consumption
        const parsedPlan = {
            ...plan,
            therapistPlan: JSON.parse(plan.therapistPlanText),
            clientPlan: JSON.parse(plan.clientPlanText),
        };
        res.json({ plan: parsedPlan });
    }
    catch (error) {
        console.error('Error fetching plan:', error);
        res.status(500).json({ error: 'Failed to fetch plan' });
    }
});
// PUT /api/plans/:id - Update plan by creating a new version
router.put('/:id', auth_1.requireAuth, (0, auth_1.requireRole)('therapist'), async (req, res) => {
    try {
        const { id } = req.params;
        const { therapistPlanText, clientPlanText, lastUpdatedAt } = req.body;
        // Validate required fields
        if (!therapistPlanText || !clientPlanText) {
            res.status(400).json({ error: 'Both therapistPlanText and clientPlanText are required' });
            return;
        }
        // Get the original plan
        const [originalPlan] = await db_1.db.select().from(schema_1.plans).where((0, drizzle_orm_1.eq)(schema_1.plans.id, id));
        if (!originalPlan) {
            res.status(404).json({ error: 'Plan not found' });
            return;
        }
        // Verify therapist ownership
        if (originalPlan.therapistId !== req.user.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        // Optimistic locking check
        if (lastUpdatedAt) {
            const lastUpdatedDate = new Date(lastUpdatedAt);
            if (lastUpdatedDate < new Date(originalPlan.createdAt)) {
                res.status(409).json({
                    error: 'Plan was updated by another user. Please refresh and try again.',
                });
                return;
            }
        }
        // Use a transaction to atomically deactivate old versions and create new one
        const result = await db_1.db.transaction(async (tx) => {
            // Deactivate all plans for this session
            await tx
                .update(schema_1.plans)
                .set({ isActive: false })
                .where((0, drizzle_orm_1.eq)(schema_1.plans.sessionId, originalPlan.sessionId));
            // Create new version
            const [newPlan] = await tx
                .insert(schema_1.plans)
                .values({
                sessionId: originalPlan.sessionId,
                clientId: originalPlan.clientId,
                therapistId: originalPlan.therapistId,
                versionNumber: originalPlan.versionNumber + 1,
                therapistPlanText,
                clientPlanText,
                isActive: true,
            })
                .returning();
            return newPlan;
        });
        res.json({ plan: result });
    }
    catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({ error: 'Failed to update plan' });
    }
});
// GET /api/plans/session/:sessionId/versions - Get version history for a session
router.get('/session/:sessionId/versions', auth_1.requireAuth, (0, auth_1.requireRole)('therapist'), async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Verify session access
        const [session] = await db_1.db
            .select()
            .from(schema_1.therapySessions)
            .where((0, drizzle_orm_1.eq)(schema_1.therapySessions.id, sessionId));
        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }
        if (session.therapistId !== req.user.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        const versions = await db_1.db
            .select()
            .from(schema_1.plans)
            .where((0, drizzle_orm_1.eq)(schema_1.plans.sessionId, sessionId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.plans.versionNumber));
        res.json({ versions });
    }
    catch (error) {
        console.error('Error fetching version history:', error);
        res.status(500).json({ error: 'Failed to fetch version history' });
    }
});
// GET /api/plans/session/:sessionId - Get all plans for a session
router.get('/session/:sessionId', auth_1.requireAuth, async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Verify session access
        const [session] = await db_1.db
            .select()
            .from(schema_1.therapySessions)
            .where((0, drizzle_orm_1.eq)(schema_1.therapySessions.id, sessionId));
        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }
        if (req.user.role === 'therapist' && session.therapistId !== req.user.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        if (req.user.role === 'client' && session.clientId !== req.user.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        const sessionPlans = await db_1.db
            .select()
            .from(schema_1.plans)
            .where((0, drizzle_orm_1.eq)(schema_1.plans.sessionId, sessionId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.plans.versionNumber));
        res.json({ plans: sessionPlans });
    }
    catch (error) {
        console.error('Error fetching session plans:', error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});
exports.default = router;
