'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import TranscriptUpload from '@/components/sessions/TranscriptUpload';
import TranscriptPreview from '@/components/sessions/TranscriptPreview';
import SessionOverviewCard from '@/components/sessions/SessionOverviewCard';
import { SyntheticDataNotice, DisclaimerBanner, RiskFlagIndicator } from '@/components/disclaimers';
import type { RiskLevel } from '@/components/disclaimers';
import {
  Button,
  Card,
  Badge,
  LoadingSpinner,
  ErrorBanner,
  DataTable,
  NoPlansEmpty,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  type Column,
} from '@/components/ui';
import { DashboardLayout, DashboardMain, BackLink } from '@/components/dashboard';

interface Session {
  id: string;
  therapistId: string;
  clientId: string;
  date: string;
  transcript: string | null;
  audioFilePath: string | null;
  riskLevel: RiskLevel;
  riskDetails?: string[];
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
  const [activeTab, setActiveTab] = useState('plans');

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

  // Calculate word count from transcript
  const wordCount = useMemo(() => {
    if (!session?.transcript) return 0;
    try {
      const parsed = JSON.parse(session.transcript);
      if (parsed.fullText) {
        return parsed.fullText.trim().split(/\s+/).filter(Boolean).length;
      }
    } catch {
      // Plain text transcript
    }
    return session.transcript.trim().split(/\s+/).filter(Boolean).length;
  }, [session?.transcript]);

  if (authLoading || loading) {
    return (
      <DashboardLayout className="flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading session..." />
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

  if (!session) {
    return null;
  }

  // Define columns for the DataTable
  const planColumns: Column<Plan>[] = [
    {
      key: 'versionNumber',
      header: 'Version',
      render: (plan) => (
        <span className="font-medium text-[#1a1d21] dark:text-[#f5f3ef]">
          v{plan.versionNumber}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (plan) =>
        plan.isActive ? (
          <Badge variant="sage" size="sm">
            Active
          </Badge>
        ) : (
          <Badge variant="default" size="sm">
            Archived
          </Badge>
        ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (plan) => (
        <span className="text-[#6b7280] dark:text-[#9ca3af]">
          {new Date(plan.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (plan) => (
        <Link
          href={`/therapist/plans/${plan.id}`}
          className="text-[#c4907a] dark:text-[#d4a08a] hover:text-[#a67462] dark:hover:text-[#c4907a] font-medium"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout>
      {/* Synthetic Data Notice - Sticky Banner */}
      <SyntheticDataNotice />

      {/* Header */}
      <header className="bg-white dark:bg-[#161a1d] shadow-sm dark:shadow-none dark:border-b dark:border-[#2a2f35]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/therapist/dashboard"
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
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Data Disclaimer Banner */}
        <DisclaimerBanner variant="data" className="mb-6" />

        {/* Risk Flag Indicator */}
        {session.riskLevel !== 'none' && (
          <RiskFlagIndicator
            level={session.riskLevel}
            details={session.riskDetails}
            className="mb-6"
          />
        )}

        {/* Session Overview Card - Always visible with key metrics and actions */}
        <SessionOverviewCard
          sessionDate={session.date}
          riskLevel={session.riskLevel}
          planCount={plans.length}
          wordCount={wordCount}
          hasTranscript={!!session.transcript}
          onGeneratePlan={handleGeneratePlan}
          isGenerating={generating}
          className="mb-6"
        />

        {/* Action Error */}
        {actionError && <ErrorBanner message={actionError} className="mb-6" />}

        {/* No Transcript State */}
        {!session.transcript && !session.audioFilePath && (
          <TranscriptUpload sessionId={sessionId} onUploadComplete={handleUploadComplete} />
        )}

        {/* Transcribe Audio Section - show when audio exists but no transcript */}
        {session.audioFilePath && !session.transcript && (
          <Card padding="lg" className="mb-6">
            <h3 className="text-md font-medium text-[#1a1d21] dark:text-[#f5f3ef] mb-4">
              Transcribe Audio with AI
            </h3>
            <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] mb-4">
              Upload the audio file to transcribe it using OpenAI Whisper. This may take a few
              seconds.
            </p>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="text-sm text-[#6b7280] dark:text-[#9ca3af] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#c4907a]/10 dark:file:bg-[#c4907a]/5 file:text-[#c4907a] dark:file:text-[#d4a08a] hover:file:bg-[#c4907a]/20 dark:hover:file:bg-[#c4907a]/10"
              />
              <Button
                onClick={handleTranscribe}
                disabled={!audioFile || transcribing}
                isLoading={transcribing}
                loadingText="Transcribing..."
              >
                Transcribe Audio
              </Button>
            </div>
          </Card>
        )}

        {/* Session Info Section - Always visible above tabs */}
        {session.transcript && (
          <Card padding="md" className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-[#6b7280] dark:text-[#9ca3af]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-sm font-semibold text-[#1a1d21] dark:text-[#f5f3ef]">
                Session Details
              </h2>
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <dt className="text-xs font-medium text-[#6b7280] dark:text-[#9ca3af] uppercase tracking-wider">
                  Session ID
                </dt>
                <dd
                  className="mt-1 text-sm text-[#1a1d21] dark:text-[#f5f3ef] font-mono truncate"
                  title={session.id}
                >
                  {session.id.slice(0, 8)}...
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#6b7280] dark:text-[#9ca3af] uppercase tracking-wider">
                  Client ID
                </dt>
                <dd
                  className="mt-1 text-sm text-[#1a1d21] dark:text-[#f5f3ef] font-mono truncate"
                  title={session.clientId}
                >
                  {session.clientId.slice(0, 8)}...
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#6b7280] dark:text-[#9ca3af] uppercase tracking-wider">
                  Date
                </dt>
                <dd className="mt-1 text-sm text-[#1a1d21] dark:text-[#f5f3ef]">
                  {new Date(session.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#6b7280] dark:text-[#9ca3af] uppercase tracking-wider">
                  Risk Level
                </dt>
                <dd className="mt-1">
                  <Badge
                    variant={
                      session.riskLevel === 'high'
                        ? 'error'
                        : session.riskLevel === 'medium'
                          ? 'warning'
                          : session.riskLevel === 'low'
                            ? 'sage'
                            : 'default'
                    }
                    size="sm"
                    className="capitalize"
                  >
                    {session.riskLevel}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#6b7280] dark:text-[#9ca3af] uppercase tracking-wider">
                  Created
                </dt>
                <dd className="mt-1 text-sm text-[#1a1d21] dark:text-[#f5f3ef]">
                  {new Date(session.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#6b7280] dark:text-[#9ca3af] uppercase tracking-wider">
                  Updated
                </dt>
                <dd className="mt-1 text-sm text-[#1a1d21] dark:text-[#f5f3ef]">
                  {new Date(session.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
          </Card>
        )}

        {/* Tabbed Content - Only show when transcript exists */}
        {session.transcript && (
          <Tabs value={activeTab} onValueChange={setActiveTab} variant="default">
            <TabsList className="w-full">
              <TabsTrigger value="plans" className="flex-1">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Treatment Plans
                {plans.length > 0 && (
                  <Badge variant="dusk" size="sm" className="ml-2">
                    {plans.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="transcript" className="flex-1">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                Transcript
              </TabsTrigger>
            </TabsList>

            {/* Treatment Plans Tab */}
            <TabsContent value="plans">
              {plans.length > 0 ? (
                <DataTable data={plans} columns={planColumns} keyExtractor={(plan) => plan.id} />
              ) : (
                <NoPlansEmpty message='Click "Generate Plan" above to create an AI-generated treatment plan from the transcript.' />
              )}
            </TabsContent>

            {/* Transcript Tab */}
            <TabsContent value="transcript">
              <TranscriptPreview
                transcript={session.transcript || undefined}
                audioFilePath={session.audioFilePath || undefined}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </DashboardLayout>
  );
}
