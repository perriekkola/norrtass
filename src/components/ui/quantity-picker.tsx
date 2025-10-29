'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface QuantityPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export function QuantityPicker({
  value,
  onChange,
  min = 1,
  max = 100,
  disabled = false,
  className = '',
}: QuantityPickerProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min;
    onChange(Math.min(Math.max(min, newValue), max));
  };

  const handleDecrement = () => {
    onChange(Math.max(min, value - 1));
  };

  const handleIncrement = () => {
    onChange(Math.min(value + 1, max));
  };

  return (
    <div className={cn('flex h-10 w-32 rounded-md border', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="aspect-square h-auto rounded-r-none border-r !p-0"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        className="h-auto w-full [appearance:textfield] rounded-none border-0 text-center text-sm focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <Button
        variant="ghost"
        size="sm"
        className="aspect-square h-auto rounded-l-none border-l !p-0"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
