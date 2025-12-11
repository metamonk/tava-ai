'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Button,
  Card,
  Badge,
  SearchInput,
  LoadingSpinner,
  ErrorBanner,
  Modal,
  NoClientsEmpty,
  NoSessionsEmpty,
} from '@/components/ui';
import {
  DashboardLayout,
  DashboardHeader,
  DashboardMain,
  DashboardTitle,
  RiskBadge,
} from '@/components/dashboard';

interface Client {
  clientId: string;
  clientName: string;
  clientEmail: string;
}

interface RecentSession {
  id: string;
  date: string;
  clientId: string;
  clientName: string;
  riskLevel: string;
  hasPlan: string | null;
}

interface DashboardData {
  clients: Client[];
  allClients: Client[]; // All available clients for session creation
  recentSessions: RecentSession[];
}

export default function TherapistDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newClientId, setNewClientId] = useState('');
  const [creating, setCreating] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboard();
    }
  }, [authLoading, user]);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/dashboard/therapist`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch(`${apiUrl}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: newClientId }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create session');
      }

      const data = await response.json();
      setShowNewSessionModal(false);
      setNewClientId('');
      router.push(`/therapist/sessions/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Filter clients based on search query
  const filteredClients =
    dashboardData?.clients.filter(
      (client) =>
        client.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.clientEmail.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (authLoading || loading) {
    return (
      <DashboardLayout className="flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader>
        <DashboardTitle
          title="Therapist Dashboard"
          subtitle={`Welcome, ${user?.name}`}
          actions={
            <>
              <Button onClick={() => setShowNewSessionModal(true)} leftIcon={<PlusIcon />}>
                New Session
              </Button>
              <Button variant="secondary" onClick={handleLogout}>
                Sign out
              </Button>
            </>
          }
        />
      </DashboardHeader>

      <DashboardMain>
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} className="mb-6" />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Clients List */}
          <div>
            <h2 className="text-xl font-semibold text-[#1a1d21] dark:text-[#f5f3ef] mb-4">
              Your Clients
            </h2>
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="mb-4"
            />
            <div className="space-y-3">
              {filteredClients.length === 0 ? (
                <NoClientsEmpty
                  message={searchQuery ? 'No clients match your search' : undefined}
                />
              ) : (
                filteredClients.map((client) => (
                  <Card
                    key={client.clientId}
                    variant="interactive"
                    padding="md"
                    onClick={() => router.push(`/therapist/clients/${client.clientId}`)}
                    className="cursor-pointer"
                  >
                    <div className="font-semibold text-[#1a1d21] dark:text-[#f5f3ef]">
                      {client.clientName}
                    </div>
                    <div className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
                      {client.clientEmail}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Recent Sessions */}
          <div>
            <h2 className="text-xl font-semibold text-[#1a1d21] dark:text-[#f5f3ef] mb-4">
              Recent Sessions
            </h2>
            <div className="space-y-3">
              {!dashboardData?.recentSessions.length ? (
                <NoSessionsEmpty
                  actionLabel="Create your first session"
                  onAction={() => setShowNewSessionModal(true)}
                />
              ) : (
                dashboardData.recentSessions.map((session) => (
                  <Card
                    key={session.id}
                    variant="interactive"
                    padding="md"
                    onClick={() => router.push(`/therapist/sessions/${session.id}`)}
                    className="cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-[#1a1d21] dark:text-[#f5f3ef]">
                          {session.clientName}
                        </div>
                        <div className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
                          {new Date(session.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {session.riskLevel !== 'none' && (
                          <RiskBadge level={session.riskLevel as 'low' | 'medium' | 'high'} />
                        )}
                        {session.hasPlan && (
                          <Badge variant="sage" size="sm">
                            Plan Created
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </DashboardMain>

      {/* New Session Modal */}
      <Modal
        isOpen={showNewSessionModal}
        onClose={() => setShowNewSessionModal(false)}
        title="Create New Session"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNewSessionModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="new-session-form"
              isLoading={creating}
              loadingText="Creating..."
              disabled={!newClientId || dashboardData?.allClients.length === 0}
            >
              Create Session
            </Button>
          </>
        }
      >
        <form id="new-session-form" onSubmit={handleCreateSession}>
          <div>
            <label
              htmlFor="clientId"
              className="block text-sm font-medium text-[#3d4449] dark:text-[#d1d5db] mb-1"
            >
              Select Client
            </label>
            {dashboardData?.allClients.length === 0 ? (
              <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] py-2">
                No clients available. Clients need to register an account first.
              </p>
            ) : (
              <select
                id="clientId"
                value={newClientId}
                onChange={(e) => setNewClientId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#d1d5db] dark:border-[#4b5563] rounded-md bg-white dark:bg-[#1f2937] text-[#1a1d21] dark:text-[#f5f3ef] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
              >
                <option value="">Select a client...</option>
                {dashboardData?.allClients.map((client) => (
                  <option key={client.clientId} value={client.clientId}>
                    {client.clientName} ({client.clientEmail})
                  </option>
                ))}
              </select>
            )}
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

// Simple Plus Icon component
function PlusIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
