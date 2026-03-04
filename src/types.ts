import type { ReactNode } from 'react';

/**
 * Simple flag configuration - just a boolean
 */
export type SimpleFlagConfig = boolean;

/**
 * Advanced flag configuration with rollout and time-based controls
 */
export interface AdvancedFlagConfig {
  /** Whether the flag is enabled */
  enabled?: boolean;
  /** Percentage of users who see this flag (0-100) */
  rollout?: number;
  /** ISO date string - flag only enabled after this date */
  start?: string;
  /** ISO date string - flag only enabled before this date */
  end?: string;
  /** List of environments where this flag is enabled */
  env?: string[];
  /** Variants for A/B testing */
  variants?: string[];
}

/**
 * Flag configuration can be either a boolean or an advanced object
 */
export type FlagConfig = SimpleFlagConfig | AdvancedFlagConfig;

/**
 * Collection of flag configurations
 */
export interface FlagsConfig {
  [flagName: string]: FlagConfig;
}

/**
 * Props for the FlagProvider component
 */
export interface FlagProviderProps<T extends FlagsConfig = FlagsConfig> {
  /** Initial flag configuration */
  flags?: T;
  /** URL to fetch remote flag configuration */
  src?: string;
  /** Refresh interval in milliseconds (default: no polling) */
  refreshInterval?: number;
  /** Custom user ID for consistent rollout (defaults to generated/stored ID) */
  userId?: string;
  /** Current environment (e.g., 'development', 'staging', 'production') */
  environment?: string;
  /** Enable dev tools (default: true in development) */
  devTools?: boolean;
  /** Bootstrap flags from window.__FLAGS__ to avoid SSR hydration issues */
  bootstrapFrom?: 'window';
  /** Children components */
  children: ReactNode;
}

/**
 * Props for the Flag component
 */
export interface FlagProps {
  /** Name of the flag to check */
  name: string;
  /** Content to render when flag is enabled */
  children: ReactNode;
  /** Optional fallback content when flag is disabled */
  fallback?: ReactNode;
  /** Optional user ID for rollout targeting */
  userId?: string;
}

/**
 * Options for useFlag hook
 */
export interface UseFlagOptions {
  /** User ID for consistent rollout targeting */
  userId?: string;
}

/**
 * Options for useVariant hook
 */
export interface UseVariantOptions {
  /** User ID for consistent variant assignment */
  userId?: string;
}

/**
 * Return value from useFlag hook
 */
export interface UseFlagResult {
  /** Whether the flag is enabled */
  enabled: boolean;
  /** Force enable/disable the flag locally */
  setOverride: (value: boolean | null) => void;
  /** Check if flag has a local override */
  hasOverride: boolean;
}

/**
 * Context value provided by FlagProvider
 */
export interface FlagContextValue<T extends FlagsConfig = FlagsConfig> {
  flags: T;
  userId: string;
  environment?: string;
  checkFlag: (name: keyof T & string, userId?: string) => boolean;
  getVariant: (name: keyof T & string, userId?: string) => string | null;
  setOverride: (name: keyof T & string, value: boolean | string | null) => void;
  getOverride: (name: keyof T & string) => boolean | string | null;
  refresh: () => Promise<void>;
}
