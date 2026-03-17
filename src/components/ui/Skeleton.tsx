'use client';

import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ 
  width = '100%', 
  height = '1rem', 
  borderRadius = '4px',
  className = '',
  style = {}
}: SkeletonProps) {
  return (
    <div 
      className={`skeleton-pulse ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: 'rgba(255, 255, 255, 0.05)',
        ...style
      }}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number, cols?: number }) {
  return (
    <div style={{ width: '100%', display: 'grid', gap: '1rem' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} width={j === 0 ? '40%' : '15%'} height="1.25rem" />
          ))}
        </div>
      ))}
    </div>
  );
}
