'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { DisclaimerBanner } from '@/components/disclaimers';
import { Card, LoadingSpinner } from '@/components/ui';
import {
  DashboardLayout,
  DashboardHeader,
  DashboardMain,
  TreatmentPlanCard,
} from '@/components/dashboard';

interface ClientPlan {
  yourProgress: string;
  goalsWeAreWorkingOn: string[];
  thingsToTry: string[];
  yourStrengths: string[];
}

interface Plan {
  id: string;
  clientPlanText: string;
  versionNumber: number;
  createdAt: string;
  sessionDate: string;
  therapistName: string;
}

export default function ClientPlanDetailPage() {
  const params = useParams();
  const planId = params.id as string;
  const { user, isLoading: authLoading } = useAuth();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!authLoading && user && planId) {
      fetchPlan();
    }
  }, [authLoading, user, planId]);

  const fetchPlan = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/dashboard/client/plans/${planId}`, {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan');
    } finally {
      setLoading(false);
    }
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
          <p className="text-[#6b7280] dark:text-[#9ca3af]">Loading plan...</p>
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
              Back to Dashboard
            </Link>
          </Card>
        </DashboardMain>
      </DashboardLayout>
    );
  }

  if (!plan) {
    return null;
  }

  const clientPlan = parseClientPlan(plan.clientPlanText);

  if (!clientPlan) {
    return (
      <DashboardLayout>
        <DashboardMain className="max-w-4xl">
          <Card
            variant="elevated"
            padding="lg"
            className="text-center bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30"
          >
            <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300">
              Unable to display plan
            </h3>
            <p className="mt-2 text-amber-700 dark:text-amber-400">
              There was an issue loading this plan.
            </p>
            <Link
              href="/client/dashboard"
              className="mt-4 inline-block text-sm font-medium text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
            >
              Back to Dashboard
            </Link>
          </Card>
        </DashboardMain>
      </DashboardLayout>
    );
  }

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
              Treatment Plan - Version {plan.versionNumber}
            </h1>
            <p className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
              Created on{' '}
              {new Date(plan.createdAt).toLocaleDateString('en-US', {
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
        {/* AI-Generated Content Disclaimer */}
        <DisclaimerBanner variant="clinical" className="mb-6" />

        {/* Historical Plan Notice */}
        <Card variant="default" padding="md" className="mb-6 bg-[#e8e6e1]/50 dark:bg-[#1a1d21]">
          <div className="flex items-center gap-2 text-[#6b7280] dark:text-[#9ca3af]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm">
              This is a historical version of your treatment plan. View your{' '}
              <Link
                href="/client/dashboard"
                className="text-[#c4907a] hover:text-[#a67462] dark:text-[#d4a08a] dark:hover:text-[#c4907a] font-medium transition-colors"
              >
                current plan
              </Link>
              .
            </span>
          </div>
        </Card>

        {/* Treatment Plan Content */}
        <TreatmentPlanCard plan={mapToTreatmentPlan(clientPlan)} />

        {/* Back to Dashboard Button */}
        <div className="mt-8 text-center">
          <Link
            href="/client/dashboard"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 text-sm font-medium text-white bg-gradient-to-r from-[#c4907a] to-[#a67462] hover:from-[#d4a08a] hover:to-[#b68472] rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to My Dashboard
          </Link>
        </div>
      </DashboardMain>
    </DashboardLayout>
  );
}
