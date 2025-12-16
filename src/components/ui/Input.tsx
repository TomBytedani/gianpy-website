import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: string;
    fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, helperText, error, fullWidth = true, id, ...props }, ref) => {
        const inputId = id || props.name || Math.random().toString(36).slice(2);

        return (
            <div className={`${fullWidth ? 'w-full' : ''}`}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="mb-1.5 block font-body text-sm font-medium text-[var(--foreground)]"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`
            w-full py-3 px-4
            font-body text-base text-[var(--foreground)]
            bg-[var(--background)] 
            border rounded-[var(--radius-sm)]
            transition-all duration-[var(--transition-fast)]
            placeholder:text-[var(--muted)]
            focus:outline-none focus:border-[var(--primary)]
            focus:ring-2 focus:ring-[var(--primary)]/10
            disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[var(--background-alt)]
            ${error ? 'border-[var(--accent)]' : 'border-[var(--border)]'}
            ${className}
          `}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                    {...props}
                />
                {error && (
                    <p
                        id={`${inputId}-error`}
                        className="mt-1.5 text-sm text-[var(--accent)]"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-[var(--muted)]">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
