import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluateSessionRisk, evaluatePlanRisk } from './riskService';
import { db } from '../db';
import { therapySessions } from '../db/schema';
import * as moderationService from './moderationService';

// Mock the database
vi.mock('../db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock the moderation service
vi.mock('./moderationService', () => ({
  evaluateContentRisk: vi.fn(),
}));

describe('Risk Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('evaluateSessionRisk', () => {
    it('should evaluate risk for session with transcript', async () => {
      const mockSession = {
        id: 'session-123',
        transcript: 'Normal therapy session discussion about work stress.',
        riskLevel: null,
      };

      // Mock db.select chain
      const mockSelectFrom = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([mockSession]),
      });
      const mockSelect = vi.fn().mockReturnValue({
        from: mockSelectFrom,
      });
      vi.mocked(db.select).mockImplementation(mockSelect);

      // Mock db.update chain
      const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
      const mockUpdateSet = vi.fn().mockReturnValue({
        where: mockUpdateWhere,
      });
      const mockUpdate = vi.fn().mockReturnValue({
        set: mockUpdateSet,
      });
      vi.mocked(db.update).mockImplementation(mockUpdate);

      // Mock moderation result
      vi.mocked(moderationService.evaluateContentRisk).mockResolvedValue('none');

      const result = await evaluateSessionRisk('session-123');

      expect(moderationService.evaluateContentRisk).toHaveBeenCalledWith(mockSession.transcript);
      expect(result).toBe('none');
    });

    it('should throw error when session not found', async () => {
      const mockSelectFrom = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      });
      const mockSelect = vi.fn().mockReturnValue({
        from: mockSelectFrom,
      });
      vi.mocked(db.select).mockImplementation(mockSelect);

      await expect(evaluateSessionRisk('nonexistent-session')).rejects.toThrow('Session not found');
    });

    it('should throw error when session has no transcript', async () => {
      const mockSession = {
        id: 'session-123',
        transcript: null,
        riskLevel: null,
      };

      const mockSelectFrom = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([mockSession]),
      });
      const mockSelect = vi.fn().mockReturnValue({
        from: mockSelectFrom,
      });
      vi.mocked(db.select).mockImplementation(mockSelect);

      await expect(evaluateSessionRisk('session-123')).rejects.toThrow(
        'Session has no transcript to evaluate'
      );
    });

    it('should update session with evaluated risk level', async () => {
      const mockSession = {
        id: 'session-456',
        transcript: 'Content discussing self-harm thoughts.',
        riskLevel: null,
      };

      const mockSelectFrom = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([mockSession]),
      });
      const mockSelect = vi.fn().mockReturnValue({
        from: mockSelectFrom,
      });
      vi.mocked(db.select).mockImplementation(mockSelect);

      const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
      const mockUpdateSet = vi.fn().mockReturnValue({
        where: mockUpdateWhere,
      });
      const mockUpdate = vi.fn().mockReturnValue({
        set: mockUpdateSet,
      });
      vi.mocked(db.update).mockImplementation(mockUpdate);

      vi.mocked(moderationService.evaluateContentRisk).mockResolvedValue('high');

      const result = await evaluateSessionRisk('session-456');

      expect(result).toBe('high');
      expect(mockUpdateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          riskLevel: 'high',
        })
      );
    });

    it('should return medium risk level', async () => {
      const mockSession = {
        id: 'session-789',
        transcript: 'Client mentioned feeling angry and frustrated.',
        riskLevel: null,
      };

      const mockSelectFrom = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([mockSession]),
      });
      const mockSelect = vi.fn().mockReturnValue({
        from: mockSelectFrom,
      });
      vi.mocked(db.select).mockImplementation(mockSelect);

      const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
      const mockUpdateSet = vi.fn().mockReturnValue({
        where: mockUpdateWhere,
      });
      const mockUpdate = vi.fn().mockReturnValue({
        set: mockUpdateSet,
      });
      vi.mocked(db.update).mockImplementation(mockUpdate);

      vi.mocked(moderationService.evaluateContentRisk).mockResolvedValue('medium');

      const result = await evaluateSessionRisk('session-789');

      expect(result).toBe('medium');
    });

    it('should propagate moderation service errors', async () => {
      const mockSession = {
        id: 'session-error',
        transcript: 'Some content',
        riskLevel: null,
      };

      const mockSelectFrom = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([mockSession]),
      });
      const mockSelect = vi.fn().mockReturnValue({
        from: mockSelectFrom,
      });
      vi.mocked(db.select).mockImplementation(mockSelect);

      vi.mocked(moderationService.evaluateContentRisk).mockRejectedValue(
        new Error('Moderation API error')
      );

      await expect(evaluateSessionRisk('session-error')).rejects.toThrow('Moderation API error');
    });
  });

  describe('evaluatePlanRisk', () => {
    it('should evaluate risk for plan text', async () => {
      vi.mocked(moderationService.evaluateContentRisk).mockResolvedValue('none');

      const result = await evaluatePlanRisk(
        'A supportive plan with positive goals and coping strategies.'
      );

      expect(moderationService.evaluateContentRisk).toHaveBeenCalledWith(
        'A supportive plan with positive goals and coping strategies.'
      );
      expect(result).toBe('none');
    });

    it('should return high risk for concerning plan content', async () => {
      vi.mocked(moderationService.evaluateContentRisk).mockResolvedValue('high');

      const result = await evaluatePlanRisk('Plan text with concerning content');

      expect(result).toBe('high');
    });

    it('should return low risk for mildly flagged content', async () => {
      vi.mocked(moderationService.evaluateContentRisk).mockResolvedValue('low');

      const result = await evaluatePlanRisk('Plan with mild concerns');

      expect(result).toBe('low');
    });

    it('should propagate errors from moderation service', async () => {
      vi.mocked(moderationService.evaluateContentRisk).mockRejectedValue(
        new Error('Content moderation failed')
      );

      await expect(evaluatePlanRisk('Any plan text')).rejects.toThrow('Content moderation failed');
    });
  });
});
