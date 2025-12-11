'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { DisclaimerBanner } from '@/components/disclaimers';
import {
  Button,
  Card,
  StatusBadge,
  LoadingSpinner,
  ErrorBanner,
  EmptyState,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import {
  DashboardLayout,
  DashboardHeader,
  DashboardMain,
  DashboardTitle,
  TreatmentPlanCard,
} from '@/components/dashboard';

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
  const [activeTab, setActiveTab] = useState<string>('plan');

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

  const getSessionStatus = (session: Session): 'completed' | 'processing' | 'scheduled' => {
    if (session.transcript) return 'completed';
    if (session.audioFilePath) return 'processing';
    return 'scheduled';
  };

  const parseClientPlan = (planText: string): ClientPlan | null => {
    try {
      return JSON.parse(planText);
    } catch {
      return null;
    }
  };

  // Map client plan to TreatmentPlanCard format
  const mapToTreatmentPlan = (clientPlan: ClientPlan) => ({
    progressSummary: clientPlan.yourProgress,
    goals: clientPlan.goalsWeAreWorkingOn,
    interventions: clientPlan.thingsToTry,
    strengths: clientPlan.yourStrengths,
  });

  if (authLoading || loading) {
    return (
      <DashboardLayout className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-[#6b7280] dark:text-[#9ca3af]">Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const clientPlan = activePlan ? parseClientPlan(activePlan.clientPlanText) : null;

  return (
    <DashboardLayout>
      {/* Header */}
      <DashboardHeader>
        <DashboardTitle
          title={`Welcome back, ${user?.name}`}
          subtitle="Your wellness journey"
          actions={
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          }
        />
      </DashboardHeader>

      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="plan">My Treatment Plan</TabsTrigger>
            <TabsTrigger value="sessions">My Sessions</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <DashboardMain className="max-w-4xl">
        {error && <ErrorBanner message={error} />}

        {activeTab === 'plan' ? (
          /* Treatment Plan View */
          <>
            {/* AI-Generated Content Disclaimer */}
            <DisclaimerBanner variant="clinical" className="mb-6" />

            {!activePlan || !clientPlan ? (
              <EmptyState
                icon={
                  <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
                title="Your Treatment Plan"
                description="No treatment plan available yet. Your therapist will create one after your next session. Check back soon!"
              />
            ) : (
              <>
                {/* Plan Header */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-[#1a1d21] dark:text-[#f5f3ef] mb-2">
                    Your Treatment Plan
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-[#6b7280] dark:text-[#9ca3af]">
                    <span>
                      Created on{' '}
                      {new Date(activePlan.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-[#d1d5db] dark:text-[#3d4449]">|</span>
                    <span>with {activePlan.therapistName}</span>
                    <span className="text-[#d1d5db] dark:text-[#3d4449]">|</span>
                    <span className="text-[#c4907a] dark:text-[#d4a08a] font-medium">
                      Version {activePlan.versionNumber}
                    </span>
                  </div>
                </div>

                {/* Treatment Plan Content */}
                <TreatmentPlanCard plan={mapToTreatmentPlan(clientPlan)} />

                {/* Plan History */}
                {planHistory.length > 1 && (
                  <div className="mt-12">
                    <h3 className="text-lg font-semibold text-[#1a1d21] dark:text-[#f5f3ef] mb-4">
                      Previous Versions
                    </h3>
                    <div className="space-y-2">
                      {planHistory
                        .filter((plan) => !plan.isActive)
                        .map((plan) => (
                          <Card
                            key={plan.id}
                            variant="interactive"
                            padding="md"
                            onClick={() => router.push(`/client/plans/${plan.id}`)}
                            className="cursor-pointer"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-[#1a1d21] dark:text-[#f5f3ef]">
                                Version {plan.versionNumber}
                              </span>
                              <span className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
                                {new Date(plan.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </Card>
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
              <EmptyState
                icon={
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
                title="No sessions yet"
                description="Your therapy sessions will appear here once scheduled."
              />
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => {
                  const status = getSessionStatus(session);
                  const statusConfig = {
                    completed: { label: 'Completed', type: 'completed' as const },
                    processing: { label: 'Processing', type: 'pending' as const },
                    scheduled: { label: 'Scheduled', type: 'active' as const },
                  };
                  const { label, type } = statusConfig[status];

                  return (
                    <Card
                      key={session.id}
                      variant="elevated"
                      padding="lg"
                      className="hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-[#1a1d21] dark:text-[#f5f3ef]">
                              {new Date(session.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </h3>
                            <StatusBadge status={type}>{label}</StatusBadge>
                          </div>
                          <p className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
                            Session ID:{' '}
                            <span className="font-mono">{session.id.slice(0, 8)}...</span>
                          </p>
                        </div>
                        <Link
                          href={`/client/sessions/${session.id}`}
                          className="text-[#c4907a] hover:text-[#a67462] dark:text-[#d4a08a] dark:hover:text-[#c4907a] text-sm font-medium flex items-center gap-1 transition-colors"
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
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </DashboardMain>
    </DashboardLayout>
  );
}
