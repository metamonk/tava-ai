'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import TranscriptUpload from '@/components/sessions/TranscriptUpload';
import TranscriptPreview from '@/components/sessions/TranscriptPreview';

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

interface Plan {
  id: string;
  sessionId: string;
  versionNumber: number;
  isActive: boolean;
  createdAt: string;
}

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { user, isLoading: authLoading } = useAuth();

  const [session, setSession] = useState<Session | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!authLoading && user && sessionId) {
      fetchSession();
      fetchPlans();
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

  const handleUploadComplete = () => {
    fetchSession();
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/plans/session/${sessionId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile) return;

    setTranscribing(true);
    setActionError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const response = await fetch(`${apiUrl}/api/sessions/${sessionId}/transcribe`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Transcription failed');
      }

      const data = await response.json();
      setSession((prev) => (prev ? { ...prev, transcript: data.transcript } : null));
      setAudioFile(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setTranscribing(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setActionError(null);

    try {
      const response = await fetch(`${apiUrl}/api/plans/generate/${sessionId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Plan generation failed');
      }

      const data = await response.json();
      router.push(`/therapist/plans/${data.plan.id}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Plan generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      none: { bg: 'bg-gray-100', text: 'text-gray-600' },
      low: { bg: 'bg-blue-100', text: 'text-blue-700' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      high: { bg: 'bg-red-100', text: 'text-red-700' },
    };
    return badges[riskLevel] || badges.none;
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
              href="/therapist/dashboard"
              className="mt-4 inline-block text-sm font-medium text-red-600 hover:text-red-800"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const riskBadge = getRiskBadge(session.riskLevel);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/therapist/dashboard"
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Information</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Session ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{session.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Client ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{session.clientId}</dd>
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
            <div>
              <dt className="text-sm font-medium text-gray-500">Risk Level</dt>
              <dd className="mt-1">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${riskBadge.bg} ${riskBadge.text}`}
                >
                  {session.riskLevel}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(session.createdAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(session.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Action Error */}
        {actionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">{actionError}</p>
          </div>
        )}

        {/* Transcript Section */}
        <div className="space-y-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900">Transcript</h2>

          {!session.transcript && !session.audioFilePath ? (
            <TranscriptUpload sessionId={sessionId} onUploadComplete={handleUploadComplete} />
          ) : (
            <TranscriptPreview
              transcript={session.transcript || undefined}
              audioFilePath={session.audioFilePath || undefined}
            />
          )}

          {/* Transcribe Audio Button - show when audio exists but no transcript */}
          {session.audioFilePath && !session.transcript && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Transcribe Audio with AI</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload the audio file to transcribe it using OpenAI Whisper. This may take a few
                seconds.
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                  onClick={handleTranscribe}
                  disabled={!audioFile || transcribing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {transcribing ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
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
                      Transcribing...
                    </span>
                  ) : (
                    'Transcribe Audio'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Plan Generation Section */}
        {session.transcript && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Treatment Plans</h2>
              <button
                onClick={handleGeneratePlan}
                disabled={generating}
                className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
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
                    Generating (20-30s)...
                  </span>
                ) : (
                  'Generate Treatment Plan'
                )}
              </button>
            </div>

            {plans.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Version
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {plans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          v{plan.versionNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {plan.isActive ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                              Archived
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(plan.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/therapist/plans/${plan.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
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
                <h3 className="mt-4 text-sm font-medium text-gray-900">No plans yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Click &quot;Generate Treatment Plan&quot; to create an AI-generated treatment plan
                  from the transcript.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
