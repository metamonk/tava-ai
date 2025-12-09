'use client';

interface SyntheticDataNoticeProps {
  className?: string;
}

const DatabaseIcon = () => (
  <svg
    className="w-5 h-5 text-purple-700 flex-shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
    />
  </svg>
);

export default function SyntheticDataNotice({ className = '' }: SyntheticDataNoticeProps) {
  return (
    <div
      className={`sticky top-0 z-10 bg-purple-100 border-b-2 border-purple-400 px-4 py-3 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 max-w-6xl mx-auto">
        <DatabaseIcon />
        <p className="text-sm text-purple-900 font-medium">
          <strong>Synthetic Data Only:</strong> Do not upload real patient data. Use only synthetic,
          de-identified, or anonymized transcripts for testing and demonstration purposes.
        </p>
      </div>
    </div>
  );
}
