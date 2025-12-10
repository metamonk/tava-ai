'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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

  const getRiskBadgeClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return '';
    }
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
          <span className="text-gray-600 dark:text-[#9ca3af]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1114]">
      {/* Header */}
      <header className="bg-white dark:bg-[#161a1d] shadow-sm dark:shadow-none dark:border-b dark:border-[#2a2f35]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[#f5f3ef]">
              Therapist Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-[#9ca3af]">Welcome, {user?.name}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowNewSessionModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition-colors flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Session
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-[#d1d5db] bg-white dark:bg-[#161a1d] border border-gray-300 dark:border-[#3d4449] rounded-md hover:bg-gray-50 dark:hover:bg-[#1a1d21] transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Clients List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[#f5f3ef] mb-4">
              Your Clients
            </h2>
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#3d4449] dark:bg-[#1a1d21] dark:text-[#f5f3ef] dark:placeholder-[#6b7280] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
            />
            <div className="space-y-3">
              {filteredClients.length === 0 ? (
                <div className="p-8 bg-white dark:bg-[#161a1d] rounded-lg shadow-sm dark:shadow-none dark:border dark:border-[#2a2f35] text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6b7280]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p className="mt-2 text-gray-500 dark:text-[#9ca3af]">
                    {searchQuery ? 'No clients match your search' : 'No clients yet'}
                  </p>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div
                    key={client.clientId}
                    onClick={() => router.push(`/therapist/clients/${client.clientId}`)}
                    className="p-4 bg-white dark:bg-[#161a1d] rounded-lg shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none cursor-pointer transition-shadow border border-gray-100 dark:border-[#2a2f35] dark:hover:border-[#3d4449]"
                  >
                    <div className="font-semibold text-gray-900 dark:text-[#f5f3ef]">
                      {client.clientName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-[#9ca3af]">
                      {client.clientEmail}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Sessions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[#f5f3ef] mb-4">
              Recent Sessions
            </h2>
            <div className="space-y-3">
              {!dashboardData?.recentSessions.length ? (
                <div className="p-8 bg-white dark:bg-[#161a1d] rounded-lg shadow-sm dark:shadow-none dark:border dark:border-[#2a2f35] text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6b7280]"
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
                  <p className="mt-2 text-gray-500 dark:text-[#9ca3af]">No sessions yet</p>
                  <button
                    onClick={() => setShowNewSessionModal(true)}
                    className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    Create your first session
                  </button>
                </div>
              ) : (
                dashboardData.recentSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => router.push(`/therapist/sessions/${session.id}`)}
                    className="p-4 bg-white dark:bg-[#161a1d] rounded-lg shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none cursor-pointer transition-shadow border border-gray-100 dark:border-[#2a2f35] dark:hover:border-[#3d4449]"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-[#f5f3ef]">
                          {session.clientName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-[#9ca3af]">
                          {new Date(session.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {session.riskLevel !== 'none' && (
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskBadgeClass(session.riskLevel)}`}
                          >
                            {session.riskLevel.toUpperCase()}
                          </span>
                        )}
                        {session.hasPlan && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Plan Created
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* New Session Modal */}
      {showNewSessionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-50"
              onClick={() => setShowNewSessionModal(false)}
            />
            <div className="relative bg-white dark:bg-[#161a1d] rounded-lg shadow-xl dark:shadow-none dark:border dark:border-[#2a2f35] max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f5f3ef] mb-4">
                Create New Session
              </h3>
              <form onSubmit={handleCreateSession}>
                <div className="mb-4">
                  <label
                    htmlFor="clientId"
                    className="block text-sm font-medium text-gray-700 dark:text-[#d1d5db] mb-1"
                  >
                    Client ID
                  </label>
                  <input
                    type="text"
                    id="clientId"
                    value={newClientId}
                    onChange={(e) => setNewClientId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#3d4449] dark:bg-[#1a1d21] dark:text-[#f5f3ef] dark:placeholder-[#6b7280] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter client ID"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-[#9ca3af]">
                    Enter the unique identifier for the client.
                  </p>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowNewSessionModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-[#d1d5db] bg-white dark:bg-[#161a1d] border border-gray-300 dark:border-[#3d4449] rounded-md hover:bg-gray-50 dark:hover:bg-[#1a1d21]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center gap-2"
                  >
                    {creating && (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
                    )}
                    Create Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
