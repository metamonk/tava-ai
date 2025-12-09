import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DisclaimerBanner from './DisclaimerBanner';

describe('DisclaimerBanner', () => {
  it('renders clinical disclaimer by default', () => {
    render(<DisclaimerBanner />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByText(/AI-generated and is not a substitute for clinical judgment/)
    ).toBeInTheDocument();
  });

  it('renders clinical variant explicitly', () => {
    render(<DisclaimerBanner variant="clinical" />);

    expect(
      screen.getByText(/AI-generated and is not a substitute for clinical judgment/)
    ).toBeInTheDocument();
  });

  it('renders data variant', () => {
    render(<DisclaimerBanner variant="data" />);

    expect(screen.getByText(/Only use synthetic or de-identified data/)).toBeInTheDocument();
  });

  it('renders privacy variant', () => {
    render(<DisclaimerBanner variant="privacy" />);

    expect(screen.getByText(/Protected health information/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<DisclaimerBanner className="custom-class" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('custom-class');
  });

  it('has accessible role and aria-live attribute', () => {
    render(<DisclaimerBanner />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });
});
