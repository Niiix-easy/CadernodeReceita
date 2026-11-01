import React from 'react';

export const RecordingWaveform: React.FC = () => (
  <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <div 
        key={i} 
        className="w-1 bg-terracotta animate-pulse rounded-full"
        style={{ 
          height: `${Math.random() * 15 + 5}px`,
          animationDelay: `${i * 0.1}s` 
        }} 
      />
    ))}
  </div>
);
