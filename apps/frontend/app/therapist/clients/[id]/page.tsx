'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

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

  const getRiskBadgeClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return '';
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-8">
          <div className="mb-6">
            <Link
              href="/therapist/dashboard"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <div className="p-6 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            href="/therapist/dashboard"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Client header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{clientData.client.name}</h1>
          <p className="text-gray-600 mt-1">{clientData.client.email}</p>
        </div>

        {/* Session history */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Session History</h2>
            <span className="text-sm text-gray-500">
              {clientData.sessions.length} session{clientData.sessions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {clientData.sessions.length === 0 ? (
            <div className="p-8 bg-white rounded-lg shadow-sm text-center">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-2 text-gray-500">No sessions with this client yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientData.sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => router.push(`/therapist/sessions/${session.id}`)}
                  className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow border border-gray-100"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900">
                        Session -{' '}
                        {new Date(session.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      {session.planId && (
                        <div className="text-sm text-gray-600 mt-1">
                          Treatment Plan v{session.planVersion}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {session.riskLevel !== 'none' && (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskBadgeClass(session.riskLevel)}`}
                        >
                          {session.riskLevel.toUpperCase()} RISK
                        </span>
                      )}
                      <svg
                        className="h-5 w-5 text-gray-400"
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
