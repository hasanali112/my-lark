import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 rounded-xl bg-white border border-border-subtle
              text-text-primary placeholder:text-text-secondary/50
              transition-all duration-300 outline-none
              focus:border-primary focus:ring-4 focus:ring-primary/10
              disabled:opacity-50 disabled:bg-gray-50
              ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
