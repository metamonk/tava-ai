import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RiskFlags, { RiskAlert } from './RiskFlags';

describe('RiskFlags', () => {
  it('renders nothing for none risk level', () => {
    const { container } = render(<RiskFlags riskLevel="none" />);

    expect(container.firstChild).toBeNull();
  });

  it('renders low risk indicator with correct styling', () => {
    render(<RiskFlags riskLevel="low" />);

    expect(screen.getByText('Low Risk')).toBeInTheDocument();
    expect(screen.getByText('Low Risk')).toHaveClass('text-blue-600');
  });

  it('renders medium risk indicator with correct styling', () => {
    render(<RiskFlags riskLevel="medium" />);

    expect(screen.getByText('Medium Risk')).toBeInTheDocument();
    expect(screen.getByText('Medium Risk')).toHaveClass('text-yellow-600');
  });

  it('renders high risk indicator with correct styling', () => {
    render(<RiskFlags riskLevel="high" />);

    expect(screen.getByText('High Risk')).toBeInTheDocument();
    expect(screen.getByText('High Risk')).toHaveClass('text-red-600');
  });

  it('hides label when showLabel is false', () => {
    render(<RiskFlags riskLevel="high" showLabel={false} />);

    expect(screen.queryByText('High Risk')).not.toBeInTheDocument();
  });

  it('applies small size classes', () => {
    render(<RiskFlags riskLevel="medium" size="sm" />);

    expect(screen.getByText('Medium Risk')).toHaveClass('text-xs');
  });

  it('applies medium size classes by default', () => {
    render(<RiskFlags riskLevel="medium" />);

    expect(screen.getByText('Medium Risk')).toHaveClass('text-sm');
  });

  it('applies large size classes', () => {
    render(<RiskFlags riskLevel="medium" size="lg" />);

    expect(screen.getByText('Medium Risk')).toHaveClass('text-base');
  });

  it('applies custom className', () => {
    const { container } = render(<RiskFlags riskLevel="high" className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('RiskAlert', () => {
  it('renders nothing for none risk level', () => {
    const { container } = render(<RiskAlert riskLevel="none" />);

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing for low risk level', () => {
    const { container } = render(<RiskAlert riskLevel="low" />);

    expect(container.firstChild).toBeNull();
  });

  it('renders alert for medium risk level', () => {
    render(<RiskAlert riskLevel="medium" />);

    expect(screen.getByText('Elevated Risk Content Detected')).toBeInTheDocument();
    expect(screen.getByText(/content that may require additional attention/)).toBeInTheDocument();
  });

  it('renders alert for high risk level', () => {
    render(<RiskAlert riskLevel="high" />);

    expect(screen.getByText('High Risk Content Detected')).toBeInTheDocument();
    expect(
      screen.getByText(/flagged as high risk.*self-harm, suicidal ideation, or violence/)
    ).toBeInTheDocument();
  });

  it('includes AI disclaimer in alerts', () => {
    render(<RiskAlert riskLevel="high" />);

    expect(screen.getByText(/AI-based risk detection is a supportive tool/)).toBeInTheDocument();
  });

  it('uses red styling for high risk', () => {
    const { container } = render(<RiskAlert riskLevel="high" />);

    expect(container.firstChild).toHaveClass('bg-red-50');
    expect(container.firstChild).toHaveClass('border-red-200');
  });

  it('uses yellow styling for medium risk', () => {
    const { container } = render(<RiskAlert riskLevel="medium" />);

    expect(container.firstChild).toHaveClass('bg-yellow-50');
    expect(container.firstChild).toHaveClass('border-yellow-200');
  });
});
