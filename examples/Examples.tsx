import React, { useEffect } from 'react';
import { FlagProvider, useFlag, useFlagEnabled, useVariant, Flag } from '../src';

/**
 * Example 1: Basic usage with static flags
 */
export function BasicExample() {
  return (
    <FlagProvider
      flags={{
        newDashboard: true,
        checkoutV2: false,
        betaFeatures: true,
      }}
    >
      <App />
    </FlagProvider>
  );
}

/**
 * Example 2: Using the useFlag hook
 */
export function DashboardPage() {
  const { enabled } = useFlag('newDashboard');

  if (enabled) {
    return <NewDashboard />;
  }

  return <OldDashboard />;
}

/**
 * Example 3: Using the Flag component
 */
export function CheckoutPage() {
  return (
    <Flag name="checkoutV2" fallback={<OldCheckout />}>
      <NewCheckout />
    </Flag>
  );
}

/**
 * Example 4: Remote flags from CDN
 */
export function RemoteFlagsExample() {
  return (
    <FlagProvider src="https://cdn.myapp.com/flags.json">
      <App />
    </FlagProvider>
  );
}

/**
 * Example 5: Remote flags with auto-refresh (every 5 minutes)
 */
export function PollingExample() {
  return (
    <FlagProvider 
      src="/api/flags"
      refreshInterval={300000}
    >
      <App />
    </FlagProvider>
  );
}

/**
 * Example 6: Using flag overrides for testing
 */
export function FeatureWithOverride() {
  const { enabled, setOverride, hasOverride } = useFlag('experimentalFeature');

  return (
    <div>
      <button onClick={() => setOverride(true)}>Force Enable</button>
      <button onClick={() => setOverride(false)}>Force Disable</button>
      <button onClick={() => setOverride(null)} disabled={!hasOverride}>
        Reset Override
      </button>

      {enabled && <ExperimentalFeature />}
    </div>
  );
}

/**
 * Example 7: A/B Testing with variants
 */
export function ABTestExample({ userId }: { userId: string }) {
  const variant = useVariant('checkoutDesign', { userId });

  // Track which variant user saw
  useEffect(() => {
    if (variant) {
      analytics.track('experiment_view', { 
        experiment: 'checkoutDesign',
        variant 
      });
    }
  }, [variant]);

  if (variant === 'A') return <CheckoutDesignA />;
  if (variant === 'B') return <CheckoutDesignB />;
  if (variant === 'C') return <CheckoutDesignC />;
  return <DefaultCheckout />;
}

/**
 * Example 8: User-targeted rollout
 */
export function TargetedRolloutExample({ user }: { user: User }) {
  // 20% of users will see this
  const { enabled } = useFlag('newFeature', { userId: user.id });

  return (
    <div>
      {enabled ? <NewFeature /> : <CurrentFeature />}
    </div>
  );
}

/**
 * Example 9: Beta features for specific users
 */
export function BetaFeaturesExample({ user }: { user: User }) {
  // Set flag override for beta users
  useEffect(() => {
    if (user.isBetaTester) {
      localStorage.setItem('flag:betaFeatures', 'true');
    }
  }, [user.isBetaTester]);

  return (
    <Flag name="betaFeatures">
      <BetaPanel />
    </Flag>
  );
}

/**
 * Example 10: Environment-based flags
 */
export function EnvironmentExample() {
  return (
    <FlagProvider
      flags={{
        debugTools: {
          env: ['development', 'staging'],
        },
        premiumFeatures: {
          env: ['production'],
          rollout: 50,
        },
      }}
      environment={process.env.NODE_ENV}
    >
      <App />
    </FlagProvider>
  );
}

/**
 * Example 11: Time-based flags (seasonal features)
 */
export function SeasonalFlagExample() {
  return (
    <FlagProvider
      flags={{
        holidayTheme: {
          enabled: true,
          start: '2026-12-01',
          end: '2026-12-26',
        },
        blackFridaySale: {
          enabled: true,
          start: '2026-11-25T00:00:00Z',
          end: '2026-11-27T23:59:59Z',
        },
      }}
    >
      <App />
    </FlagProvider>
  );
}

/**
 * Example 12: Complex multi-feature rollout
 */
export function ComplexRolloutExample({ userId }: { userId: string }) {
  return (
    <FlagProvider
      flags={{
        // Simple flags
        maintenanceMode: false,
        legacySupport: true,

        // Percentage rollout
        newDesign: {
          rollout: 50,
        },

        // Time-based
        holidayTheme: {
          enabled: true,
          start: '2026-12-01',
          end: '2026-12-26',
        },

        // Environment-based
        debugPanel: {
          env: ['development', 'staging'],
        },

        // A/B test
        checkoutFlow: {
          variants: ['express', 'guided', 'standard'],
          rollout: 100,
        },

        // Gradual rollout with constraints
        premiumFeature: {
          enabled: true,
          rollout: 25,
          start: '2026-01-01',
          env: ['production'],
        },
      }}
      userId={userId}
      environment={process.env.NODE_ENV}
    >
      <App />
    </FlagProvider>
  );
}

/**
 * Example 13: Feature flag with analytics integration
 */
export function AnalyticsIntegrationExample({ userId }: { userId: string }) {
  const { enabled } = useFlag('newCheckout', { userId });
  const variant = useVariant('upsellStrategy', { userId });

  useEffect(() => {
    // Track flag exposure
    analytics.track('feature_flag_exposure', {
      flag: 'newCheckout',
      enabled,
      userId,
    });

    if (variant) {
      analytics.track('variant_exposure', {
        experiment: 'upsellStrategy',
        variant,
        userId,
      });
    }
  }, [enabled, variant, userId]);

  return (
    <div>
      {enabled && <NewCheckout variant={variant} />}
    </div>
  );
}

/**
 * Example 14: Progressive rollout strategy
 */
export function ProgressiveRolloutExample() {
  // Week 1: 5% rollout
  const flags_week1 = {
    redesign: { rollout: 5 },
  };

  // Week 2: 25% rollout (if metrics look good)
  const flags_week2 = {
    redesign: { rollout: 25 },
  };

  // Week 3: 50% rollout
  const flags_week3 = {
    redesign: { rollout: 50 },
  };

  // Week 4: Full rollout
  const flags_week4 = {
    redesign: true,
  };

  return (
    <FlagProvider flags={flags_week1}>
      <App />
    </FlagProvider>
  );
}

/**
 * Example 15: Kill switch pattern
 */
export function KillSwitchExample() {
  return (
    <FlagProvider
      src="/api/flags"
      refreshInterval={10000} // Check every 10 seconds
      flags={{
        // Emergency kill switches
        payments: true, // Can be instantly disabled
        search: true,
        recommendations: true,
      }}
    >
      <App />
    </FlagProvider>
  );
}

// Example flags.json for remote loading
export const exampleFlagsJson = {
  // Simple flags
  newDashboard: true,
  legacyMode: false,

  // Percentage rollouts
  redesign: {
    rollout: 20,
  },

  checkoutV2: {
    enabled: true,
    rollout: 50,
  },

  // Time-based flags
  holidayTheme: {
    enabled: true,
    start: '2026-12-01',
    end: '2026-12-26',
  },

  blackFridaySale: {
    enabled: true,
    start: '2026-11-25T00:00:00Z',
    end: '2026-11-27T23:59:59Z',
    rollout: 100,
  },

  // Environment-based
  debugTools: {
    enabled: true,
    env: ['development', 'staging'],
  },

  productionOnlyFeature: {
    enabled: true,
    env: ['production'],
  },

  // A/B tests
  checkoutFlow: {
    variants: ['express', 'guided', 'standard'],
    rollout: 100,
  },

  pricingDisplay: {
    variants: ['monthly', 'annual', 'lifetime'],
    rollout: 50,
  },

  // Beta features
  experimentalEditor: {
    enabled: true,
    rollout: 5,
  },

  // Kill switches
  problematicFeature: false,
};

// Component stubs
function App() { return <div>App</div>; }
function NewDashboard() { return <div>New Dashboard</div>; }
function OldDashboard() { return <div>Old Dashboard</div>; }
function NewCheckout({ variant }: { variant?: string | null }) { 
  return <div>New Checkout {variant && `(${variant})`}</div>; 
}
function OldCheckout() { return <div>Old Checkout</div>; }
function DefaultCheckout() { return <div>Default Checkout</div>; }
function CheckoutDesignA() { return <div>Checkout Design A</div>; }
function CheckoutDesignB() { return <div>Checkout Design B</div>; }
function CheckoutDesignC() { return <div>Checkout Design C</div>; }
function ExperimentalFeature() { return <div>Experimental Feature</div>; }
function NewFeature() { return <div>New Feature</div>; }
function CurrentFeature() { return <div>Current Feature</div>; }
function BetaPanel() { return <div>Beta Panel</div>; }

interface User {
  id: string;
  isBetaTester: boolean;
}

const analytics = {
  track: (event: string, props: any) => console.log(event, props),
};
