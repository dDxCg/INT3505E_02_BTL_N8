import * as React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  rounded?: 'default' | 'full';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type, rounded = 'default', ...props }, ref) => {
    const roundedClass = rounded === 'full' ? 'rounded-full' : 'rounded-md';

    return (
      <input
        type={type}
        className={`flex h-10 w-full ${roundedClass} border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B2C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
