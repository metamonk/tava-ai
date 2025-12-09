import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBanner, { InlineError, FormErrorSummary } from './ErrorBanner';

describe('ErrorBanner', () => {
  it('renders error message', () => {
    render(<ErrorBanner message="Something went wrong" />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders details when provided', () => {
    render(
      <ErrorBanner
        message="Failed to generate plan"
        details="The AI service is temporarily unavailable."
      />
    );

    expect(screen.getByText('The AI service is temporarily unavailable.')).toBeInTheDocument();
  });

  it('renders error variant by default', () => {
    const { container } = render(<ErrorBanner message="Error" />);

    expect(container.querySelector('[role="alert"]')).toHaveClass('bg-red-50', 'border-red-200');
  });

  it('renders warning variant', () => {
    const { container } = render(<ErrorBanner message="Warning" variant="warning" />);

    expect(container.querySelector('[role="alert"]')).toHaveClass(
      'bg-yellow-50',
      'border-yellow-200'
    );
  });

  it('renders info variant', () => {
    const { container } = render(<ErrorBanner message="Info" variant="info" />);

    expect(container.querySelector('[role="alert"]')).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('shows dismiss button when onDismiss is provided', () => {
    render(<ErrorBanner message="Error" onDismiss={() => {}} />);

    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('does not show dismiss button when onDismiss is not provided', () => {
    render(<ErrorBanner message="Error" />);

    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  it('calls onDismiss and hides banner when dismiss button clicked', () => {
    const handleDismiss = vi.fn();
    render(<ErrorBanner message="Error" onDismiss={handleDismiss} />);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(handleDismiss).toHaveBeenCalled();
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });

  it('has accessible role and aria-live', () => {
    render(<ErrorBanner message="Error" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });
});

describe('InlineError', () => {
  it('renders error message', () => {
    render(<InlineError message="Field is required" />);

    expect(screen.getByText('Field is required')).toBeInTheDocument();
  });

  it('has role alert', () => {
    render(<InlineError message="Error" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<InlineError message="Error" className="custom-class" />);

    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });

  it('has error text styling', () => {
    render(<InlineError message="Error" />);

    expect(screen.getByRole('alert')).toHaveClass('text-red-600');
  });
});

describe('FormErrorSummary', () => {
  it('renders nothing when errors array is empty', () => {
    const { container } = render(<FormErrorSummary errors={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders default title', () => {
    render(<FormErrorSummary errors={['Error 1']} />);

    expect(screen.getByText('Please fix the following errors:')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<FormErrorSummary errors={['Error 1']} title="Validation failed" />);

    expect(screen.getByText('Validation failed')).toBeInTheDocument();
  });

  it('renders all error messages', () => {
    render(
      <FormErrorSummary errors={['Email is required', 'Password is too short', 'Invalid date']} />
    );

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is too short')).toBeInTheDocument();
    expect(screen.getByText('Invalid date')).toBeInTheDocument();
  });

  it('has role alert', () => {
    render(<FormErrorSummary errors={['Error']} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
