// components/ui/simple-progress.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SimpleProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;  
}

const SimpleProgress = React.forwardRef<
  HTMLDivElement,
  SimpleProgressProps
>(({ className, value = 0, max = 100, ...props }, ref) => {
  // Garante que o valor não seja menor que 0 ou maior que max
  const progressValue = Math.min(Math.max(value, 0), max);
  const percentage = max > 0 ? (progressValue / max) * 100 : 0;

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={progressValue}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-secondary', // Container principal
        className
      )}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-out" // Barra de progresso interna
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});
SimpleProgress.displayName = 'SimpleProgress';

export { SimpleProgress };