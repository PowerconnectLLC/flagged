import React from 'react';
import { FlagProvider, getBootstrapFlags } from '../src';

/**
 * SSR/Hydration Examples for @flagged/react
 * 
 * NOTE: Some examples contain framework-specific syntax (Astro, Remix)
 * that TypeScript may flag as errors. These are pseudo-code examples
 * showing usage patterns in different frameworks.
 */

/**
 * Example 1: Basic Window Bootstrap
 * 
 * Server injects flags into HTML:
 * <script>window.__FLAGS__ = { newDashboard: true }</script>
 */
export function BasicBootstrapExample() {
  return (
    <FlagProvider bootstrapFrom="window">
      <App />
    </FlagProvider>
  );
}

/**
 * Example 2: Next.js App Router (SSR)
 * 
 * Use this pattern in your root layout
 */
export function NextJsAppRouterExample({ flags }: { flags: any }) {
  return (
    <html>
      <head>
        {/* Inject flags before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__FLAGS__ = ${JSON.stringify(flags)};`,
          }}
        />
      </head>
      <body>
        <FlagProvider bootstrapFrom="window">
          <App />
        </FlagProvider>
      </body>
    </html>
  );
}

/**
 * Example 3: Next.js Pages Router (SSR)
 */
export function NextJsPagesRouterExample() {
  // In _document.tsx
  return (
    <html>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__FLAGS__ = ${JSON.stringify({
              newFeature: true,
              experimentalUI: { rollout: 50 }
            })};`,
          }}
        />
      </head>
      <body>
        {/* In _app.tsx */}
        <FlagProvider bootstrapFrom="window">
          <App />
        </FlagProvider>
      </body>
    </html>
  );
}

/**
 * Example 4: Remix SSR
 */
export function RemixExample() {
  // In root.tsx
  const flags = {
    newDashboard: true,
    checkoutV2: { rollout: 25 }
  };

  return (
    <html>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__FLAGS__ = ${JSON.stringify(flags)};`,
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

/**
 * Example 5: Bootstrap with Fallback
 * 
 * Use bootstrap flags if available, otherwise load from remote
 */
export function BootstrapWithFallbackExample() {
  return (
    <FlagProvider
      bootstrapFrom="window"
      src="/api/flags"
      refreshInterval={300000}
    >
      <App />
    </FlagProvider>
  );
}

/**
 * Example 6: Manual Bootstrap Check
 * 
 * Programmatically check for bootstrap flags
 */
export function ManualBootstrapExample() {
  const bootstrapFlags = getBootstrapFlags();

  if (bootstrapFlags) {
    console.log('Using bootstrap flags:', bootstrapFlags);
  }

  return (
    <FlagProvider flags={bootstrapFlags || {}}>
      <App />
    </FlagProvider>
  );
}

/**
 * Example 7: Astro SSR
 */
export function AstroExample() {
  // In your Astro layout
  const flags = {
    darkMode: true,
    betaFeatures: false
  };

  return (
    <html>
      <head>
        {/* @ts-ignore - Astro-specific attribute */}
        <script is:inline dangerouslySetInnerHTML={{
          __html: `window.__FLAGS__ = ${JSON.stringify(flags)};`
        }} />
      </head>
      <body>
        {/* @ts-ignore - Astro-specific attribute */}
        <FlagProvider bootstrapFrom="window" client:load>
          <slot />
        </FlagProvider>
      </body>
    </html>
  );
}

/**
 * Example 8: Server Component Pattern (Next.js 13+)
 */
export async function ServerComponentExample() {
  // Server Component
  const flags = await fetchFlagsFromDatabase();

  return (
    <>
      {/* Inject into HTML */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__FLAGS__ = ${JSON.stringify(flags)};`,
        }}
      />
      
      {/* Client Component will bootstrap from window */}
      <ClientWrapper />
    </>
  );
}

function ClientWrapper() {
  'use client';
  return (
    <FlagProvider bootstrapFrom="window">
      <App />
    </FlagProvider>
  );
}

/**
 * Example 9: Edge Runtime (Vercel, Cloudflare Workers)
 */
export function EdgeRuntimeExample({ flags }: { flags: any }) {
  return (
    <html>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__FLAGS__ = ${JSON.stringify(flags)};`,
          }}
        />
      </head>
      <body>
        <FlagProvider bootstrapFrom="window">
          <App />
        </FlagProvider>
      </body>
    </html>
  );
}

/**
 * Example 10: Streaming SSR (React 18)
 */
export function StreamingSSRExample({ flags }: { flags: any }) {
  return (
    <html>
      <head>
        {/* Inject flags early in the stream */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__FLAGS__ = ${JSON.stringify(flags)};`,
          }}
        />
      </head>
      <body>
        <FlagProvider bootstrapFrom="window">
          <React.Suspense fallback={<Loading />}>
            <App />
          </React.Suspense>
        </FlagProvider>
      </body>
    </html>
  );
}

/**
 * Example 11: Hybrid - Bootstrap + Remote Refresh
 * 
 * Best of both worlds:
 * - Bootstrap from window for instant hydration
 * - Fetch fresh flags after mount
 * - Auto-refresh in background
 */
export function HybridExample() {
  return (
    <FlagProvider
      bootstrapFrom="window"
      src="/api/flags"
      refreshInterval={60000}
    >
      <App />
    </FlagProvider>
  );
}

/**
 * Server-side helper for Next.js API route
 */
export async function getFlagsFromAPI() {
  // Example API route: /api/flags
  const response = await fetch('https://your-api.com/flags');
  return response.json();
}

/**
 * Server-side helper for Next.js getServerSideProps
 */
export async function getServerSideProps() {
  const flags = await fetchFlagsFromDatabase();
  
  return {
    props: {
      flags,
    },
  };
}

// Helper functions
async function fetchFlagsFromDatabase() {
  // Your database logic here
  return {
    newFeature: true,
    experimentalUI: { rollout: 25 }
  };
}

function App() {
  return <div>App Content</div>;
}

function Loading() {
  return <div>Loading...</div>;
}

function Outlet() {
  return <div>Outlet</div>;
}

/**
 * TypeScript Declaration for window.__FLAGS__
 * 
 * Add this to your global.d.ts or env.d.ts:
 */
declare global {
  interface Window {
    __FLAGS__?: Record<string, any>;
  }
}

export {};
