import { forwardRef, type SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    helperText?: string;
    error?: string;
    fullWidth?: boolean;
    options: Array<{ value: string; label: string; disabled?: boolean }>;
    placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className = '',
            label,
            helperText,
            error,
            fullWidth = true,
            options,
            placeholder,
            id,
            ...props
        },
        ref
    ) => {
        const selectId = id || props.name || Math.random().toString(36).slice(2);

        return (
            <div className={`${fullWidth ? 'w-full' : ''}`}>
                {label && (
                    <label
                        htmlFor={selectId}
                        className="mb-1.5 block font-body text-sm font-medium text-[var(--foreground)]"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={`
              w-full py-3 px-4 pr-10
              font-body text-base text-[var(--foreground)]
              bg-[var(--background)]
              border rounded-[var(--radius-sm)]
              transition-all duration-[var(--transition-fast)]
              appearance-none cursor-pointer
              focus:outline-none focus:border-[var(--primary)]
              focus:ring-2 focus:ring-[var(--primary)]/10
              disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[var(--background-alt)]
              ${error ? 'border-[var(--accent)]' : 'border-[var(--border)]'}
              ${className}
            `}
                        aria-invalid={!!error}
                        aria-describedby={
                            error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
                        }
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value} disabled={option.disabled}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg
                            className="h-5 w-5 text-[var(--muted)]"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
                {error && (
                    <p id={`${selectId}-error`} className="mt-1.5 text-sm text-[var(--accent)]" role="alert">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={`${selectId}-helper`} className="mt-1.5 text-sm text-[var(--muted)]">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export { Select };
