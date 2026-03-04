import { useCallback } from 'react';
import { useFlagContext } from './FlagProvider';
import type { UseFlagResult, UseFlagOptions, UseVariantOptions } from './types';

/**
 * Hook to check if a feature flag is enabled
 * 
 * @param name - Name of the flag to check
 * @param options - Optional configuration including userId for targeting
 * @returns Object with enabled status and override controls
 * 
 * @example
 * ```tsx
 * const { enabled, setOverride } = useFlag('newDashboard');
 * 
 * if (enabled) {
 *   return <NewDashboard />;
 * }
 * 
 * // Force enable for testing
 * setOverride(true);
 * 
 * // With user targeting
 * const { enabled } = useFlag('newCheckout', { userId: user.id });
 * ```
 */
export function useFlag(name: string, options?: UseFlagOptions): UseFlagResult {
  const { checkFlag, setOverride: contextSetOverride, getOverride } = useFlagContext();

  const enabled = checkFlag(name, options?.userId);
  const override = getOverride(name);
  const hasOverride = override !== null && typeof override === 'boolean';

  const setOverride = useCallback((value: boolean | null) => {
    contextSetOverride(name, value);
  }, [name, contextSetOverride]);

  return {
    enabled,
    setOverride,
    hasOverride,
  };
}

/**
 * Simplified hook that only returns the enabled status
 * 
 * @param name - Name of the flag to check
 * @param options - Optional configuration including userId for targeting
 * @returns Whether the flag is enabled
 * 
 * @example
 * ```tsx
 * const enabled = useFlagEnabled('newDashboard');
 * return enabled ? <NewDashboard /> : <OldDashboard />;
 * 
 * // With user targeting
 * const enabled = useFlagEnabled('newCheckout', { userId: user.id });
 * ```
 */
export function useFlagEnabled(name: string, options?: UseFlagOptions): boolean {
  const { checkFlag } = useFlagContext();
  return checkFlag(name, options?.userId);
}

/**
 * Hook to get the variant for A/B testing flags
 * 
 * @param name - Name of the flag to check
 * @param options - Optional configuration including userId for targeting
 * @returns The variant string or null if no variant is active
 * 
 * @example
 * ```tsx
 * const variant = useVariant('checkoutDesign', { userId: user.id });
 * 
 * if (variant === 'A') return <CheckoutA />;
 * if (variant === 'B') return <CheckoutB />;
 * return <DefaultCheckout />;
 * ```
 */
export function useVariant(name: string, options?: UseVariantOptions): string | null {
  const { getVariant } = useFlagContext();
  return getVariant(name, options?.userId);
}
