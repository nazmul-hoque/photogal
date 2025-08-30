import React from 'react';

const LoadingSkeleton = ({ count = 6, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-2xl shadow-soft overflow-hidden animate-pulse">
          {/* Image skeleton */}
          <div className="w-full h-56 bg-gradient-to-br from-neutral-200 to-neutral-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Tags skeleton */}
            <div className="flex space-x-2">
              <div className="h-6 bg-neutral-200 rounded-full w-16 animate-pulse" />
              <div className="h-6 bg-neutral-200 rounded-full w-20 animate-pulse" />
            </div>
            
            {/* Meta skeleton */}
            <div className="flex justify-between">
              <div className="h-4 bg-neutral-200 rounded w-20 animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded w-24 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
