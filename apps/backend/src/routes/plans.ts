import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { plans, therapySessions } from '../db/schema';
import { requireAuth, requireRole } from '../middleware/auth';
import { generateTherapistPlan, generateClientPlan } from '../services/aiService';

const router: IRouter = Router();

// POST /api/plans/generate/:sessionId - Generate plan from session transcript
router.post(
  '/generate/:sessionId',
  requireAuth,
  requireRole('therapist'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;

      // Get session
      const [session] = await db
        .select()
        .from(therapySessions)
        .where(eq(therapySessions.id, sessionId));

      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      if (session.therapistId !== req.user!.id) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      if (!session.transcript) {
        res.status(400).json({ error: 'Session has no transcript' });
        return;
      }

      // Generate plans (with retry logic built into service)
      const therapistPlanData = await generateTherapistPlan(session.transcript);
      const clientPlanData = await generateClientPlan(therapistPlanData);

      // Get next version number
      const existingPlans = await db
        .select()
        .from(plans)
        .where(eq(plans.sessionId, sessionId))
        .orderBy(desc(plans.versionNumber));

      const versionNumber = existingPlans.length > 0 ? existingPlans[0].versionNumber + 1 : 1;

      // Deactivate previous plans
      if (existingPlans.length > 0) {
        await db.update(plans).set({ isActive: false }).where(eq(plans.sessionId, sessionId));
      }

      // Save new plan
      const [plan] = await db
        .insert(plans)
        .values({
          sessionId,
          clientId: session.clientId,
          therapistId: session.therapistId,
          versionNumber,
          therapistPlanText: JSON.stringify(therapistPlanData, null, 2),
          clientPlanText: JSON.stringify(clientPlanData, null, 2),
          isActive: true,
        })
        .returning();

      res.json({ plan });
    } catch (error) {
      console.error('Plan generation error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Plan generation failed',
      });
    }
  }
);

// GET /api/plans - Get all plans for authenticated user
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.id;
    const { sessionId, activeOnly } = req.query;

    let query = db.select().from(plans);

    if (userRole === 'therapist') {
      // Therapists can see plans they created
      if (sessionId) {
        query = query.where(
          and(eq(plans.therapistId, userId), eq(plans.sessionId, sessionId as string))
        ) as typeof query;
      } else {
        query = query.where(eq(plans.therapistId, userId)) as typeof query;
      }
    } else {
      // Clients can only see active plans where they are the client
      if (activeOnly === 'true') {
        query = query.where(
          and(eq(plans.clientId, userId), eq(plans.isActive, true))
        ) as typeof query;
      } else {
        query = query.where(eq(plans.clientId, userId)) as typeof query;
      }
    }

    const userPlans = await query.orderBy(desc(plans.createdAt));
    res.json({ plans: userPlans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// GET /api/plans/:id - Get specific plan
router.get('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [plan] = await db.select().from(plans).where(eq(plans.id, id));

    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    // Verify access
    if (req.user!.role === 'therapist' && plan.therapistId !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    if (req.user!.role === 'client' && plan.clientId !== req.user!.id) {
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
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ error: 'Failed to fetch plan' });
  }
});

// GET /api/plans/session/:sessionId - Get all plans for a session
router.get(
  '/session/:sessionId',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;

      // Verify session access
      const [session] = await db
        .select()
        .from(therapySessions)
        .where(eq(therapySessions.id, sessionId));

      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      if (req.user!.role === 'therapist' && session.therapistId !== req.user!.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      if (req.user!.role === 'client' && session.clientId !== req.user!.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const sessionPlans = await db
        .select()
        .from(plans)
        .where(eq(plans.sessionId, sessionId))
        .orderBy(desc(plans.versionNumber));

      res.json({ plans: sessionPlans });
    } catch (error) {
      console.error('Error fetching session plans:', error);
      res.status(500).json({ error: 'Failed to fetch plans' });
    }
  }
);

export default router;
