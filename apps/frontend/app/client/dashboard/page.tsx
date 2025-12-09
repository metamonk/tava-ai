'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Session {
  id: string;
  therapistId: string;
  date: string;
  transcript: string | null;
  audioFilePath: string | null;
  riskLevel: string;
  createdAt: string;
}

interface ClientPlan {
  yourProgress: string;
  goalsWeAreWorkingOn: string[];
  thingsToTry: string[];
  yourStrengths: string[];
}

interface ActivePlan {
  id: string;
  clientPlanText: string;
  versionNumber: number;
  createdAt: string;
  sessionDate: string;
  therapistName: string;
}

interface PlanHistoryItem {
  id: string;
  versionNumber: number;
  createdAt: string;
  isActive: boolean;
}

export default function ClientDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [planHistory, setPlanHistory] = useState<PlanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'sessions'>('plan');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!authLoading && user) {
      Promise.all([fetchDashboard(), fetchSessions()]).finally(() => setLoading(false));
    }
  }, [authLoading, user]);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/dashboard/client`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard');
      }

      const data = await response.json();
      setActivePlan(data.activePlan);
      setPlanHistory(data.planHistory);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/sessions`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      setSessions(data.sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getSessionStatus = (session: Session) => {
    if (session.transcript) return { text: 'Completed', color: 'bg-green-100 text-green-800' };
    if (session.audioFilePath) return { text: 'Processing', color: 'bg-amber-100 text-amber-800' };
    return { text: 'Scheduled', color: 'bg-blue-100 text-blue-800' };
  };

  const parseClientPlan = (planText: string): ClientPlan | null => {
    try {
      return JSON.parse(planText);
    } catch {
      return null;
    }
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
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  const clientPlan = activePlan ? parseClientPlan(activePlan.clientPlanText) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
            <p className="text-sm text-gray-600">Your wellness journey</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('plan')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'plan'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Treatment Plan
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'sessions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Sessions
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {activeTab === 'plan' ? (
          /* Treatment Plan View */
          <>
            {!activePlan || !clientPlan ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <svg
                  className="mx-auto h-16 w-16 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">Your Treatment Plan</h3>
                <p className="mt-2 text-gray-600 max-w-md mx-auto">
                  No treatment plan available yet. Your therapist will create one after your next
                  session. Check back soon!
                </p>
              </div>
            ) : (
              <>
                {/* Plan Header */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Treatment Plan</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>
                      Created on{' '}
                      {new Date(activePlan.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span>with {activePlan.therapistName}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-blue-600 font-medium">
                      Version {activePlan.versionNumber}
                    </span>
                  </div>
                </div>

                {/* Your Progress - Blue/Purple Gradient */}
                <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <h3 className="text-xl font-semibold mb-3 text-blue-900 flex items-center gap-2">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    Your Progress
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed">{clientPlan.yourProgress}</p>
                </div>

                {/* Goals We&apos;re Working On - White Card with Green */}
                <div className="mb-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4 text-green-800 flex items-center gap-2">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Goals We&apos;re Working On
                  </h3>
                  <ul className="space-y-3">
                    {clientPlan.goalsWeAreWorkingOn.map((goal, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-green-500 text-xl flex-shrink-0 mt-0.5">
                          &#10003;
                        </span>
                        <span className="text-gray-700">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Things to Try This Week - White Card with Orange */}
                <div className="mb-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4 text-orange-800 flex items-center gap-2">
                    <svg
                      className="h-6 w-6 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Things to Try This Week
                  </h3>
                  <ul className="space-y-3">
                    {clientPlan.thingsToTry.map((task, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-orange-500 text-xl flex-shrink-0 mt-0.5">
                          &#8594;
                        </span>
                        <span className="text-gray-700">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Your Strengths - Purple/Pink Gradient */}
                <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <h3 className="text-xl font-semibold mb-4 text-purple-900 flex items-center gap-2">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                    Your Strengths
                  </h3>
                  <ul className="space-y-3">
                    {clientPlan.yourStrengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-purple-500 text-xl flex-shrink-0 mt-0.5">
                          &#9733;
                        </span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan History */}
                {planHistory.length > 1 && (
                  <div className="mt-12">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Versions</h3>
                    <div className="space-y-2">
                      {planHistory
                        .filter((plan) => !plan.isActive)
                        .map((plan) => (
                          <div
                            key={plan.id}
                            onClick={() => router.push(`/client/plans/${plan.id}`)}
                            className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900">
                                Version {plan.versionNumber}
                              </span>
                              <span className="text-sm text-gray-600">
                                {new Date(plan.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* Sessions View */
          <>
            {sessions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No sessions yet</h3>
                <p className="mt-2 text-gray-500">
                  Your therapy sessions will appear here once scheduled.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => {
                  const status = getSessionStatus(session);
                  return (
                    <div
                      key={session.id}
                      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {new Date(session.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}
                            >
                              {status.text}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Session ID:{' '}
                            <span className="font-mono">{session.id.slice(0, 8)}...</span>
                          </p>
                        </div>
                        <Link
                          href={`/client/sessions/${session.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                          View Details
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
