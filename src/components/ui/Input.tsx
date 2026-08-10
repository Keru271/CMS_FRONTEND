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
      <div className="flex flex-col gap-1.5 w-full font-sans">
        {label && (
          <label className="text-[11px] font-sans font-medium text-[#191a1b] uppercase tracking-wider flex items-center justify-between">
            {label}
          </label>
        )}
        <div
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all border ${
            isInvalid
              ? 'border-[#ef4444] bg-[#ef4444]/10 text-[#ef4444] focus-within:ring-2 focus-within:ring-[#ef4444]/20'
              : 'border-[#cbd5e0] bg-[#ffffff] text-[#191a1b] focus-within:border-[#cbc2ea] focus-within:ring-2 focus-within:ring-[#cbc2ea]/40'
          } ${classNames?.inputWrapper || ''}`}
        >
          {startContent && <span className="text-[#5e5a5a] flex items-center shrink-0">{startContent}</span>}
          <input
            ref={ref}
            value={value}
            onChange={onChange}
            className={`w-full bg-transparent outline-none text-[#191a1b] placeholder:text-[#beb9b3] text-xs font-sans font-normal ${
              classNames?.input || ''
            } ${className}`}
            {...props}
          />
          {isClearable && value && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-[#5e5a5a] hover:text-[#191a1b] px-1"
            >
              ✕
            </button>
          )}
          {endContent && <span className="text-[#5e5a5a] flex items-center shrink-0">{endContent}</span>}
        </div>
        {isInvalid && errorMessage && (
          <span className="text-[11px] font-sans text-[#ef4444] font-medium mt-0.5">{errorMessage}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
