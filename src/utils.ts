/**
 * Generate a stable user ID for percentage rollouts
 */
export function getUserId(customId?: string): string {
  if (customId) return customId;

  const storageKey = '__flagged_user_id';
  
  if (typeof window !== 'undefined' && window.localStorage) {
    let userId = localStorage.getItem(storageKey);
    if (!userId) {
      userId = generateRandomId();
      localStorage.setItem(storageKey, userId);
    }
    return userId;
  }

  // Fallback for SSR or when localStorage is unavailable
  return generateRandomId();
}

/**
 * Generate a random ID
 */
function generateRandomId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Hash a string to a number between 0 and 99 (for percentage calculations)
 */
export function hashToPercentage(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100;
}

/**
 * Check if a date-based flag is currently active
 */
export function isDateInRange(start?: string, end?: string): boolean {
  const now = new Date();
  
  if (start) {
    const startDate = new Date(start);
    if (now < startDate) return false;
  }
  
  if (end) {
    const endDate = new Date(end);
    if (now > endDate) return false;
  }
  
  return true;
}

/**
 * Local storage key for flag overrides
 */
export function getOverrideKey(flagName: string): string {
  return `flag:${flagName}`;
}

/**
 * Get a flag override from localStorage
 */
export function getLocalOverride(flagName: string): boolean | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  const key = getOverrideKey(flagName);
  const value = localStorage.getItem(key);
  
  if (value === null) return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  return null;
}

/**
 * Set a flag override in localStorage
 */
export function setLocalOverride(flagName: string, value: boolean | string | null): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  const key = getOverrideKey(flagName);
  
  if (value === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, value.toString());
  }
}

/**
 * Get a variant override from localStorage
 */
export function getVariantOverride(flagName: string): string | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  const key = getOverrideKey(flagName);
  const value = localStorage.getItem(key);
  
  // If it's 'true' or 'false', treat as boolean flag, not variant
  if (value === 'true' || value === 'false' || value === null) {
    return null;
  }
  
  return value;
}

/**
 * Select a variant deterministically based on user ID
 */
export function selectVariant(variants: string[], userId: string, flagName: string): string {
  if (variants.length === 0) return '';
  if (variants.length === 1) return variants[0];
  
  const hash = hashToPercentage(`${flagName}-${userId}-variant`);
  const index = hash % variants.length;
  return variants[index];
}

/**
 * Check if current environment matches allowed environments
 */
export function isEnvironmentAllowed(allowedEnvs?: string[], currentEnv?: string): boolean {
  if (!allowedEnvs || allowedEnvs.length === 0) return true;
  if (!currentEnv) return false;
  return allowedEnvs.includes(currentEnv);
}

/**
 * Fetch flags from a remote source
 */
export async function fetchFlags(src: string): Promise<Record<string, any>> {
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`Failed to fetch flags: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get bootstrap flags from window.__FLAGS__
 * This avoids hydration mismatches in SSR scenarios
 */
export function getBootstrapFlags(): Record<string, any> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const flags = (window as any).__FLAGS__;
  return flags && typeof flags === 'object' ? flags : null;
}

/**
 * Clear bootstrap flags from window (optional cleanup)
 */
export function clearBootstrapFlags(): void {
  if (typeof window !== 'undefined') {
    delete (window as any).__FLAGS__;
  }
}
