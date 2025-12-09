'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

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

export default function PlanDetailPage() {
  const params = useParams();
  const planId = params.planId as string;
  const { user, isLoading: authLoading } = useAuth();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'therapist' | 'client'>('therapist');

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan');
    } finally {
      setLoading(false);
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

  if (!plan) {
    return null;
  }

  const therapistPlan = plan.therapistPlan;
  const clientPlan = plan.clientPlan;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/therapist/sessions/${plan.sessionId}`}
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
                  Treatment Plan v{plan.versionNumber}
                </h1>
                <p className="text-sm text-gray-600">
                  Created {new Date(plan.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            {plan.isActive && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-700">
                Active
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('therapist')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'therapist'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Therapist View
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'client'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Client View
          </button>
        </div>

        {activeTab === 'therapist' ? (
          <div className="space-y-6">
            {/* Presenting Concerns */}
            <Section title="Presenting Concerns">
              <ul className="list-disc list-inside space-y-1">
                {therapistPlan.presentingConcerns.map((concern, idx) => (
                  <li key={idx} className="text-gray-700">
                    {concern}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Clinical Impressions */}
            <Section title="Clinical Impressions">
              <p className="text-gray-700 whitespace-pre-wrap">
                {therapistPlan.clinicalImpressions}
              </p>
            </Section>

            {/* Goals */}
            <div className="grid md:grid-cols-2 gap-6">
              <Section title="Short-Term Goals">
                <ul className="list-disc list-inside space-y-1">
                  {therapistPlan.shortTermGoals.map((goal, idx) => (
                    <li key={idx} className="text-gray-700">
                      {goal}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Long-Term Goals">
                <ul className="list-disc list-inside space-y-1">
                  {therapistPlan.longTermGoals.map((goal, idx) => (
                    <li key={idx} className="text-gray-700">
                      {goal}
                    </li>
                  ))}
                </ul>
              </Section>
            </div>

            {/* Interventions */}
            <Section title="Interventions Used">
              <div className="flex flex-wrap gap-2">
                {therapistPlan.interventionsUsed.map((intervention, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {intervention}
                  </span>
                ))}
              </div>
            </Section>

            {/* Homework */}
            <Section title="Homework Assigned">
              <ul className="list-disc list-inside space-y-1">
                {therapistPlan.homework.map((item, idx) => (
                  <li key={idx} className="text-gray-700">
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Strengths */}
            <Section title="Strengths & Protective Factors">
              <ul className="list-disc list-inside space-y-1">
                {therapistPlan.strengths.map((strength, idx) => (
                  <li key={idx} className="text-gray-700">
                    {strength}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Risks */}
            {therapistPlan.risks.length > 0 && (
              <Section title="Risk Assessment" variant="danger">
                <ul className="list-disc list-inside space-y-1">
                  {therapistPlan.risks.map((risk, idx) => (
                    <li key={idx} className="text-red-700">
                      {risk}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Your Progress */}
            <Section title="Your Progress" variant="success">
              <p className="text-gray-700 whitespace-pre-wrap">{clientPlan.yourProgress}</p>
            </Section>

            {/* Goals */}
            <Section title="Goals We Are Working On">
              <ul className="list-disc list-inside space-y-1">
                {clientPlan.goalsWeAreWorkingOn.map((goal, idx) => (
                  <li key={idx} className="text-gray-700">
                    {goal}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Things to Try */}
            <Section title="Things to Try This Week">
              <ul className="space-y-2">
                {clientPlan.thingsToTry.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 text-green-500">
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
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Your Strengths */}
            <Section title="Your Strengths" variant="success">
              <div className="flex flex-wrap gap-2">
                {clientPlan.yourStrengths.map((strength, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </Section>
          </div>
        )}
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
    default: 'bg-gray-50 border-gray-200',
    success: 'bg-green-50 border-green-200',
    danger: 'bg-red-50 border-red-200',
  };

  const titleColors = {
    default: 'text-gray-900',
    success: 'text-green-900',
    danger: 'text-red-900',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className={`px-6 py-3 border-b ${headerColors[variant]}`}>
        <h3 className={`text-sm font-semibold ${titleColors[variant]}`}>{title}</h3>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}
