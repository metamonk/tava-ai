'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import HIPAAPrivacyNotice from '@/components/disclaimers/HIPAAPrivacyNotice';
import { Button, Input, InputGroup, Card } from '@/components/ui';
import ErrorBanner from '@/components/ui/ErrorBanner';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);

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
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-[#6b7280] dark:text-[#9ca3af]">
            Or{' '}
            <Link
              href="/signup"
              className="font-medium text-[#c4907a] hover:text-[#a67462] dark:text-[#d4a08a] dark:hover:text-[#c4907a] transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

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

            <InputGroup label="Password" htmlFor="password" required>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </InputGroup>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading || authLoading}
              className="w-full"
            >
              Sign in
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
