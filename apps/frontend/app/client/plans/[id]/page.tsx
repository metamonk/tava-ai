'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { DisclaimerBanner } from '@/components/disclaimers';

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
          <span className="text-gray-600">Loading plan...</span>
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

  const clientPlan = parseClientPlan(plan.clientPlanText);

  if (!clientPlan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-yellow-800">Unable to display plan</h3>
            <p className="mt-2 text-yellow-700">There was an issue loading this plan.</p>
            <Link
              href="/client/dashboard"
              className="mt-4 inline-block text-sm font-medium text-yellow-600 hover:text-yellow-800"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">
                Treatment Plan - Version {plan.versionNumber}
              </h1>
              <p className="text-sm text-gray-600">
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
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI-Generated Content Disclaimer */}
        <DisclaimerBanner variant="clinical" className="mb-6" />

        {/* Historical Plan Notice */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-gray-700">
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
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                current plan
              </Link>
              .
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
                <span className="text-green-500 text-xl flex-shrink-0 mt-0.5">&#10003;</span>
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
                <span className="text-orange-500 text-xl flex-shrink-0 mt-0.5">&#8594;</span>
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
                <span className="text-purple-500 text-xl flex-shrink-0 mt-0.5">&#9733;</span>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Back to Dashboard Button */}
        <div className="mt-8 text-center">
          <Link
            href="/client/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
      </main>
    </div>
  );
}
