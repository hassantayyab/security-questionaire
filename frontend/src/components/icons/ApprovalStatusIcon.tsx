interface ApprovalStatusIconProps {
  approved: number;
  total: number;
  size?: number;
}

/**
 * Displays approval status icon:
 * - Green checkmark circle when all items are approved
 * - Progress circle with percentage when partially approved
 */
export const ApprovalStatusIcon = ({ approved, total, size = 16 }: ApprovalStatusIconProps) => {
  const isComplete = total > 0 && approved === total;
  const percentage = total > 0 ? (approved / total) * 100 : 0;

  if (isComplete) {
    // All approved - show green checkmark
    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width={size}
        height={size}
        viewBox='0 0 16 16'
        fill='none'
        className='text-emerald-500'
      >
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM11.7071 6.70711C12.0976 6.31658 12.0976 5.68342 11.7071 5.29289C11.3166 4.90237 10.6834 4.90237 10.2929 5.29289L7 8.58579L5.70711 7.29289C5.31658 6.90237 4.68342 6.90237 4.29289 7.29289C3.90237 7.68342 3.90237 8.31658 4.29289 8.70711L6.29289 10.7071C6.68342 11.0976 7.31658 11.0976 7.70711 10.7071L11.7071 6.70711Z'
          fill='currentColor'
        />
      </svg>
    );
  }

  // Partially approved - show progress circle
  const circumference = 2 * Math.PI * 6.8; // radius = 6.8 for a 16px circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='transform -rotate-90'
    >
      {/* Background circle */}
      <circle cx='8' cy='8' r='6.8' stroke='#E5E7EB' strokeWidth='2.4' fill='none' />
      {/* Progress circle */}
      {percentage > 0 && (
        <circle
          cx='8'
          cy='8'
          r='6.8'
          stroke='#10B981'
          strokeWidth='2.4'
          fill='none'
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap='round'
          className='transition-all duration-300'
        />
      )}
    </svg>
  );
};
