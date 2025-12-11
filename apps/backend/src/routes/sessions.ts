import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { therapySessions } from '../db/schema.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../config/multer.js';
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

// POST /api/sessions/:id/audio - Upload audio file and transcribe
router.post(
  '/:id/audio',
  requireAuth,
  requireRole('therapist'),
  upload.single('audio'),
  async (req: Request, res: Response): Promise<void> => {
    const file = req.file;

    try {
      const { id } = req.params;

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

      // Read the saved file for transcription
      let audioBuffer: Buffer;
      try {
        audioBuffer = await fs.readFile(file.path);
      } catch (readError) {
        console.error('Failed to read uploaded audio file:', readError);
        await fs.unlink(file.path).catch(console.error);
        res.status(500).json({ error: 'Failed to process uploaded file. Please try again.' });
        return;
      }

      // Transcribe the audio
      let transcript: string;
      try {
        transcript = await transcribeAudio(audioBuffer, file.mimetype);
      } catch (transcriptionError) {
        console.error('Transcription failed:', transcriptionError);
        // Clean up the uploaded file since transcription failed
        await fs.unlink(file.path).catch(console.error);

        // Provide specific error message based on error type
        const errorMessage =
          transcriptionError instanceof Error ? transcriptionError.message : 'Unknown error';

        if (errorMessage.includes('Audio transcription failed')) {
          res.status(422).json({
            error:
              'Could not transcribe the audio file. Please ensure the file contains clear speech and try again.',
            details: 'The AI service was unable to process the audio content.',
          });
        } else {
          res.status(500).json({
            error:
              'Transcription service temporarily unavailable. Please try again in a few moments.',
            details: errorMessage,
          });
        }
        return;
      }

      // Update session with both audio path and transcript
      await db
        .update(therapySessions)
        .set({
          audioFilePath: file.path,
          transcript,
          updatedAt: new Date(),
        })
        .where(eq(therapySessions.id, id));

      // Evaluate risk level after transcription (non-blocking)
      evaluateSessionRisk(id).catch((error) => {
        console.error('Risk evaluation failed for session', id, error);
      });

      res.json({
        message: 'Audio uploaded and transcribed successfully',
        filePath: file.path,
        fileName: file.filename,
        size: file.size,
        transcript,
      });
    } catch (error) {
      console.error('Error in audio upload/transcription:', error);

      // Clean up uploaded file on any unexpected error
      if (file) {
        await fs.unlink(file.path).catch(console.error);
      }

      res.status(500).json({
        error: 'An unexpected error occurred. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
