import React from 'react';

interface PasswordStrengthProps {
  password: string;
}

/**
 * Password strength indicator component with real-time validation feedback.
 *
 * Validates:
 * - Minimum 8 characters
 * - Contains uppercase letter
 * - Contains lowercase letter
 * - Contains number
 */
export default function PasswordStrength({ password }: PasswordStrengthProps) {
  // Calculate password strength
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;

  // Determine strength level
  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  let strengthColor = 'bg-red-500';
  let strengthText = 'Weak';

  if (passedChecks === totalChecks) {
    strength = 'strong';
    strengthColor = 'bg-green-500';
    strengthText = 'Strong';
  } else if (passedChecks >= 3) {
    strength = 'good';
    strengthColor = 'bg-yellow-500';
    strengthText = 'Good';
  } else if (passedChecks >= 2) {
    strength = 'fair';
    strengthColor = 'bg-orange-500';
    strengthText = 'Fair';
  }

  const strengthPercentage = (passedChecks / totalChecks) * 100;

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${strengthColor} transition-all duration-300`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
        <span className="text-xs font-medium text-neutral-600 min-w-[50px]">
          {strengthText}
        </span>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1">
        <RequirementItem
          met={checks.length}
          text="At least 8 characters"
        />
        <RequirementItem
          met={checks.uppercase}
          text="One uppercase letter"
        />
        <RequirementItem
          met={checks.lowercase}
          text="One lowercase letter"
        />
        <RequirementItem
          met={checks.number}
          text="One number"
        />
      </div>
    </div>
  );
}

interface RequirementItemProps {
  met: boolean;
  text: string;
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <div className="flex items-center space-x-2">
      {met ? (
        <svg
          className="h-4 w-4 text-green-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          className="h-4 w-4 text-neutral-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span className={`text-xs ${met ? 'text-green-700' : 'text-neutral-600'}`}>
        {text}
      </span>
    </div>
  );
}
