import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { therapySessions } from '../db/schema.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload, uploadMemory } from '../config/multer.js';
import { transcribeAudio } from '../services/aiService.js';
import { evaluateSessionRisk } from '../services/riskService.js';
import fs from 'fs/promises';

const router: IRouter = Router();

/**
 * Generate risk details based on risk level
 * Since detailed moderation results aren't stored, this provides
 * generic guidance based on the overall risk level
 */
function getRiskDetails(riskLevel: string): string[] {
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
      return ['Minor risk indicators present', 'Standard clinical attention recommended'];
    default:
      return [];
  }
}

// POST /api/sessions - Create a new therapy session
router.post(
  '/',
  requireAuth,
  requireRole('therapist'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId, date } = req.body;

      if (!clientId) {
        res.status(400).json({ error: 'clientId is required' });
        return;
      }

      const [session] = await db
        .insert(therapySessions)
        .values({
          therapistId: req.user!.id,
          clientId,
          date: date ? new Date(date) : new Date(),
          riskLevel: 'none',
        })
        .returning();

      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  }
);

// GET /api/sessions - Get sessions for authenticated user (therapist or client)
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.query;
    const userRole = req.user!.role;
    const userId = req.user!.id;

    let sessions;

    if (userRole === 'therapist') {
      // Therapists can see their sessions, optionally filtered by client
      if (clientId) {
        sessions = await db
          .select()
          .from(therapySessions)
          .where(
            and(
              eq(therapySessions.therapistId, userId),
              eq(therapySessions.clientId, clientId as string)
            )
          )
          .orderBy(desc(therapySessions.date));
      } else {
        sessions = await db
          .select()
          .from(therapySessions)
          .where(eq(therapySessions.therapistId, userId))
          .orderBy(desc(therapySessions.date));
      }
    } else {
      // Clients can only see sessions where they are the client
      sessions = await db
        .select()
        .from(therapySessions)
        .where(eq(therapySessions.clientId, userId))
        .orderBy(desc(therapySessions.date));
    }

    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /api/sessions/:id - Get specific session
router.get('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [session] = await db.select().from(therapySessions).where(eq(therapySessions.id, id));

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Verify access: therapist or client
    if (req.user!.role === 'therapist' && session.therapistId !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    if (req.user!.role === 'client' && session.clientId !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Include risk details for therapists only (clients should not see detailed risk info)
    const riskDetails =
      req.user!.role === 'therapist' ? getRiskDetails(session.riskLevel) : undefined;

    res.json({
      session: {
        ...session,
        riskDetails,
      },
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// POST /api/sessions/:id/transcript - Add or update transcript
router.post(
  '/:id/transcript',
  requireAuth,
  requireRole('therapist'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { transcript } = req.body;

      if (!transcript || transcript.trim().length === 0) {
        res.status(400).json({ error: 'transcript is required and must be non-empty' });
        return;
      }

      // Verify session exists and belongs to therapist
      const [existingSession] = await db
        .select()
        .from(therapySessions)
        .where(and(eq(therapySessions.id, id), eq(therapySessions.therapistId, req.user!.id)));

      if (!existingSession) {
        res.status(404).json({ error: 'Session not found or access denied' });
        return;
      }

      const [updatedSession] = await db
        .update(therapySessions)
        .set({
          transcript: transcript.trim(),
          updatedAt: new Date(),
        })
        .where(eq(therapySessions.id, id))
        .returning();

      res.json(updatedSession);
    } catch (error) {
      console.error('Error updating transcript:', error);
      res.status(500).json({ error: 'Failed to update transcript' });
    }
  }
);

// POST /api/sessions/:id/audio - Upload audio file
router.post(
  '/:id/audio',
  requireAuth,
  requireRole('therapist'),
  upload.single('audio'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'Audio file is required' });
        return;
      }

      // Verify session exists and belongs to therapist
      const [existingSession] = await db
        .select()
        .from(therapySessions)
        .where(and(eq(therapySessions.id, id), eq(therapySessions.therapistId, req.user!.id)));

      if (!existingSession) {
        await fs.unlink(file.path).catch(console.error);
        res.status(404).json({ error: 'Session not found or access denied' });
        return;
      }

      // Delete old audio file if it exists
      if (existingSession.audioFilePath) {
        await fs.unlink(existingSession.audioFilePath).catch(console.error);
      }

      await db
        .update(therapySessions)
        .set({
          audioFilePath: file.path,
          updatedAt: new Date(),
        })
        .where(eq(therapySessions.id, id));

      res.json({
        message: 'Audio file uploaded successfully',
        filePath: file.path,
        fileName: file.filename,
        size: file.size,
      });
    } catch (error) {
      console.error('Error uploading audio:', error);

      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }

      res.status(500).json({ error: 'Failed to upload audio file' });
    }
  }
);

// POST /api/sessions/:id/transcribe - Transcribe audio file using Whisper
router.post(
  '/:id/transcribe',
  requireAuth,
  requireRole('therapist'),
  uploadMemory.single('audio'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.file) {
        res.status(400).json({ error: 'No audio file provided' });
        return;
      }

      // Get session and verify ownership
      const [session] = await db.select().from(therapySessions).where(eq(therapySessions.id, id));

      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      if (session.therapistId !== req.user!.id) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      // Transcribe audio using Whisper
      const transcript = await transcribeAudio(req.file.buffer, req.file.mimetype);

      // Update session with transcript
      await db
        .update(therapySessions)
        .set({ transcript, updatedAt: new Date() })
        .where(eq(therapySessions.id, id));

      // Evaluate risk level after transcription (non-blocking, log errors)
      evaluateSessionRisk(id).catch((error) => {
        console.error('Risk evaluation failed for session', id, error);
      });

      res.json({ transcript });
    } catch (error) {
      console.error('Transcription error:', error);
      res.status(500).json({ error: 'Transcription failed' });
    }
  }
);

export default router;
