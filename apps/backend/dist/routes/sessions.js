"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const auth_1 = require("../middleware/auth");
const multer_1 = require("../config/multer");
const aiService_1 = require("../services/aiService");
const riskService_1 = require("../services/riskService");
const promises_1 = __importDefault(require("fs/promises"));
const router = (0, express_1.Router)();
/**
 * Generate risk details based on risk level
 * Since detailed moderation results aren't stored, this provides
 * generic guidance based on the overall risk level
 */
function getRiskDetails(riskLevel) {
    switch (riskLevel) {
        case 'high':
            return [
                'Potential self-harm or suicidal ideation detected',
                'Content may indicate intent to harm self or others',
                'Immediate clinical review recommended',
            ];
        case 'medium':
            return [
                'Elevated risk indicators detected',
                'Content requires additional clinical attention',
                'Review transcript for context and clinical significance',
            ];
        case 'low':
            return [
                'Minor risk indicators present',
                'Standard clinical attention recommended',
            ];
        default:
            return [];
    }
}
// POST /api/sessions - Create a new therapy session
router.post('/', auth_1.requireAuth, (0, auth_1.requireRole)('therapist'), async (req, res) => {
    try {
        const { clientId, date } = req.body;
        if (!clientId) {
            res.status(400).json({ error: 'clientId is required' });
            return;
        }
        const [session] = await db_1.db
            .insert(schema_1.therapySessions)
            .values({
            therapistId: req.user.id,
            clientId,
            date: date ? new Date(date) : new Date(),
            riskLevel: 'none',
        })
            .returning();
        res.status(201).json(session);
    }
    catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});
// GET /api/sessions - Get sessions for authenticated user (therapist or client)
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { clientId } = req.query;
        const userRole = req.user.role;
        const userId = req.user.id;
        let sessions;
        if (userRole === 'therapist') {
            // Therapists can see their sessions, optionally filtered by client
            if (clientId) {
                sessions = await db_1.db
                    .select()
                    .from(schema_1.therapySessions)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.therapySessions.therapistId, userId), (0, drizzle_orm_1.eq)(schema_1.therapySessions.clientId, clientId)))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.therapySessions.date));
            }
            else {
                sessions = await db_1.db
                    .select()
                    .from(schema_1.therapySessions)
                    .where((0, drizzle_orm_1.eq)(schema_1.therapySessions.therapistId, userId))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.therapySessions.date));
            }
        }
        else {
            // Clients can only see sessions where they are the client
            sessions = await db_1.db
                .select()
                .from(schema_1.therapySessions)
                .where((0, drizzle_orm_1.eq)(schema_1.therapySessions.clientId, userId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.therapySessions.date));
        }
        res.json({ sessions });
    }
    catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});
// GET /api/sessions/:id - Get specific session
router.get('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const [session] = await db_1.db.select().from(schema_1.therapySessions).where((0, drizzle_orm_1.eq)(schema_1.therapySessions.id, id));
        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }
        // Verify access: therapist or client
        if (req.user.role === 'therapist' && session.therapistId !== req.user.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        if (req.user.role === 'client' && session.clientId !== req.user.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        // Include risk details for therapists only (clients should not see detailed risk info)
        const riskDetails = req.user.role === 'therapist' ? getRiskDetails(session.riskLevel) : undefined;
        res.json({
            session: {
                ...session,
                riskDetails,
            },
        });
    }
    catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({ error: 'Failed to fetch session' });
    }
});
// POST /api/sessions/:id/transcript - Add or update transcript
router.post('/:id/transcript', auth_1.requireAuth, (0, auth_1.requireRole)('therapist'), async (req, res) => {
    try {
        const { id } = req.params;
        const { transcript } = req.body;
        if (!transcript || transcript.trim().length === 0) {
            res.status(400).json({ error: 'transcript is required and must be non-empty' });
            return;
        }
        // Verify session exists and belongs to therapist
        const [existingSession] = await db_1.db
            .select()
            .from(schema_1.therapySessions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.therapySessions.id, id), (0, drizzle_orm_1.eq)(schema_1.therapySessions.therapistId, req.user.id)));
        if (!existingSession) {
            res.status(404).json({ error: 'Session not found or access denied' });
            return;
        }
        const [updatedSession] = await db_1.db
            .update(schema_1.therapySessions)
            .set({
            transcript: transcript.trim(),
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.therapySessions.id, id))
            .returning();
        res.json(updatedSession);
    }
    catch (error) {
        console.error('Error updating transcript:', error);
        res.status(500).json({ error: 'Failed to update transcript' });
    }
});
// POST /api/sessions/:id/audio - Upload audio file
router.post('/:id/audio', auth_1.requireAuth, (0, auth_1.requireRole)('therapist'), multer_1.upload.single('audio'), async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: 'Audio file is required' });
            return;
        }
        // Verify session exists and belongs to therapist
        const [existingSession] = await db_1.db
            .select()
            .from(schema_1.therapySessions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.therapySessions.id, id), (0, drizzle_orm_1.eq)(schema_1.therapySessions.therapistId, req.user.id)));
        if (!existingSession) {
            await promises_1.default.unlink(file.path).catch(console.error);
            res.status(404).json({ error: 'Session not found or access denied' });
            return;
        }
        // Delete old audio file if it exists
        if (existingSession.audioFilePath) {
            await promises_1.default.unlink(existingSession.audioFilePath).catch(console.error);
        }
        await db_1.db
            .update(schema_1.therapySessions)
            .set({
            audioFilePath: file.path,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.therapySessions.id, id));
        res.json({
            message: 'Audio file uploaded successfully',
            filePath: file.path,
            fileName: file.filename,
            size: file.size,
        });
    }
    catch (error) {
        console.error('Error uploading audio:', error);
        if (req.file) {
            await promises_1.default.unlink(req.file.path).catch(console.error);
        }
        res.status(500).json({ error: 'Failed to upload audio file' });
    }
});
// POST /api/sessions/:id/transcribe - Transcribe audio file using Whisper
router.post('/:id/transcribe', auth_1.requireAuth, (0, auth_1.requireRole)('therapist'), multer_1.uploadMemory.single('audio'), async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) {
            res.status(400).json({ error: 'No audio file provided' });
            return;
        }
        // Get session and verify ownership
        const [session] = await db_1.db.select().from(schema_1.therapySessions).where((0, drizzle_orm_1.eq)(schema_1.therapySessions.id, id));
        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }
        if (session.therapistId !== req.user.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        // Transcribe audio using Whisper
        const transcript = await (0, aiService_1.transcribeAudio)(req.file.buffer, req.file.mimetype);
        // Update session with transcript
        await db_1.db
            .update(schema_1.therapySessions)
            .set({ transcript, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.therapySessions.id, id));
        // Evaluate risk level after transcription (non-blocking, log errors)
        (0, riskService_1.evaluateSessionRisk)(id).catch((error) => {
            console.error('Risk evaluation failed for session', id, error);
        });
        res.json({ transcript });
    }
    catch (error) {
        console.error('Transcription error:', error);
        res.status(500).json({ error: 'Transcription failed' });
    }
});
exports.default = router;
