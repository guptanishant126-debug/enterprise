import React from 'react';

export const Select = ({
  label,
  error,
  helperText,
  options = [],
  className = '',
  required = false,
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      <select
        id={selectId}
        className={`block w-full rounded-lg bg-slate-900 border text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors px-3.5 py-2.5
          ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-700/80 hover:border-slate-600 focus:border-indigo-500'}
          ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100 py-1">
            {opt.label}
          </option>
        ))}
      </select>

      {error ? (
        <p className="text-xs text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

