interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

const SkeletonLoader = ({
  width = '100%',
  height = '20px',
  className = '',
  variant = 'rectangular',
}: SkeletonLoaderProps) => {
  const baseClasses = 'relative overflow-hidden bg-gray-200';

  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded',
    circular: 'rounded-full',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    >
      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer' />
    </div>
  );
};

export default SkeletonLoader;
