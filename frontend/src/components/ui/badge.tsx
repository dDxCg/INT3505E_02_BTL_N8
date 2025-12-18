import * as React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'secondary';
  children: React.ReactNode;
}

export function Badge({ className = '', variant = 'default', children, ...props }: BadgeProps) {
  const variantClasses = {
    default: 'bg-[#FF6B2C] text-white hover:bg-[#ff5511] border-transparent shadow-sm',
    outline: 'bg-white text-gray-600 hover:bg-gray-50 border-gray-100 shadow-sm',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-transparent',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:ring-offset-2 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
