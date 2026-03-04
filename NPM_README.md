# @flagged/react

Feature flags for React apps without infrastructure.

## Installation

```bash
npm install @flagged/react
```

## Quick Start

```tsx
import { FlagProvider, useFlag } from '@flagged/react';

function App() {
  return (
    <FlagProvider flags={{ newFeature: true }}>
      <MyApp />
    </FlagProvider>
  );
}

function MyComponent() {
  const { enabled } = useFlag('newFeature');
  return enabled ? <NewFeature /> : <OldFeature />;
}
```

## Documentation

See the [full README](https://github.com/yourusername/flagged#readme) for complete documentation.

## Features

- 🪶 <5kb bundle size
- 🚀 Zero dependencies
- 📱 Remote config support
- 📊 Percentage rollouts
- 🔧 Local overrides
- 🛠️ Dev tools (Ctrl+Shift+F)
- 📦 TypeScript first

## License

MIT
