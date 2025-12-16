import { forwardRef, type HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'sold' | 'reserved' | 'coming-soon';
    size?: 'sm' | 'md' | 'lg';
    /** Use script font (Pinyon Script) for emotional keywords like "Venduto", "Pezzo Unico" */
    useScript?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className = '', variant = 'default', size = 'md', useScript = false, children, ...props }, ref) => {
        const baseStyles = `
      inline-flex items-center justify-center
      font-medium rounded-full
      transition-colors duration-[var(--transition-fast)]
    `;

        const variants = {
            default: 'bg-[var(--background-alt)] text-[var(--foreground)] border border-[var(--border)]',
            primary: 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20',
            accent: 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20',
            success: 'bg-green-50 text-green-700 border border-green-200',
            warning: 'bg-amber-50 text-amber-700 border border-amber-200',
            // Status badges for products
            sold: 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30',
            reserved: 'bg-amber-50 text-amber-700 border border-amber-300',
            'coming-soon': 'bg-blue-50 text-blue-700 border border-blue-200',
        };

        const sizes = {
            sm: 'px-2 py-0.5 text-xs',
            md: 'px-3 py-1 text-sm',
            lg: 'px-4 py-1.5 text-base',
        };

        // Script font styling for emotional keywords
        const fontStyle = useScript
            ? 'font-script text-lg'
            : 'font-body uppercase tracking-wide';

        return (
            <span
                ref={ref}
                className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fontStyle}
          ${className}
        `}
                {...props}
            >
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';

export { Badge };
