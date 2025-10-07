'use client';

interface ApprovalProgressProps {
  approved: number;
  total: number;
  className?: string;
}

const ApprovalProgress = ({ approved, total, className = '' }: ApprovalProgressProps) => {
  // Calculate percentage
  const percentage = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Progress Bar */}
      <div className='relative w-[312px] h-[6px]'>
        {/* Background */}
        <div className='absolute inset-0 bg-gray-200 rounded-full' />

        {/* Progress Fill */}
        <div
          className='absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-300'
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Percentage Text */}
      <p className='text-xs text-gray-600 font-normal whitespace-nowrap'>{percentage}% approved</p>
    </div>
  );
};

export default ApprovalProgress;
