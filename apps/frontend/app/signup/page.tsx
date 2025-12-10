'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import HIPAAPrivacyNotice from '@/components/disclaimers/HIPAAPrivacyNotice';
import { Button, Input, InputGroup, Card } from '@/components/ui';
import ErrorBanner from '@/components/ui/ErrorBanner';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'therapist' | 'client'>('client');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(email, password, name, role);

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        router.push('/');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] dark:bg-[#0f1114] px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-display font-bold text-[#1a1d21] dark:text-[#f5f3ef]">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-[#6b7280] dark:text-[#9ca3af]">
            Or{' '}
            <Link
              href="/login"
              className="font-medium text-[#c4907a] hover:text-[#a67462] dark:text-[#d4a08a] dark:hover:text-[#c4907a] transition-colors"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

            <InputGroup label="Full name" htmlFor="name" required>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </InputGroup>

            <InputGroup label="Email address" htmlFor="email" required>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </InputGroup>

            <InputGroup
              label="Password"
              htmlFor="password"
              required
              helperText="Must be at least 8 characters long"
            >
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </InputGroup>

            <InputGroup label="I am a" htmlFor="role" required>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'therapist' | 'client')}
                className="flex w-full h-11 px-4 text-base font-body text-[#1a1d21] dark:text-[#f5f3ef] bg-white dark:bg-[#161a1d] border border-[#e8e6e1] dark:border-[#2a2f35] rounded-xl transition-all duration-200 focus:outline-none focus:border-[#c4907a] focus:ring-2 focus:ring-[#c4907a]/20"
              >
                <option value="client">Client</option>
                <option value="therapist">Therapist</option>
              </select>
            </InputGroup>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading || authLoading}
              className="w-full"
            >
              Create account
            </Button>
          </form>

          <div className="mt-6">
            <HIPAAPrivacyNotice />
          </div>
        </Card>
      </div>
    </div>
  );
}
