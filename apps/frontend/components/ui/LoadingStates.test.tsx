import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  LoadingSpinner,
  LoadingOverlay,
  SkeletonPlanCard,
  SkeletonSessionRow,
  SkeletonClientCard,
  LoadingButton,
} from './LoadingStates';

describe('LoadingSpinner', () => {
  it('renders with default medium size', () => {
    const { container } = render(<LoadingSpinner />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-8', 'w-8');
  });

  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-4', 'w-4');
  });

  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-12', 'w-12');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has accessible label', () => {
    const { container } = render(<LoadingSpinner />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-label', 'Loading');
  });
});

describe('LoadingOverlay', () => {
  it('renders with default message', () => {
    render(<LoadingOverlay />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingOverlay message="Generating treatment plan..." />);

    expect(screen.getByText('Generating treatment plan...')).toBeInTheDocument();
  });

  it('has overlay background', () => {
    const { container } = render(<LoadingOverlay />);

    expect(container.firstChild).toHaveClass('fixed', 'inset-0', 'bg-black', 'bg-opacity-50');
  });
});

describe('SkeletonPlanCard', () => {
  it('renders skeleton elements', () => {
    const { container } = render(<SkeletonPlanCard />);

    const skeletonItems = container.querySelectorAll('.bg-gray-200');
    expect(skeletonItems.length).toBeGreaterThan(0);
  });

  it('has pulse animation', () => {
    const { container } = render(<SkeletonPlanCard />);

    expect(container.firstChild).toHaveClass('animate-pulse');
  });
});

describe('SkeletonSessionRow', () => {
  it('renders skeleton elements', () => {
    const { container } = render(<SkeletonSessionRow />);

    const skeletonItems = container.querySelectorAll('.bg-gray-200');
    expect(skeletonItems.length).toBeGreaterThan(0);
  });
});

describe('SkeletonClientCard', () => {
  it('renders skeleton elements', () => {
    const { container } = render(<SkeletonClientCard />);

    const skeletonItems = container.querySelectorAll('.bg-gray-200');
    expect(skeletonItems.length).toBeGreaterThan(0);
  });
});

describe('LoadingButton', () => {
  it('renders children when not loading', () => {
    render(<LoadingButton isLoading={false}>Submit</LoadingButton>);

    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    const { container } = render(<LoadingButton isLoading={true}>Submit</LoadingButton>);

    const spinner = container.querySelector('svg');
    expect(spinner).toBeInTheDocument();
  });

  it('disables button when loading', () => {
    render(<LoadingButton isLoading={true}>Submit</LoadingButton>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables button when disabled prop is true', () => {
    render(
      <LoadingButton isLoading={false} disabled={true}>
        Submit
      </LoadingButton>
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick when not disabled or loading', () => {
    const handleClick = vi.fn();
    render(
      <LoadingButton isLoading={false} onClick={handleClick}>
        Submit
      </LoadingButton>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('does not call onClick when loading', () => {
    const handleClick = vi.fn();
    render(
      <LoadingButton isLoading={true} onClick={handleClick}>
        Submit
      </LoadingButton>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(
      <LoadingButton isLoading={false} className="custom-class">
        Submit
      </LoadingButton>
    );

    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
