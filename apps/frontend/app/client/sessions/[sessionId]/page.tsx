'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

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

  const getSessionStatus = () => {
    if (!session) return null;
    if (session.transcript) return { text: 'Completed', color: 'bg-green-100 text-green-800' };
    if (session.audioFilePath) return { text: 'Processing', color: 'bg-amber-100 text-amber-800' };
    return { text: 'Scheduled', color: 'bg-blue-100 text-blue-800' };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-gray-600">Loading session...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
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
            <h3 className="mt-4 text-lg font-medium text-red-800">{error}</h3>
            <Link
              href="/client/dashboard"
              className="mt-4 inline-block text-sm font-medium text-red-600 hover:text-red-800"
            >
              Back to My Sessions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const status = getSessionStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/client/dashboard"
              className="text-gray-500 hover:text-gray-700 transition-colors"
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
              <h1 className="text-2xl font-bold text-gray-900">Session Details</h1>
              <p className="text-sm text-gray-600">
                {new Date(session.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Session Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Session Information</h2>
            {status && (
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${status.color}`}>
                {status.text}
              </span>
            )}
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Session ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{session.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(session.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
          </dl>
        </div>

        {/* Session Content */}
        {session.transcript ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-green-500"
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
                <h3 className="text-sm font-medium text-gray-900">Session Notes</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm">
                Your therapist has documented this session. Treatment plan details will be available
                in a separate section.
              </p>
            </div>
          </div>
        ) : session.audioFilePath ? (
          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-amber-500"
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
                <h3 className="text-sm font-medium text-amber-800">Session Recording Uploaded</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Your therapist is processing the session recording. Details will be available
                  soon.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-blue-500"
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
                <h3 className="text-sm font-medium text-blue-800">Session Scheduled</h3>
                <p className="text-sm text-blue-700 mt-1">
                  This session has been scheduled. Notes will be available after your therapist
                  completes the documentation.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
