import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { FlagProviderProps, FlagContextValue, FlagsConfig, AdvancedFlagConfig } from './types';
import { 
  getUserId, 
  hashToPercentage, 
  isDateInRange, 
  getLocalOverride, 
  setLocalOverride,
  getVariantOverride,
  selectVariant,
  isEnvironmentAllowed,
  fetchFlags,
  getBootstrapFlags 
} from './utils';

const FlagContext = createContext<FlagContextValue<any> | null>(null);

export function FlagProvider<T extends FlagsConfig = FlagsConfig>({
  flags: initialFlags = {} as T,
  src,
  refreshInterval,
  userId: customUserId,
  environment,
  bootstrapFrom,
  devTools = typeof process !== 'undefined' && process.env.NODE_ENV === 'development',
  children,
}: FlagProviderProps<T>) {
  // Initialize flags with bootstrap if available, otherwise use provided flags
  const [flags, setFlags] = useState<FlagsConfig>(() => {
    if (bootstrapFrom === 'window') {
      const bootstrapFlags = getBootstrapFlags();
      if (bootstrapFlags) {
        return bootstrapFlags;
      }
    }
    return initialFlags;
  });
  const [userId] = useState(() => getUserId(customUserId));
  const [showDevTools, setShowDevTools] = useState(false);

  // Fetch remote flags
  const fetchRemoteFlags = useCallback(async () => {
    if (!src) return;

    try {
      const remoteFlags = await fetchFlags(src);
      setFlags(remoteFlags);
    } catch (error) {
      console.error('[Flagged] Failed to fetch remote flags:', error);
    }
  }, [src]);

  // Initial fetch
  useEffect(() => {
    if (src) {
      fetchRemoteFlags();
    }
  }, [src, fetchRemoteFlags]);

  // Polling
  useEffect(() => {
    if (!src || !refreshInterval) return;

    const interval = setInterval(fetchRemoteFlags, refreshInterval);
    return () => clearInterval(interval);
  }, [src, refreshInterval, fetchRemoteFlags]);

  // Dev tools keyboard shortcut
  useEffect(() => {
    if (!devTools) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setShowDevTools(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [devTools]);

  const checkFlag = useCallback((name: string, targetUserId?: string): boolean => {
    const effectiveUserId = targetUserId || userId;
    
    // Check for local override first
    const override = getLocalOverride(name);
    if (override !== null) {
      return override;
    }

    const config = flags[name];
    
    // Flag doesn't exist - default to false
    if (config === undefined) {
      return false;
    }

    // Simple boolean flag
    if (typeof config === 'boolean') {
      return config;
    }

    // Advanced flag configuration
    const advancedConfig = config as AdvancedFlagConfig;

    // Check if explicitly disabled
    if (advancedConfig.enabled === false) {
      return false;
    }

    // Check environment
    if (!isEnvironmentAllowed(advancedConfig.env, environment)) {
      return false;
    }

    // Check date range
    if (!isDateInRange(advancedConfig.start, advancedConfig.end)) {
      return false;
    }

    // Check rollout percentage
    if (advancedConfig.rollout !== undefined) {
      const userHash = hashToPercentage(`${name}-${effectiveUserId}`);
      return userHash < advancedConfig.rollout;
    }

    // Default to enabled if no other conditions
    return true;
  }, [flags, userId, environment]);

  const getVariant = useCallback((name: string, targetUserId?: string): string | null => {
    const effectiveUserId = targetUserId || userId;
    
    // Check for local override first
    const override = getVariantOverride(name);
    if (override !== null) {
      return override;
    }

    const config = flags[name];
    
    // Flag doesn't exist or is simple boolean
    if (config === undefined || typeof config === 'boolean') {
      return null;
    }

    const advancedConfig = config as AdvancedFlagConfig;
    
    // No variants configured
    if (!advancedConfig.variants || advancedConfig.variants.length === 0) {
      return null;
    }

    // Check if flag is enabled (environment, date range, etc.)
    if (advancedConfig.enabled === false) {
      return null;
    }

    if (!isEnvironmentAllowed(advancedConfig.env, environment)) {
      return null;
    }

    if (!isDateInRange(advancedConfig.start, advancedConfig.end)) {
      return null;
    }

    // Check rollout percentage for variant access
    if (advancedConfig.rollout !== undefined) {
      const userHash = hashToPercentage(`${name}-${effectiveUserId}`);
      if (userHash >= advancedConfig.rollout) {
        return null;
      }
    }

    // Select variant deterministically
    return selectVariant(advancedConfig.variants, effectiveUserId, name);
  }, [flags, userId, environment]);

  const setOverride = useCallback((name: string, value: boolean | string | null) => {
    setLocalOverride(name, value);
    // Force a re-render by updating state
    setFlags(prev => ({ ...prev }));
  }, []);

  const getOverride = useCallback((name: string): boolean | string | null => {
    const boolOverride = getLocalOverride(name);
    if (boolOverride !== null) return boolOverride;
    
    const variantOverride = getVariantOverride(name);
    return variantOverride;
  }, []);

  const refresh = useCallback(async () => {
    await fetchRemoteFlags();
  }, [fetchRemoteFlags]);

  const contextValue: FlagContextValue<T> = {
    flags: flags as T,
    userId,
    environment,
    checkFlag,
    getVariant,
    setOverride,
    getOverride,
    refresh,
  };

  return (
    <FlagContext.Provider value={contextValue}>
      {children}
      {devTools && showDevTools && (
        <DevToolsPanel 
          flags={flags} 
          checkFlag={checkFlag}
          getVariant={getVariant}
          setOverride={setOverride}
          getOverride={getOverride}
          onClose={() => setShowDevTools(false)}
        />
      )}
    </FlagContext.Provider>
  );
}

export function useFlagContext<T extends FlagsConfig = FlagsConfig>(): FlagContextValue<T> {
  const context = useContext(FlagContext);
  if (!context) {
    throw new Error('useFlagContext must be used within a FlagProvider');
  }
  return context as FlagContextValue<T>;
}

// Dev Tools Panel Component
interface DevToolsPanelProps {
  flags: FlagsConfig;
  checkFlag: (name: string, userId?: string) => boolean;
  getVariant: (name: string, userId?: string) => string | null;
  setOverride: (name: string, value: boolean | string | null) => void;
  getOverride: (name: string) => boolean | string | null;
  onClose: () => void;
}

function DevToolsPanel({ flags, checkFlag, getVariant, setOverride, getOverride, onClose }: DevToolsPanelProps) {
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      zIndex: 999999,
      maxWidth: '600px',
      maxHeight: '80vh',
      overflow: 'auto',
      fontFamily: 'monospace',
      fontSize: '14px',
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #404040',
        paddingBottom: '10px'
      }}>
        <h3 style={{ margin: 0, color: '#4fc3f7' }}>🚩 Feature Flags</h3>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#d4d4d4',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 5px'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '15px' }}>
        Ctrl + Shift + F to toggle
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {Object.keys(flags).map(flagName => {
          const config = flags[flagName];
          const isVariantFlag = typeof config !== 'boolean' && config.variants && config.variants.length > 0;
          const enabled = checkFlag(flagName);
          const variant = getVariant(flagName);
          const override = getOverride(flagName);
          const hasOverride = override !== null;

          return (
            <div
              key={flagName}
              style={{
                padding: '12px',
                backgroundColor: '#2d2d2d',
                borderRadius: '4px',
                border: hasOverride ? '1px solid #4fc3f7' : '1px solid #404040',
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    color: isVariantFlag && variant ? '#ba68c8' : (enabled ? '#a5d6a7' : '#ef5350')
                  }}>
                    {flagName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    {hasOverride && '(overridden) '}
                    {isVariantFlag ? (variant ? `variant: ${variant}` : 'no variant') : (enabled ? 'enabled' : 'disabled')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {isVariantFlag && typeof config !== 'boolean' && config.variants ? (
                    <>
                      {config.variants.map(v => (
                        <button
                          key={v}
                          onClick={() => setOverride(flagName, v)}
                          style={{
                            padding: '4px 12px',
                            backgroundColor: override === v ? '#ba68c8' : '#404040',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          {v}
                        </button>
                      ))}
                      <button
                        onClick={() => setOverride(flagName, null)}
                        disabled={!hasOverride}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: !hasOverride ? '#2d2d2d' : '#404040',
                          color: !hasOverride ? '#666' : '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: hasOverride ? 'pointer' : 'not-allowed',
                          fontSize: '11px'
                        }}
                      >
                        RESET
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setOverride(flagName, true)}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: override === true ? '#4fc3f7' : '#404040',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        ON
                      </button>
                      <button
                        onClick={() => setOverride(flagName, false)}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: override === false ? '#ef5350' : '#404040',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        OFF
                      </button>
                      <button
                        onClick={() => setOverride(flagName, null)}
                        disabled={!hasOverride}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: !hasOverride ? '#2d2d2d' : '#404040',
                          color: !hasOverride ? '#666' : '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: hasOverride ? 'pointer' : 'not-allowed',
                          fontSize: '11px'
                        }}
                      >
                        RESET
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {Object.keys(flags).length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          color: '#888', 
          padding: '40px 20px' 
        }}>
          No flags configured
        </div>
      )}
    </div>
  );
}
