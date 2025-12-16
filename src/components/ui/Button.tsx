import { forwardRef, type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className = '',
            variant = 'primary',
            size = 'md',
            isLoading = false,
            fullWidth = false,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
      inline-flex items-center justify-center
      font-body font-medium uppercase tracking-wider
      border rounded-[var(--radius-sm)]
      transition-all duration-[var(--transition-fast)]
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]
      disabled:opacity-60 disabled:cursor-not-allowed
      active:scale-[0.98]
    `;

        const variants = {
            primary: `
        bg-[var(--primary)] text-[var(--background)] border-[var(--primary)]
        hover:bg-[var(--primary-dark)] hover:border-[var(--primary-dark)]
      `,
            secondary: `
        bg-transparent text-[var(--primary)] border-[var(--primary)]
        hover:bg-[var(--primary)] hover:text-[var(--background)]
      `,
            ghost: `
        bg-transparent text-[var(--foreground)] border-transparent
        hover:bg-[var(--background-alt)]
      `,
            accent: `
        bg-[var(--accent)] text-[var(--background)] border-[var(--accent)]
        hover:bg-[var(--accent)]/90
      `,
        };

        const sizes = {
            sm: 'py-2 px-4 text-xs',
            md: 'py-3 px-6 text-sm',
            lg: 'py-4 px-8 text-base',
        };

        return (
            <button
                ref={ref}
                className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <svg
                            className="mr-2 h-4 w-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Loading...
                    </>
                ) : (
                    children
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
