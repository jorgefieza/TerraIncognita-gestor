// src/components/core/StarRating.js
import React from 'react';
import { StarIcon } from './Icons';

const StarRating = ({ rating, setRating, hoverRating, setHoverRating, className = "text-yellow-400" }) => (
    <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
            <StarIcon
                key={star}
                className={`w-5 h-5 cursor-pointer ${className}`}
                solid={star <= (hoverRating || rating)}
                onMouseEnter={() => setHoverRating && setHoverRating(star)}
                onMouseLeave={() => setHoverRating && setHoverRating(0)}
                onClick={() => setRating && setRating(star)}
            />
        ))}
    </div>
);

export default StarRating;