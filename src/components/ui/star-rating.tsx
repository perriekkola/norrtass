'use client';

import { FC } from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  rating: number;
  className?: string;
}

/**
 * Star Rating Component with decimal support
 * Displays 1-5 stars with partial fill support for decimal ratings like 4.2
 */
export const StarRating: FC<StarRatingProps> = ({ rating, className }) => {
  const stars = Array.from({ length: 5 }, (_, index) => {
    const fillPercentage = Math.min(Math.max(rating - index, 0), 1) * 100;

    return (
      <div key={index} className="relative h-5 w-5">
        {/* Background star (empty) */}
        <Star className="fill-muted text-muted absolute inset-0 h-5 w-5" />

        {/* Foreground star (filled) with clip path for partial fill */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - fillPercentage}% 0 0)` }}
        >
          <Star className="fill-primary text-primary h-5 w-5" />
        </div>
      </div>
    );
  });

  return <div className={`flex gap-1 ${className || ''}`}>{stars}</div>;
};
