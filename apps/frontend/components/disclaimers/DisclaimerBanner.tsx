'use client';

interface DisclaimerBannerProps {
  variant?: 'clinical' | 'data' | 'privacy';
  className?: string;
}

const messages = {
  clinical:
    'This content is AI-generated and is not a substitute for clinical judgment. Always review and validate before using in treatment decisions.',
  data: 'Only use synthetic or de-identified data in this system. Never upload real patient information without proper de-identification.',
  privacy:
    'Protected health information. Unauthorized access or disclosure may result in civil and criminal penalties.',
};

const AlertTriangleIcon = () => (
  <svg
    className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

export default function DisclaimerBanner({
  variant = 'clinical',
  className = '',
}: DisclaimerBannerProps) {
  return (
    <div
      className={`flex items-start gap-3 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r ${className}`}
      role="alert"
      aria-live="polite"
    >
      <AlertTriangleIcon />
      <p className="text-sm text-amber-900 font-medium">{messages[variant]}</p>
    </div>
  );
}
