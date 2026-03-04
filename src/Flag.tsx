import React from 'react';
import { useFlagEnabled } from './useFlag';
import type { FlagProps } from './types';

/**
 * Component for conditional rendering based on feature flags
 * 
 * @example
 * ```tsx
 * <Flag name="newDashboard">
 *   <NewDashboard />
 * </Flag>
 * ```
 * 
 * @example With fallback
 * ```tsx
 * <Flag name="checkoutV2" fallback={<OldCheckout />}>
 *   <NewCheckout />
 * </Flag>
 * ```
 * 
 * @example With user targeting
 * ```tsx
 * <Flag name="newCheckout" userId={user.id}>
 *   <NewCheckout />
 * </Flag>
 * ```
 */
export function Flag({ name, children, fallback = null, userId }: FlagProps) {
  const enabled = useFlagEnabled(name, userId ? { userId } : undefined);
  
  if (enabled) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}
