'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { DisclaimerBanner } from '@/components/disclaimers';
import {
  Button,
  Card,
  Badge,
  Textarea,
  LoadingSpinner,
  ErrorBanner,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { DashboardLayout, DashboardMain, BackLink } from '@/components/dashboard';

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
      <DashboardLayout className="flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading plan..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardMain>
          <BackLink href="/therapist/dashboard" label="Back to Dashboard" />
          <ErrorBanner message={error} />
        </DashboardMain>
      </DashboardLayout>
    );
  }

  if (!plan) {
    return null;
  }

  const therapistPlan = plan.therapistPlan;
  const clientPlan = plan.clientPlan;

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="bg-white dark:bg-[#161a1d] shadow-sm dark:shadow-none dark:border-b dark:border-[#2a2f35]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/therapist/sessions/${plan.sessionId}`}
                className="text-[#6b7280] dark:text-[#9ca3af] hover:text-[#3d4449] dark:hover:text-[#d1d5db] transition-colors"
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
                  {isEditing ? 'Edit Treatment Plan' : `Treatment Plan v${plan.versionNumber}`}
                </h1>
                <p className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
                  Created {new Date(plan.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {plan.isActive && (
                <Badge variant="sage" size="md">
                  Active
                </Badge>
              )}
              {!isEditing && user?.role === 'therapist' && (
                <Button onClick={() => setIsEditing(true)}>Edit Plan</Button>
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
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as 'therapist' | 'client')}
              variant="buttons"
              className="mb-6"
            >
              <TabsList>
                <TabsTrigger value="therapist">Therapist View</TabsTrigger>
                <TabsTrigger value="client">Client View</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Save Error */}
            {saveError && <ErrorBanner message={saveError} className="mb-6" />}

            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-6">
                {viewMode === 'therapist' ? (
                  <Card padding="lg">
                    <label className="block mb-2 text-sm font-semibold text-[#1a1d21] dark:text-[#f5f3ef]">
                      Therapist Plan (Clinical)
                    </label>
                    <Textarea
                      value={therapistPlanText}
                      onChange={(e) => setTherapistPlanText(e.target.value)}
                      className="h-96 font-mono text-sm"
                      placeholder="Enter therapist plan JSON..."
                    />
                  </Card>
                ) : (
                  <Card padding="lg">
                    <label className="block mb-2 text-sm font-semibold text-[#1a1d21] dark:text-[#f5f3ef]">
                      Client Plan (Simplified)
                    </label>
                    <Textarea
                      value={clientPlanText}
                      onChange={(e) => setClientPlanText(e.target.value)}
                      className="h-96 text-sm"
                      placeholder="Enter client plan JSON..."
                    />
                  </Card>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="sage"
                    onClick={handleSave}
                    disabled={saving}
                    isLoading={saving}
                    loadingText="Saving..."
                    className="flex-1"
                  >
                    Save as New Version
                  </Button>
                  <Button variant="secondary" onClick={handleCancelEdit} disabled={saving}>
                    Cancel
                  </Button>
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
                          <li key={idx} className="text-[#3d4449] dark:text-[#d1d5db]">
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </Section>

                    <Section title="Clinical Impressions">
                      <p className="text-[#3d4449] dark:text-[#d1d5db] whitespace-pre-wrap">
                        {therapistPlan.clinicalImpressions}
                      </p>
                    </Section>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Section title="Short-Term Goals">
                        <ul className="list-disc list-inside space-y-1">
                          {therapistPlan.shortTermGoals.map((goal, idx) => (
                            <li key={idx} className="text-[#3d4449] dark:text-[#d1d5db]">
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </Section>

                      <Section title="Long-Term Goals">
                        <ul className="list-disc list-inside space-y-1">
                          {therapistPlan.longTermGoals.map((goal, idx) => (
                            <li key={idx} className="text-[#3d4449] dark:text-[#d1d5db]">
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </Section>
                    </div>

                    <Section title="Interventions Used">
                      <div className="flex flex-wrap gap-2">
                        {therapistPlan.interventionsUsed.map((intervention, idx) => (
                          <Badge key={idx} variant="primary" size="md">
                            {intervention}
                          </Badge>
                        ))}
                      </div>
                    </Section>

                    <Section title="Homework Assigned">
                      <ul className="list-disc list-inside space-y-1">
                        {therapistPlan.homework.map((item, idx) => (
                          <li key={idx} className="text-[#3d4449] dark:text-[#d1d5db]">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </Section>

                    <Section title="Strengths & Protective Factors">
                      <ul className="list-disc list-inside space-y-1">
                        {therapistPlan.strengths.map((strength, idx) => (
                          <li key={idx} className="text-[#3d4449] dark:text-[#d1d5db]">
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
                      <p className="text-[#3d4449] dark:text-[#d1d5db] whitespace-pre-wrap">
                        {clientPlan.yourProgress}
                      </p>
                    </Section>

                    <Section title="Goals We Are Working On">
                      <ul className="list-disc list-inside space-y-1">
                        {clientPlan.goalsWeAreWorkingOn.map((goal, idx) => (
                          <li key={idx} className="text-[#3d4449] dark:text-[#d1d5db]">
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </Section>

                    <Section title="Things to Try This Week">
                      <ul className="space-y-2">
                        {clientPlan.thingsToTry.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-1 text-[#a8b5a0] dark:text-[#b8c5b0]">
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
                            <span className="text-[#3d4449] dark:text-[#d1d5db]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Section>

                    <Section title="Your Strengths" variant="success">
                      <div className="flex flex-wrap gap-2">
                        {clientPlan.yourStrengths.map((strength, idx) => (
                          <Badge key={idx} variant="sage" size="md">
                            {strength}
                          </Badge>
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
            <Card className="sticky top-8" padding="lg">
              <h2 className="text-lg font-semibold text-[#1a1d21] dark:text-[#f5f3ef] mb-4">
                Version History
              </h2>
              {versions.length > 0 ? (
                <div className="space-y-3">
                  {versions.map((v) => (
                    <div
                      key={v.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        v.id === planId
                          ? 'bg-[#c4907a]/10 dark:bg-[#c4907a]/5 border-[#c4907a]/30 dark:border-[#c4907a]/20'
                          : v.isActive
                            ? 'bg-[#a8b5a0]/10 dark:bg-[#a8b5a0]/5 border-[#a8b5a0]/30 dark:border-[#a8b5a0]/20'
                            : 'bg-[#faf8f5] dark:bg-[#1a1d21] border-[#e8e6e1] dark:border-[#2a2f35] hover:bg-[#e8e6e1] dark:hover:bg-[#2a2f35]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[#1a1d21] dark:text-[#f5f3ef]">
                          v{v.versionNumber}
                        </span>
                        <div className="flex gap-1">
                          {v.id === planId && (
                            <Badge variant="primary" size="sm">
                              Current
                            </Badge>
                          )}
                          {v.isActive && (
                            <Badge variant="sage" size="sm">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-2">
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
                          className="text-sm text-[#c4907a] dark:text-[#d4a08a] hover:text-[#a67462] dark:hover:text-[#c4907a] font-medium"
                        >
                          View
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
                  No version history available.
                </p>
              )}
            </Card>
          </div>
        </div>
      </main>
    </DashboardLayout>
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
    default: 'bg-[#faf8f5] dark:bg-[#1a1d21] border-[#e8e6e1] dark:border-[#2a2f35]',
    success: 'bg-[#a8b5a0]/10 dark:bg-[#a8b5a0]/5 border-[#a8b5a0]/20 dark:border-[#a8b5a0]/10',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30',
  };

  const titleColors = {
    default: 'text-[#1a1d21] dark:text-[#f5f3ef]',
    success: 'text-[#5a6b52] dark:text-[#a8b5a0]',
    danger: 'text-red-900 dark:text-red-300',
  };

  return (
    <Card className="overflow-hidden">
      <div className={`px-6 py-3 border-b ${headerColors[variant]}`}>
        <h3 className={`text-sm font-semibold ${titleColors[variant]}`}>{title}</h3>
      </div>
      <div className="px-6 py-4">{children}</div>
    </Card>
  );
}
