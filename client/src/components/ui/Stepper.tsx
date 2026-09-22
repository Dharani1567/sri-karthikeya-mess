import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface StepperProps {
  label?: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const Stepper: React.FC<StepperProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 5,
}) => {
  const handleDecrement = () => {
    if (value - step >= min) {
      onChange(value - step);
    } else {
      onChange(min);
    }
  };

  const handleIncrement = () => {
    if (value + step <= max) {
      onChange(value + step);
    } else {
      onChange(max);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      onChange(0);
    } else if (val < min) {
      onChange(min);
    } else if (val > max) {
      onChange(max);
    } else {
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs font-semibold text-brand-red uppercase tracking-wider">{label}</span>}
      <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700 hover:bg-brand-red hover:text-white disabled:opacity-40 disabled:hover:bg-gray-100 disabled:hover:text-gray-700 transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4 stroke-[3]" />
        </button>

        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          className="w-16 text-center text-lg font-bold text-gray-900 focus:outline-none"
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700 hover:bg-brand-red hover:text-white disabled:opacity-40 disabled:hover:bg-gray-100 disabled:hover:text-gray-700 transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
