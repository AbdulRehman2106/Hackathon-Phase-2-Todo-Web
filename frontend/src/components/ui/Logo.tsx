import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function Logo({ className = '', size = 32, showText = true }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
        <Image 
          src="/logo.svg" 
          alt="Todo App Logo" 
          width={size} 
          height={size} 
          className="object-cover"
        />
      </div>
      {showText && (
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
          TodoApp
        </span>
      )}
    </Link>
  );
}
