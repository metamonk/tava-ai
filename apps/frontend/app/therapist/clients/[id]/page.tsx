'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, LoadingSpinner, ErrorBanner, NoSessionsEmpty } from '@/components/ui';
import { DashboardLayout, DashboardMain, BackLink, RiskBadge } from '@/components/dashboard';

interface ClientInfo {
  id: string;
  name: string;
  email: string;
}

interface SessionHistory {
  id: string;
  date: string;
  riskLevel: string;
  planId: string | null;
  planVersion: number | null;
}

interface ClientData {
  client: ClientInfo;
  sessions: SessionHistory[];
}

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!authLoading && user && id) {
      fetchClientData();
    }
  }, [authLoading, user, id]);

  const fetchClientData = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/dashboard/therapist/clients/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Client not found');
        }
        if (response.status === 403) {
          throw new Error('Access denied');
        }
        throw new Error('Failed to fetch client data');
      }

      const data = await response.json();
      setClientData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout className="flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading client..." />
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

  if (!clientData) {
    return null;
  }

  return (
    <DashboardLayout>
      <DashboardMain>
        {/* Back navigation */}
        <BackLink href="/therapist/dashboard" label="Back to Dashboard" />

        {/* Client header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a1d21] dark:text-[#f5f3ef]">
            {clientData.client.name}
          </h1>
          <p className="text-[#6b7280] dark:text-[#9ca3af] mt-1">{clientData.client.email}</p>
        </div>

        {/* Session history */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#1a1d21] dark:text-[#f5f3ef]">
              Session History
            </h2>
            <span className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
              {clientData.sessions.length} session{clientData.sessions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {clientData.sessions.length === 0 ? (
            <NoSessionsEmpty message="No sessions with this client yet" />
          ) : (
            <div className="space-y-3">
              {clientData.sessions.map((session) => (
                <Card
                  key={session.id}
                  variant="interactive"
                  padding="md"
                  onClick={() => router.push(`/therapist/sessions/${session.id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-[#1a1d21] dark:text-[#f5f3ef]">
                        Session -{' '}
                        {new Date(session.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      {session.planId && (
                        <div className="text-sm text-[#6b7280] dark:text-[#9ca3af] mt-1">
                          Treatment Plan v{session.planVersion}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {session.riskLevel !== 'none' && (
                        <RiskBadge level={session.riskLevel as 'low' | 'medium' | 'high'} />
                      )}
                      <svg
                        className="h-5 w-5 text-[#6b7280] dark:text-[#9ca3af]"
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
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardMain>
    </DashboardLayout>
  );
}
