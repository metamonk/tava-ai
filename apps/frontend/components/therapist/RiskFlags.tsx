'use client';

import React from 'react';

export type RiskLevel = 'none' | 'low' | 'medium' | 'high';

interface RiskFlagsProps {
  riskLevel: RiskLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function RiskFlags({
  riskLevel,
  showLabel = true,
  size = 'md',
  className = '',
}: RiskFlagsProps) {
  if (riskLevel === 'none') {
    return null; // Don't show anything for no risk
  }

  const config = {
    low: {
      icon: 'Info',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      label: 'Low Risk',
    },
    medium: {
      icon: 'AlertCircle',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      label: 'Medium Risk',
    },
    high: {
      icon: 'AlertTriangle',
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'High Risk',
    },
  };

  const sizeClasses = {
    sm: { icon: 'h-4 w-4', text: 'text-xs', padding: 'px-2 py-0.5' },
    md: { icon: 'h-5 w-5', text: 'text-sm', padding: 'px-2.5 py-1' },
    lg: { icon: 'h-6 w-6', text: 'text-base', padding: 'px-3 py-1.5' },
  };

  const { icon, color, bg, border, label } = config[riskLevel];
  const { icon: iconSize, text: textSize, padding } = sizeClasses[size];

  const renderIcon = () => {
    if (icon === 'Info') {
      return (
        <svg
          className={`${iconSize} ${color}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    } else if (icon === 'AlertCircle') {
      return (
        <svg
          className={`${iconSize} ${color}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    } else {
      // AlertTriangle
      return (
        <svg
          className={`${iconSize} ${color}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${padding} rounded-full border ${bg} ${border} ${className}`}
    >
      {renderIcon()}
      {showLabel && <span className={`font-medium ${color} ${textSize}`}>{label}</span>}
    </div>
  );
}

interface RiskAlertProps {
  riskLevel: RiskLevel;
}

export function RiskAlert({ riskLevel }: RiskAlertProps) {
  if (riskLevel !== 'high' && riskLevel !== 'medium') {
    return null;
  }

  const isHigh = riskLevel === 'high';

  return (
    <div
      className={`p-4 rounded-lg border ${isHigh ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {isHigh ? (
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${isHigh ? 'text-red-800' : 'text-yellow-800'}`}>
            {isHigh ? 'High Risk Content Detected' : 'Elevated Risk Content Detected'}
          </h3>
          <p className={`mt-1 text-sm ${isHigh ? 'text-red-700' : 'text-yellow-700'}`}>
            {isHigh
              ? 'This session contains content flagged as high risk (self-harm, suicidal ideation, or violence). Please review carefully and follow your clinical protocols for crisis intervention if needed.'
              : 'This session contains content that may require additional attention. Review the transcript for context and clinical significance.'}
          </p>
          <p className={`mt-2 text-xs ${isHigh ? 'text-red-600' : 'text-yellow-600'}`}>
            Note: AI-based risk detection is a supportive tool and should not replace clinical
            judgment. Always assess risk using your professional training and protocols.
          </p>
        </div>
      </div>
    </div>
  );
}
