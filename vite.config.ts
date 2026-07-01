import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const repositoryName = env.GITHUB_REPOSITORY?.split('/')[1];
  const githubPagesBase = repositoryName ? `/${repositoryName}/` : '/';

  return {
    plugins: [react()],
    base: env.GITHUB_ACTIONS ? githubPagesBase : '/',
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      setupFiles: ['./vitest.setup.ts'],
      globals: true
    }
  };
});
