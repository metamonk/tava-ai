import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState, {
  NoClientsEmpty,
  NoSessionsEmpty,
  NoPlansEmpty,
  NoPlanHistoryEmpty,
  SearchResultsEmpty,
} from './EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No items" description="There are no items to display." />);

    expect(screen.getByText('No items')).toBeInTheDocument();
    expect(screen.getByText('There are no items to display.')).toBeInTheDocument();
  });

  it('renders default icon when no icon provided', () => {
    const { container } = render(<EmptyState title="Title" description="Description" />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    render(
      <EmptyState
        title="Title"
        description="Description"
        icon={<div data-testid="custom-icon">Custom Icon</div>}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(
      <EmptyState title="Title" description="Description" action={<button>Take Action</button>} />
    );

    expect(screen.getByText('Take Action')).toBeInTheDocument();
  });

  it('does not render action when not provided', () => {
    render(<EmptyState title="Title" description="Description" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('NoClientsEmpty', () => {
  it('renders no clients message', () => {
    render(<NoClientsEmpty />);

    expect(screen.getByText('No clients yet')).toBeInTheDocument();
    expect(screen.getByText(/Start by adding your first client/)).toBeInTheDocument();
  });

  it('renders Add Client button when onAddClient provided', () => {
    render(<NoClientsEmpty onAddClient={() => {}} />);

    expect(screen.getByText('Add Client')).toBeInTheDocument();
  });

  it('does not render button when onAddClient not provided', () => {
    render(<NoClientsEmpty />);

    expect(screen.queryByText('Add Client')).not.toBeInTheDocument();
  });

  it('calls onAddClient when button clicked', () => {
    const handleAddClient = vi.fn();
    render(<NoClientsEmpty onAddClient={handleAddClient} />);

    fireEvent.click(screen.getByText('Add Client'));
    expect(handleAddClient).toHaveBeenCalled();
  });
});

describe('NoSessionsEmpty', () => {
  it('renders no sessions message', () => {
    render(<NoSessionsEmpty />);

    expect(screen.getByText('No sessions yet')).toBeInTheDocument();
    expect(screen.getByText(/Create a new session/)).toBeInTheDocument();
  });

  it('renders Create Session button when onCreateSession provided', () => {
    render(<NoSessionsEmpty onCreateSession={() => {}} />);

    expect(screen.getByText('Create Session')).toBeInTheDocument();
  });

  it('calls onCreateSession when button clicked', () => {
    const handleCreateSession = vi.fn();
    render(<NoSessionsEmpty onCreateSession={handleCreateSession} />);

    fireEvent.click(screen.getByText('Create Session'));
    expect(handleCreateSession).toHaveBeenCalled();
  });
});

describe('NoPlansEmpty', () => {
  it('renders no plans message', () => {
    render(<NoPlansEmpty />);

    expect(screen.getByText('No treatment plan yet')).toBeInTheDocument();
    expect(screen.getByText(/Upload a transcript or audio recording/)).toBeInTheDocument();
  });
});

describe('NoPlanHistoryEmpty', () => {
  it('renders no version history message', () => {
    render(<NoPlanHistoryEmpty />);

    expect(screen.getByText('No version history')).toBeInTheDocument();
    expect(screen.getByText(/Plan versions will appear here/)).toBeInTheDocument();
  });
});

describe('SearchResultsEmpty', () => {
  it('renders no results message with query', () => {
    render(<SearchResultsEmpty query="test search" />);

    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText(/couldn't find any results for "test search"/)).toBeInTheDocument();
  });

  it('includes search query in description', () => {
    render(<SearchResultsEmpty query="John Smith" />);

    expect(screen.getByText(/John Smith/)).toBeInTheDocument();
  });
});
