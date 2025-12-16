import { forwardRef, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    helperText?: string;
    error?: string;
    fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className = '', label, helperText, error, fullWidth = true, id, rows = 4, ...props }, ref) => {
        const textareaId = id || props.name || Math.random().toString(36).slice(2);

        return (
            <div className={`${fullWidth ? 'w-full' : ''}`}>
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="mb-1.5 block font-body text-sm font-medium text-[var(--foreground)]"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    rows={rows}
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
            resize-y min-h-[100px]
            ${error ? 'border-[var(--accent)]' : 'border-[var(--border)]'}
            ${className}
          `}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
                    {...props}
                />
                {error && (
                    <p
                        id={`${textareaId}-error`}
                        className="mt-1.5 text-sm text-[var(--accent)]"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={`${textareaId}-helper`} className="mt-1.5 text-sm text-[var(--muted)]">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export { Textarea };
