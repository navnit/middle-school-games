import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Vitest 2.x types this config through its nested Vite 5 dependency, while
  // the app uses Vite 6 as requested. The plugin object is compatible at
  // runtime, but its Vite 6 type is not assignable to Vitest's Vite 5 type.
  plugins: [react() as never],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true
  }
});
