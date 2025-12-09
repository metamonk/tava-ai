'use client';

export type RiskLevel = 'none' | 'low' | 'medium' | 'high';

interface RiskFlagIndicatorProps {
  level: RiskLevel;
  details?: string[];
  className?: string;
}

const InfoIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ShieldIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const AlertCircleIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const config = {
  low: {
    Icon: InfoIcon,
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-800',
    iconColor: 'w-6 h-6 text-blue-600',
    label: 'Low Risk Indicators Detected',
  },
  medium: {
    Icon: ShieldIcon,
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-900',
    iconColor: 'w-6 h-6 text-yellow-600',
    label: 'Medium Risk - Review Required',
  },
  high: {
    Icon: AlertCircleIcon,
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-900',
    iconColor: 'w-6 h-6 text-red-600',
    label: 'HIGH RISK - Immediate Attention Required',
  },
};

export default function RiskFlagIndicator({
  level,
  details,
  className = '',
}: RiskFlagIndicatorProps) {
  if (level === 'none') return null;

  const { Icon, bg, border, text, iconColor, label } = config[level];

  return (
    <div
      className={`${bg} border-2 ${border} rounded-lg p-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className={iconColor} />
        <h3 className={`font-bold text-lg ${text}`}>{label}</h3>
      </div>
      {details && details.length > 0 && (
        <ul className={`ml-9 space-y-1 text-sm ${text}`}>
          {details.map((detail, idx) => (
            <li key={idx}>• {detail}</li>
          ))}
        </ul>
      )}
      {level === 'high' && (
        <p className="ml-9 mt-3 text-sm font-semibold text-red-900">
          Detected: self-harm, suicidal ideation, or harm to others. Contact supervisor or emergency
          services if necessary.
        </p>
      )}
    </div>
  );
}
