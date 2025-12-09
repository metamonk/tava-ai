'use client';

interface HIPAAPrivacyNoticeProps {
  className?: string;
}

const LockIcon = () => (
  <svg
    className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

export default function HIPAAPrivacyNotice({ className = '' }: HIPAAPrivacyNoticeProps) {
  return (
    <div className={`bg-gray-50 border border-gray-300 rounded-lg p-4 mt-6 ${className}`}>
      <div className="flex items-start gap-3">
        <LockIcon />
        <div className="text-xs text-gray-700 space-y-2">
          <h4 className="font-semibold text-sm">Privacy & Security Notice</h4>
          <p>
            This system is designed to protect health information in compliance with applicable
            privacy regulations. By accessing this system, you acknowledge:
          </p>
          <ul className="list-disc ml-4 space-y-1">
            <li>You are authorized to access protected health information</li>
            <li>You will only use synthetic or de-identified data</li>
            <li>
              Unauthorized access, use, or disclosure may result in civil and criminal penalties
            </li>
            <li>All activities are logged and monitored</li>
          </ul>
          <p className="font-medium">
            If you do not agree to these terms, do not access this system.
          </p>
        </div>
      </div>
    </div>
  );
}
