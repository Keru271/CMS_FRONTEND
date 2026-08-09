'use client';

import React from 'react';

export interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string | false;
  isInvalid?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  variant?: 'flat' | 'bordered' | 'underlined';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  classNames?: {
    inputWrapper?: string;
    input?: string;
  };
  isClearable?: boolean;
  onClear?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      label,
      errorMessage,
      isInvalid,
      startContent,
      endContent,
      variant = 'flat',
      className = '',
      classNames,
      isClearable,
      onClear,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            {label}
          </label>
        )}
        <div
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm transition-all border ${
            isInvalid
              ? 'border-danger bg-danger/10 text-danger focus-within:ring-2 focus-within:ring-danger/20'
              : 'border-input-border bg-input-bg text-foreground focus-within:border-input-focus focus-within:ring-2 focus-within:ring-input-focus/20'
          } ${classNames?.inputWrapper || ''}`}
        >
          {startContent && <span className="text-muted-foreground flex items-center shrink-0">{startContent}</span>}
          <input
            ref={ref}
            value={value}
            onChange={onChange}
            className={`w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm font-medium ${
              classNames?.input || ''
            } ${className}`}
            {...props}
          />
          {isClearable && value && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-muted-foreground hover:text-foreground px-1"
            >
              ✕
            </button>
          )}
          {endContent && <span className="text-muted-foreground flex items-center shrink-0">{endContent}</span>}
        </div>
        {isInvalid && errorMessage && (
          <span className="text-[11px] text-danger font-semibold mt-0.5">{errorMessage}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
