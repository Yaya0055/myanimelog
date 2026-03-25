import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, onChange, size = 20, readonly = false }) {
  const stars = 10;

  const handleClick = (value) => {
    if (!readonly && onChange) {
      onChange(value === rating ? 0 : value);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: stars }, (_, i) => {
        const value = i + 1;
        const filled = value <= rating;
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(value)}
            className={`transition-all duration-150 ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-125'
            }`}
          >
            <Star
              size={size}
              className={`transition-colors ${
                filled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-dark-500 hover:text-yellow-400/50'
              }`}
            />
          </button>
        );
      })}
      {rating > 0 && (
        <span className="ml-2 text-sm font-semibold text-yellow-400">{rating}/10</span>
      )}
    </div>
  );
}
