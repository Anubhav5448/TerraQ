"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, type, placeholder, error, ...rest }, ref) => (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5 tracking-wide">
        {label}
      </label>
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        {...rest}
        className={`w-full bg-[#0D1117] border rounded-lg text-sm text-gray-200 placeholder-gray-600 px-3 py-2.5 focus:outline-none transition-colors ${
          error
            ? "border-red-500/60 focus:border-red-400"
            : "border-blue-500/20 focus:border-blue-400"
        }`}
      />
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
    </div>
  )
);

Field.displayName = "Field";

export default Field;