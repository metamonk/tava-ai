'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, StatusBadge, LoadingSpinner } from '@/components/ui';
import { DashboardLayout, DashboardHeader, DashboardMain } from '@/components/dashboard';

interface Session {
  id: string;
  therapistId: string;
  clientId: string;
  date: string;
  transcript: string | null;
  audioFilePath: string | null;
  riskLevel: string;
  createdAt: string;
  updatedAt: string;
}

export default function ClientSessionDetailPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { user, isLoading: authLoading } = useAuth();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!authLoading && user && sessionId) {
      fetchSession();
    }
  }, [authLoading, user, sessionId]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/sessions/${sessionId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Session not found');
        }
        if (response.status === 403) {
          throw new Error('Access denied');
        }
        throw new Error('Failed to fetch session');
      }

      const data = await response.json();
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const getSessionStatus = (): {
    text: string;
    type: 'completed' | 'pending' | 'active';
  } | null => {
    if (!session) return null;
    if (session.transcript) return { text: 'Completed', type: 'completed' };
    if (session.audioFilePath) return { text: 'Processing', type: 'pending' };
    return { text: 'Scheduled', type: 'active' };
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-[#6b7280] dark:text-[#9ca3af]">Loading session...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardMain className="max-w-4xl">
          <Card variant="elevated" padding="lg" className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-400 dark:text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-[#1a1d21] dark:text-[#f5f3ef]">{error}</h3>
            <Link
              href="/client/dashboard"
              className="mt-4 inline-block text-sm font-medium text-[#c4907a] hover:text-[#a67462] dark:text-[#d4a08a] dark:hover:text-[#c4907a] transition-colors"
            >
              Back to My Sessions
            </Link>
          </Card>
        </DashboardMain>
      </DashboardLayout>
    );
  }

  if (!session) {
    return null;
  }

  const status = getSessionStatus();

  return (
    <DashboardLayout>
      {/* Header */}
      <DashboardHeader>
        <div className="flex items-center gap-4">
          <Link
            href="/client/dashboard"
            className="text-[#6b7280] hover:text-[#1a1d21] dark:text-[#9ca3af] dark:hover:text-[#f5f3ef] transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1a1d21] dark:text-[#f5f3ef]">
              Session Details
            </h1>
            <p className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
              {new Date(session.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </DashboardHeader>

      <DashboardMain className="max-w-4xl">
        {/* Session Info Card */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1a1d21] dark:text-[#f5f3ef]">
              Session Information
            </h2>
            {status && <StatusBadge status={status.type}>{status.text}</StatusBadge>}
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-[#6b7280] dark:text-[#9ca3af]">Session ID</dt>
              <dd className="mt-1 text-sm text-[#1a1d21] dark:text-[#f5f3ef] font-mono">
                {session.id}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-[#6b7280] dark:text-[#9ca3af]">Date</dt>
              <dd className="mt-1 text-sm text-[#1a1d21] dark:text-[#f5f3ef]">
                {new Date(session.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Session Content */}
        {session.transcript ? (
          <Card variant="elevated" className="overflow-hidden">
            <div className="px-6 py-4 bg-[#faf8f5] dark:bg-[#1a1d21] border-b border-[#e8e6e1] dark:border-[#2a2f35]">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-green-500 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-sm font-medium text-[#1a1d21] dark:text-[#f5f3ef]">
                  Session Notes
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-[#6b7280] dark:text-[#9ca3af] text-sm">
                Your therapist has documented this session. Treatment plan details will be available
                in a separate section.
              </p>
            </div>
          </Card>
        ) : session.audioFilePath ? (
          <Card
            variant="default"
            padding="lg"
            className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-amber-500 dark:text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Session Recording Uploaded
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Your therapist is processing the session recording. Details will be available
                  soon.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card
            variant="default"
            padding="lg"
            className="bg-[#c4907a]/10 dark:bg-[#c4907a]/5 border-[#c4907a]/20 dark:border-[#c4907a]/10"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-[#c4907a] dark:text-[#d4a08a]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#1a1d21] dark:text-[#f5f3ef]">
                  Session Scheduled
                </h3>
                <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] mt-1">
                  This session has been scheduled. Notes will be available after your therapist
                  completes the documentation.
                </p>
              </div>
            </div>
          </Card>
        )}
      </DashboardMain>
    </DashboardLayout>
  );
}
