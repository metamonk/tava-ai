'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { DisclaimerBanner } from '@/components/disclaimers';

interface TherapistPlan {
  presentingConcerns: string[];
  clinicalImpressions: string;
  shortTermGoals: string[];
  longTermGoals: string[];
  interventionsUsed: string[];
  homework: string[];
  strengths: string[];
  risks: string[];
}

interface ClientPlan {
  yourProgress: string;
  goalsWeAreWorkingOn: string[];
  thingsToTry: string[];
  yourStrengths: string[];
}

interface Plan {
  id: string;
  sessionId: string;
  clientId: string;
  therapistId: string;
  versionNumber: number;
  therapistPlanText: string;
  clientPlanText: string;
  isActive: boolean;
  createdAt: string;
  therapistPlan: TherapistPlan;
  clientPlan: ClientPlan;
}

interface Version {
  id: string;
  versionNumber: number;
  isActive: boolean;
  createdAt: string;
}

export default function PlanEditorPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.planId as string;
  const { user, isLoading: authLoading } = useAuth();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'therapist' | 'client'>('therapist');
  const [isEditing, setIsEditing] = useState(false);

  // Editable state
  const [therapistPlanText, setTherapistPlanText] = useState('');
  const [clientPlanText, setClientPlanText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!authLoading && user && planId) {
      fetchPlan();
    }
  }, [authLoading, user, planId]);

  const fetchPlan = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/plans/${planId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Plan not found');
        }
        if (response.status === 403) {
          throw new Error('Access denied');
        }
        throw new Error('Failed to fetch plan');
      }

      const data = await response.json();
      setPlan(data.plan);
      setTherapistPlanText(data.plan.therapistPlanText);
      setClientPlanText(data.plan.clientPlanText);

      // Fetch version history
      fetchVersions(data.plan.sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async (sessionId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/plans/session/${sessionId}/versions`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions || []);
      }
    } catch (err) {
      console.error('Failed to fetch versions:', err);
    }
  };

  const handleSave = async () => {
    if (!plan) return;

    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(`${apiUrl}/api/plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          therapistPlanText,
          clientPlanText,
          lastUpdatedAt: plan.createdAt,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          throw new Error(data.error || 'Plan was modified. Please refresh and try again.');
        }
        throw new Error(data.error || 'Failed to save plan');
      }

      const data = await response.json();
      router.push(`/therapist/plans/${data.plan.id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (plan) {
      setTherapistPlanText(plan.therapistPlanText);
      setClientPlanText(plan.clientPlanText);
    }
    setIsEditing(false);
    setSaveError(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f1114]">
        <div className="flex items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400"
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
          <span className="text-gray-600 dark:text-[#9ca3af]">Loading plan...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1114]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-6 text-center">
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
            <h3 className="mt-4 text-lg font-medium text-red-800 dark:text-red-300">{error}</h3>
            <Link
              href="/therapist/dashboard"
              className="mt-4 inline-block text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const therapistPlan = plan.therapistPlan;
  const clientPlan = plan.clientPlan;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1114]">
      {/* Header */}
      <header className="bg-white dark:bg-[#161a1d] shadow-sm dark:shadow-none dark:border-b dark:border-[#2a2f35]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/therapist/sessions/${plan.sessionId}`}
                className="text-gray-500 dark:text-[#9ca3af] hover:text-gray-700 dark:hover:text-[#d1d5db] transition-colors"
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-[#f5f3ef]">
                  {isEditing ? 'Edit Treatment Plan' : `Treatment Plan v${plan.versionNumber}`}
                </h1>
                <p className="text-sm text-gray-600 dark:text-[#9ca3af]">
                  Created {new Date(plan.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {plan.isActive && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  Active
                </span>
              )}
              {!isEditing && user?.role === 'therapist' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md font-medium hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
                >
                  Edit Plan
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI-Generated Content Disclaimer */}
        <DisclaimerBanner variant="clinical" className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setViewMode('therapist')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'therapist'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-[#1a1d21] text-gray-700 dark:text-[#d1d5db] hover:bg-gray-200 dark:hover:bg-[#2a2f35]'
                }`}
              >
                Therapist View
              </button>
              <button
                onClick={() => setViewMode('client')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'client'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-[#1a1d21] text-gray-700 dark:text-[#d1d5db] hover:bg-gray-200 dark:hover:bg-[#2a2f35]'
                }`}
              >
                Client View
              </button>
            </div>

            {/* Save Error */}
            {saveError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700 dark:text-red-300">{saveError}</p>
              </div>
            )}

            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-6">
                {viewMode === 'therapist' ? (
                  <div className="bg-white dark:bg-[#161a1d] rounded-lg shadow-sm dark:shadow-none dark:border dark:border-[#2a2f35] p-6">
                    <label className="block mb-2 text-sm font-semibold text-gray-900 dark:text-[#f5f3ef]">
                      Therapist Plan (Clinical)
                    </label>
                    <textarea
                      value={therapistPlanText}
                      onChange={(e) => setTherapistPlanText(e.target.value)}
                      className="w-full h-96 px-4 py-3 border border-gray-300 dark:border-[#3d4449] dark:bg-[#1a1d21] dark:text-[#f5f3ef] dark:placeholder-[#6b7280] rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter therapist plan JSON..."
                    />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#161a1d] rounded-lg shadow-sm dark:shadow-none dark:border dark:border-[#2a2f35] p-6">
                    <label className="block mb-2 text-sm font-semibold text-gray-900 dark:text-[#f5f3ef]">
                      Client Plan (Simplified)
                    </label>
                    <textarea
                      value={clientPlanText}
                      onChange={(e) => setClientPlanText(e.target.value)}
                      className="w-full h-96 px-4 py-3 border border-gray-300 dark:border-[#3d4449] dark:bg-[#1a1d21] dark:text-[#f5f3ef] dark:placeholder-[#6b7280] rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter client plan JSON..."
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-green-600 dark:bg-green-500 text-white py-3 rounded-md font-medium hover:bg-green-700 dark:hover:bg-green-400 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                        Saving...
                      </span>
                    ) : (
                      'Save as New Version'
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-6 py-3 bg-gray-200 dark:bg-[#2a2f35] text-gray-700 dark:text-[#d1d5db] rounded-md font-medium hover:bg-gray-300 dark:hover:bg-[#3d4449] disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <>
                {viewMode === 'therapist' ? (
                  <div className="space-y-6">
                    <Section title="Presenting Concerns">
                      <ul className="list-disc list-inside space-y-1">
                        {therapistPlan.presentingConcerns.map((concern, idx) => (
                          <li key={idx} className="text-gray-700 dark:text-[#d1d5db]">
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </Section>

                    <Section title="Clinical Impressions">
                      <p className="text-gray-700 dark:text-[#d1d5db] whitespace-pre-wrap">
                        {therapistPlan.clinicalImpressions}
                      </p>
                    </Section>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Section title="Short-Term Goals">
                        <ul className="list-disc list-inside space-y-1">
                          {therapistPlan.shortTermGoals.map((goal, idx) => (
                            <li key={idx} className="text-gray-700 dark:text-[#d1d5db]">
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </Section>

                      <Section title="Long-Term Goals">
                        <ul className="list-disc list-inside space-y-1">
                          {therapistPlan.longTermGoals.map((goal, idx) => (
                            <li key={idx} className="text-gray-700 dark:text-[#d1d5db]">
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </Section>
                    </div>

                    <Section title="Interventions Used">
                      <div className="flex flex-wrap gap-2">
                        {therapistPlan.interventionsUsed.map((intervention, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                          >
                            {intervention}
                          </span>
                        ))}
                      </div>
                    </Section>

                    <Section title="Homework Assigned">
                      <ul className="list-disc list-inside space-y-1">
                        {therapistPlan.homework.map((item, idx) => (
                          <li key={idx} className="text-gray-700 dark:text-[#d1d5db]">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </Section>

                    <Section title="Strengths & Protective Factors">
                      <ul className="list-disc list-inside space-y-1">
                        {therapistPlan.strengths.map((strength, idx) => (
                          <li key={idx} className="text-gray-700 dark:text-[#d1d5db]">
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </Section>

                    {therapistPlan.risks.length > 0 && (
                      <Section title="Risk Assessment" variant="danger">
                        <ul className="list-disc list-inside space-y-1">
                          {therapistPlan.risks.map((risk, idx) => (
                            <li key={idx} className="text-red-700 dark:text-red-300">
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </Section>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Section title="Your Progress" variant="success">
                      <p className="text-gray-700 dark:text-[#d1d5db] whitespace-pre-wrap">
                        {clientPlan.yourProgress}
                      </p>
                    </Section>

                    <Section title="Goals We Are Working On">
                      <ul className="list-disc list-inside space-y-1">
                        {clientPlan.goalsWeAreWorkingOn.map((goal, idx) => (
                          <li key={idx} className="text-gray-700 dark:text-[#d1d5db]">
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </Section>

                    <Section title="Things to Try This Week">
                      <ul className="space-y-2">
                        {clientPlan.thingsToTry.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-1 text-green-500 dark:text-green-400">
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </span>
                            <span className="text-gray-700 dark:text-[#d1d5db]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Section>

                    <Section title="Your Strengths" variant="success">
                      <div className="flex flex-wrap gap-2">
                        {clientPlan.yourStrengths.map((strength, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm"
                          >
                            {strength}
                          </span>
                        ))}
                      </div>
                    </Section>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Version History Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#161a1d] rounded-lg shadow-sm dark:shadow-none dark:border dark:border-[#2a2f35] p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#f5f3ef] mb-4">
                Version History
              </h2>
              {versions.length > 0 ? (
                <div className="space-y-3">
                  {versions.map((v) => (
                    <div
                      key={v.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        v.id === planId
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800/50'
                          : v.isActive
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800/50'
                            : 'bg-gray-50 dark:bg-[#1a1d21] border-gray-200 dark:border-[#2a2f35] hover:bg-gray-100 dark:hover:bg-[#2a2f35]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 dark:text-[#f5f3ef]">
                          v{v.versionNumber}
                        </span>
                        <div className="flex gap-1">
                          {v.id === planId && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              Current
                            </span>
                          )}
                          {v.isActive && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-[#9ca3af] mb-2">
                        {new Date(v.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {v.id !== planId && (
                        <button
                          onClick={() => router.push(`/therapist/plans/${v.id}`)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                        >
                          View
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-[#9ca3af]">
                  No version history available.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
  variant = 'default',
}: {
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger';
}) {
  const headerColors = {
    default: 'bg-gray-50 dark:bg-[#1a1d21] border-gray-200 dark:border-[#2a2f35]',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30',
  };

  const titleColors = {
    default: 'text-gray-900 dark:text-[#f5f3ef]',
    success: 'text-green-900 dark:text-green-300',
    danger: 'text-red-900 dark:text-red-300',
  };

  return (
    <div className="bg-white dark:bg-[#161a1d] rounded-lg shadow-sm dark:shadow-none dark:border dark:border-[#2a2f35] overflow-hidden">
      <div className={`px-6 py-3 border-b ${headerColors[variant]}`}>
        <h3 className={`text-sm font-semibold ${titleColors[variant]}`}>{title}</h3>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}
