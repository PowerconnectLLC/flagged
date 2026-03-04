# Quick Start Guide

## Installation

```bash
npm install @flagged/react
```

## 5-Minute Setup

### Step 1: Wrap your app

```tsx
import { FlagProvider } from '@flagged/react';

function App() {
  return (
    <FlagProvider
      flags={{
        newFeature: true,
        betaUI: { rollout: 20 }
      }}
    >
      <YourApp />
    </FlagProvider>
  );
}
```

### Step 2: Use flags in components

```tsx
import { useFlag, Flag } from '@flagged/react';

// Option 1: Hook
function Feature() {
  const { enabled } = useFlag('newFeature');
  return enabled ? <NewUI /> : <OldUI />;
}

// Option 2: Component
function BetaFeature() {
  return (
    <Flag name="betaUI">
      <BetaUI />
    </Flag>
  );
}
```

### Step 3: Open dev tools

Press **Ctrl+Shift+F** to toggle flags instantly while developing!

## Common Patterns

### Remote Configuration

```tsx
<FlagProvider src="/api/flags" refreshInterval={60000}>
  <App />
</FlagProvider>
```

### User Targeting

```tsx
const { enabled } = useFlag('premium', { userId: user.id });
```

### A/B Testing

```tsx
const variant = useVariant('checkout', { userId: user.id });
if (variant === 'A') return <CheckoutA />;
if (variant === 'B') return <CheckoutB />;
```

### Environment Gating

```json
{
  "debugPanel": {
    "env": ["development", "staging"]
  }
}
```

```tsx
<FlagProvider flags={flags} environment={process.env.NODE_ENV}>
```

## Testing Locally

Force any flag on/off in the browser console:

```js
localStorage.setItem('flag:newFeature', 'true');
localStorage.setItem('flag:newFeature', 'false');
localStorage.setItem('flag:abTest', 'variantB');
```

Or use the dev tools panel (Ctrl+Shift+F)!

## That's It!

See README.md for complete documentation.
