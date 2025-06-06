/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['@testing-library/jest-dom'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            exclude: ['coverage/**'],
            include: ['src/**/*.{ts,tsx}'],
        },
        include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    },
});
