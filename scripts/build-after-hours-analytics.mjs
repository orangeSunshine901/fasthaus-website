import { build } from 'esbuild';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());
await build({
  entryPoints: ['lib/analytics/after-hours-browser.ts'],
  outfile: 'public/game-test/analytics.js',
  bundle: true, format: 'esm', platform: 'browser', target: ['es2020'],
  minify: true, legalComments: 'eof',
  define: {
    'process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN': JSON.stringify(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? ''),
    'process.env.NEXT_PUBLIC_POSTHOG_HOST': JSON.stringify(process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
});
