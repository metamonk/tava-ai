"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/dashboard/therapist - Get therapist dashboard data with clients and recent sessions
router.get('/therapist', auth_1.requireAuth, (0, auth_1.requireRole)('therapist'), async (req, res) => {
    try {
        const therapistId = req.user.id;
        // Get unique clients with their info (clients who have sessions with this therapist)
        const clientsWithSessions = await db_1.db
            .selectDistinctOn([schema_1.therapySessions.clientId], {
            clientId: schema_1.therapySessions.clientId,
            clientName: schema_1.users.name,
            clientEmail: schema_1.users.email,
        })
            .from(schema_1.therapySessions)
            .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.therapySessions.clientId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.therapySessions.therapistId, therapistId))
            .orderBy(schema_1.therapySessions.clientId);
        // Get recent sessions with client info and plan status
        const recentSessions = await db_1.db
            .select({
            id: schema_1.therapySessions.id,
            date: schema_1.therapySessions.date,
            clientId: schema_1.therapySessions.clientId,
            clientName: schema_1.users.name,
            riskLevel: schema_1.therapySessions.riskLevel,
            hasPlan: schema_1.plans.id,
        })
            .from(schema_1.therapySessions)
            .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.therapySessions.clientId, schema_1.users.id))
            .leftJoin(schema_1.plans, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.plans.sessionId, schema_1.therapySessions.id), (0, drizzle_orm_1.eq)(schema_1.plans.isActive, true)))
            .where((0, drizzle_orm_1.eq)(schema_1.therapySessions.therapistId, therapistId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.therapySessions.date))
            .limit(10);
        res.json({
            clients: clientsWithSessions,
            recentSessions,
        });
    }
    catch (error) {
        console.error('Error fetching therapist dashboard:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});
// GET /api/dashboard/therapist/clients/:clientId - Get client details with session history
router.get('/therapist/clients/:clientId', auth_1.requireAuth, (0, auth_1.requireRole)('therapist'), async (req, res) => {
    try {
        const { clientId } = req.params;
        const therapistId = req.user.id;
        // Get client info
        const [client] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, clientId));
        if (!client) {
            res.status(404).json({ error: 'Client not found' });
            return;
        }
        // Verify therapist has sessions with this client (access control)
        const [hasAccess] = await db_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(schema_1.therapySessions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.therapySessions.clientId, clientId), (0, drizzle_orm_1.eq)(schema_1.therapySessions.therapistId, therapistId)));
        if (!hasAccess || hasAccess.count === 0) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        // Get all sessions for this client with the current therapist
        const clientSessions = await db_1.db
            .select({
            id: schema_1.therapySessions.id,
            date: schema_1.therapySessions.date,
            riskLevel: schema_1.therapySessions.riskLevel,
            planId: schema_1.plans.id,
            planVersion: schema_1.plans.versionNumber,
        })
            .from(schema_1.therapySessions)
            .leftJoin(schema_1.plans, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.plans.sessionId, schema_1.therapySessions.id), (0, drizzle_orm_1.eq)(schema_1.plans.isActive, true)))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.therapySessions.clientId, clientId), (0, drizzle_orm_1.eq)(schema_1.therapySessions.therapistId, therapistId)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.therapySessions.date));
        res.json({
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
            },
            sessions: clientSessions,
        });
    }
    catch (error) {
        console.error('Error fetching client details:', error);
        res.status(500).json({ error: 'Failed to fetch client details' });
    }
});
exports.default = router;
