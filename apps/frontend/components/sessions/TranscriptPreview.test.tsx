import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TranscriptPreview from './TranscriptPreview';

describe('TranscriptPreview', () => {
  it('shows empty state when no transcript and no audio', () => {
    render(<TranscriptPreview />);

    expect(screen.getByText('No transcript available')).toBeInTheDocument();
  });

  it('shows pending state when audio uploaded but no transcript', () => {
    render(<TranscriptPreview audioFilePath="/path/to/audio.wav" />);

    expect(screen.getByText('Audio Uploaded')).toBeInTheDocument();
    expect(screen.getByText(/Transcription is pending/)).toBeInTheDocument();
  });

  it('renders transcript content when available', () => {
    const transcript =
      'This is a test transcript from the therapy session discussing anxiety management.';

    render(<TranscriptPreview transcript={transcript} />);

    expect(screen.getByText('Session Transcript')).toBeInTheDocument();
    expect(screen.getByText(transcript)).toBeInTheDocument();
  });

  it('displays correct word count', () => {
    const transcript = 'One two three four five'; // 5 words

    render(<TranscriptPreview transcript={transcript} />);

    expect(screen.getByText(/5 words/)).toBeInTheDocument();
  });

  it('displays correct character count', () => {
    const transcript = 'Hello world'; // 11 characters

    render(<TranscriptPreview transcript={transcript} />);

    expect(screen.getByText(/11 characters/)).toBeInTheDocument();
  });

  it('formats large word counts with commas', () => {
    // Create a transcript with many words
    const words = Array(1500).fill('word').join(' ');

    render(<TranscriptPreview transcript={words} />);

    expect(screen.getByText(/1,500 words/)).toBeInTheDocument();
  });

  it('handles empty transcript string', () => {
    render(<TranscriptPreview transcript="" />);

    expect(screen.getByText('No transcript available')).toBeInTheDocument();
  });

  it('handles transcript with only whitespace', () => {
    render(<TranscriptPreview transcript="   " />);

    // Should show 0 words
    expect(screen.getByText(/0 words/)).toBeInTheDocument();
  });

  it('prioritizes transcript over audioFilePath display', () => {
    const transcript = 'Session content here';

    render(<TranscriptPreview transcript={transcript} audioFilePath="/path/to/audio.wav" />);

    expect(screen.getByText('Session Transcript')).toBeInTheDocument();
    expect(screen.queryByText('Audio Uploaded')).not.toBeInTheDocument();
  });
});
