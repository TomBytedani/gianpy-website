import { forwardRef, type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'bordered';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            className = '',
            variant = 'default',
            padding = 'md',
            hoverable = false,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
      bg-[var(--background)] overflow-hidden
      transition-all duration-[var(--transition-normal)]
    `;

        const variants = {
            default: `
        border border-[var(--border)] rounded-[var(--radius-md)]
        shadow-[var(--shadow-soft)]
      `,
            elevated: `
        border border-[var(--border)] rounded-[var(--radius-md)]
        shadow-[var(--shadow-card)]
      `,
            bordered: `
        border-2 border-[var(--primary)] rounded-[var(--radius-md)]
      `,
        };

        const paddings = {
            none: '',
            sm: 'p-3',
            md: 'p-5',
            lg: 'p-8',
        };

        const hoverStyles = hoverable
            ? 'cursor-pointer hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1'
            : '';

        return (
            <div
                ref={ref}
                className={`
          ${baseStyles}
          ${variants[variant]}
          ${paddings[padding]}
          ${hoverStyles}
          ${className}
        `}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

// Card Header sub-component
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className = '', children, ...props }, ref) => (
        <div
            ref={ref}
            className={`mb-4 border-b border-[var(--border)] pb-4 ${className}`}
            {...props}
        >
            {children}
        </div>
    )
);

CardHeader.displayName = 'CardHeader';

// Card Title sub-component
const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className = '', children, ...props }, ref) => (
        <h3
            ref={ref}
            className={`font-display text-xl text-[var(--foreground)] ${className}`}
            {...props}
        >
            {children}
        </h3>
    )
);

CardTitle.displayName = 'CardTitle';

// Card Content sub-component
const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className = '', children, ...props }, ref) => (
        <div ref={ref} className={`${className}`} {...props}>
            {children}
        </div>
    )
);

CardContent.displayName = 'CardContent';

// Card Footer sub-component
const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className = '', children, ...props }, ref) => (
        <div
            ref={ref}
            className={`mt-4 flex items-center border-t border-[var(--border)] pt-4 ${className}`}
            {...props}
        >
            {children}
        </div>
    )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
