// src/components/core/StarRating.js
import React from 'react';
import { StarIcon } from './Icons';

const StarRating = ({ rating, setRating, className = "text-yellow-400" }) => {
    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map(star => (
                <StarIcon
                    key={star}
                    className={`w-5 h-5 cursor-pointer ${className}`}
                    solid={star <= rating}
                    onClick={() => setRating && setRating(star)}
                />
            ))}
        </div>
    );
};

export default StarRating;