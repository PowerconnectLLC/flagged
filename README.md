# @flagged/react

**Feature flags for React apps without infrastructure**

Dead simple feature flags with zero backend required. Perfect for A/B testing, gradual rollouts, and hiding unfinished features.

## ✨ See It In Action

<!-- TODO: Add animated GIF demo here -->
<!-- Recommended: Record a 10-15 second demo showing:
     1. Press Ctrl+Shift+F to open dev tools
     2. Toggle a feature flag ON
     3. UI updates instantly (e.g., old dashboard → new dashboard)
     4. Switch an A/B test variant
     5. UI changes to show variant B
     
     Tools: Use OBS Studio, Loom, or ScreenToGif
     Optimize: Keep under 5MB for fast GitHub loading
     Upload: Save as demo.gif in repo root
     Then replace this comment with: ![Dev Tools Demo](./demo.gif)
-->



## Why?

Stop doing this:

```tsx
const ENABLE_NEW_FEATURE = true; // Change and redeploy 🤮
```

Start doing this:

```tsx
const enabled = useFlag('newFeature'); // Toggle without redeploy ✨
```

## Features

- 🪶 **<5kb** - Tiny bundle size
- 🚀 **Zero dependencies** - Just React
- 📱 **Remote config** - Load flags from JSON endpoints
- 📊 **Percentage rollouts** - Gradual feature releases
- 🎯 **User targeting** - Consistent experience per user
- 🎨 **A/B testing** - Multi-variant support
- 🌍 **Environment-based** - Different flags per environment
- 🔧 **Local overrides** - Force flags on/off for testing
- 🛠️ **Dev tools** - Beautiful UI to manage flags (Ctrl+Shift+F)
- 📦 **TypeScript first** - Full type safety with flag name inference
- ⚡ **React native** - Works with hooks and Context API

## Installation

```bash
npm install @flagged/react
```

## Quick Start

### 1. Basic Usage

```tsx
import { FlagProvider, useFlag, Flag } from '@flagged/react';

function App() {
  return (
    <FlagProvider
      flags={{
        newDashboard: true,
        checkoutV2: false,
      }}
    >
      <MyApp />
    </FlagProvider>
  );
}

// Option 1: Hook
function MyComponent() {
  const { enabled } = useFlag('newDashboard');
  return enabled ? <NewDashboard /> : <OldDashboard />;
}

// Option 2: Component
function MyOtherComponent() {
  return (
    <Flag name="checkoutV2" fallback={<OldCheckout />}>
      <NewCheckout />
    </Flag>
  );
}
```

### 2. Remote Flags

Load flags from any JSON endpoint:

```tsx
<FlagProvider src="https://cdn.myapp.com/flags.json">
  <App />
</FlagProvider>
```

With auto-refresh (every 60 seconds):

```tsx
<FlagProvider src="/api/flags" refreshInterval={60000}>
  <App />
</FlagProvider>
```

### 3. Percentage Rollouts

Roll out features to a percentage of users:

```json
{
  "newDashboard": {
    "rollout": 20
  }
}
```

20% of users will see the new dashboard. Users are assigned consistently using a stable ID.

With user targeting:

```tsx
const { enabled } = useFlag('newCheckout', { userId: user.id });
```

### 4. A/B Testing (Variants)

Test multiple variants:

```json
{
  "checkoutDesign": {
    "variants": ["A", "B", "C"],
    "rollout": 100
  }
}
```

Usage:

```tsx
const variant = useVariant('checkoutDesign', { userId: user.id });

if (variant === 'A') return <CheckoutA />;
if (variant === 'B') return <CheckoutB />;
if (variant === 'C') return <CheckoutC />;
return <DefaultCheckout />;
```

### 5. Environment-Based Flags

Enable features only in specific environments:

```json
{
  "newCheckout": {
    "enabled": true,
    "env": ["staging", "production"]
  }
}
```

Provider usage:

```tsx
<FlagProvider
  flags={flags}
  environment="production"
>
  <App />
</FlagProvider>
```

### 6. SSR & Hydration (No Flicker!)

Avoid hydration mismatches with window bootstrap:

**Server injects flags:**
```html
<script>
  window.__FLAGS__ = { newDashboard: true, checkoutV2: { rollout: 50 } };
</script>
```

**Client bootstraps from window:**
```tsx
<FlagProvider bootstrapFrom="window">
  <App />
</FlagProvider>
```

This eliminates:
- ❌ SSR flicker
- ❌ Hydration errors  
- ❌ Extra network requests
- ✅ Instant flag availability

**Works with:**
- Next.js (App Router & Pages Router)
- Remix
- Astro
- Any SSR framework

## API Reference

### `<FlagProvider>`

```tsx
interface FlagProviderProps<T extends FlagsConfig = FlagsConfig> {
  flags?: T;                    // Initial flags
  src?: string;                 // Remote JSON URL
  refreshInterval?: number;     // Auto-refresh interval (ms)
  userId?: string;              // Custom user ID for rollouts
  environment?: string;         // Current environment
  bootstrapFrom?: 'window';     // Bootstrap from window.__FLAGS__
  devTools?: boolean;           // Enable dev tools (default: true in dev)
  children: React.ReactNode;
}
```

### `useFlag(name, options?)`

```tsx
const { enabled, setOverride, hasOverride } = useFlag('flagName');
const { enabled } = useFlag('flagName', { userId: user.id });
```

### `useFlagEnabled(name, options?)`

```tsx
const enabled = useFlagEnabled('flagName');
const enabled = useFlagEnabled('flagName', { userId: user.id });
```

### `useVariant(name, options?)`

```tsx
const variant = useVariant('abTestFlag', { userId: user.id });
```

### `<Flag>`

```tsx
<Flag name="featureName" fallback={<OldVersion />} userId={user.id}>
  <NewVersion />
</Flag>
```

### Helper Functions

```tsx
import { getBootstrapFlags, clearBootstrapFlags } from '@flagged/react';

// Get flags from window.__FLAGS__
const flags = getBootstrapFlags();

// Clear bootstrap flags (optional cleanup)
clearBootstrapFlags();
```

## SSR & Hydration Examples

### Next.js App Router

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  const flags = await getFlagsFromDatabase();
  
  return (
    <html>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__FLAGS__ = ${JSON.stringify(flags)};`
          }}
        />
      </head>
      <body>
        <FlagProvider bootstrapFrom="window">
          {children}
        </FlagProvider>
      </body>
    </html>
  );
}
```

### Next.js Pages Router

```tsx
// pages/_document.tsx
export default function Document() {
  return (
    <Html>
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__FLAGS__ = ${JSON.stringify({ newFeature: true })};`
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

// pages/_app.tsx
export default function App({ Component, pageProps }) {
  return (
    <FlagProvider bootstrapFrom="window">
      <Component {...pageProps} />
    </FlagProvider>
  );
}
```

### Remix

```tsx
// app/root.tsx
export default function App() {
  const flags = useLoaderData<typeof loader>();
  
  return (
    <html>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__FLAGS__ = ${JSON.stringify(flags)};`
          }}
        />
      </head>
      <body>
        <FlagProvider bootstrapFrom="window">
          <Outlet />
        </FlagProvider>
      </body>
    </html>
  );
}
```

### Astro

```astro
---
const flags = await getFlagsFromCMS();
---
<html>
  <head>
    <script is:inline set:html={`window.__FLAGS__ = ${JSON.stringify(flags)};`} />
  </head>
  <body>
    <FlagProvider bootstrapFrom="window" client:load>
      <slot />
    </FlagProvider>
  </body>
</html>
```

## Local Overrides

Force flags on or off for testing:

```tsx
// In code
const { setOverride } = useFlag('newFeature');
setOverride(true);  // Force on
setOverride(false); // Force off
setOverride(null);  // Remove override

// In console
localStorage.setItem('flag:newFeature', 'true');
localStorage.setItem('flag:abTest', 'variantB');
```

## Dev Tools

Press **Ctrl+Shift+F** to open the dev tools panel for instant flag control.

## Flag Configuration

### Simple Boolean

```json
{ "myFlag": true }
```

### Advanced Configuration

```json
{
  "myFlag": {
    "enabled": true,         // Base enabled state
    "rollout": 50,           // Percentage (0-100)
    "start": "2026-01-01",   // Start date
    "end": "2026-12-31",     // End date
    "env": ["production"],   // Allowed environments
    "variants": ["A", "B"]   // A/B test variants
  }
}
```

## Examples

### Progressive Rollout

```json
// Week 1: 10%
{ "redesign": { "rollout": 10 } }

// Week 2: 50%
{ "redesign": { "rollout": 50 } }

// Week 3: 100%
{ "redesign": true }
```

### A/B Testing with Analytics

```tsx
const variant = useVariant('checkoutFlow', { userId: user.id });

useEffect(() => {
  analytics.track('experiment_view', { 
    experiment: 'checkoutFlow',
    variant: variant || 'control'
  });
}, [variant]);
```

### Environment-Based Features

```tsx
<FlagProvider 
  flags={{ betaFeatures: { env: ['staging'] } }}
  environment={process.env.NODE_ENV}
>
  <App />
</FlagProvider>
```

## Best Practices

1. **Descriptive names**: `newCheckout` not `feature1`
2. **Start small**: Begin rollouts at 5-10%
3. **Monitor metrics**: Track performance as you increase rollout
4. **Clean up**: Remove old flags after full rollout
5. **Use overrides**: Test both states before deploying
6. **Environment filtering**: Test safely in staging first

## License

MIT

---

Built with ❤️ for React developers who want simple feature flags without enterprise overhead.
