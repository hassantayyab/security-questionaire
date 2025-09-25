import Image from 'next/image';
import Link from 'next/link';

/**
 * Navbar component with Secfix logo on the left
 * Based on Figma design with clean minimal styling
 */
const Navbar = () => {
  return (
    <nav className='bg-zinc-50 border-b border-gray-200'>
      <div className='px-6 py-2'>
        <div className='flex items-center justify-between h-8'>
          {/* Logo on the left */}
          <Link href='/' className='flex items-center'>
            <div className='h-4 w-auto relative'>
              <Image
                src='/secfix-logo.png'
                width={68}
                height={16}
                alt='Secfix'
                className='object-contain'
                priority
              />
            </div>
          </Link>

          {/* Right side placeholder - kept empty as requested */}
          <div className='flex items-center'>
            {/* Empty space where help icon and avatar would go */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
