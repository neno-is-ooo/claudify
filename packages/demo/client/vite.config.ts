import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@backend': resolve(__dirname, '../backend'),
        },
    },
    server: {
        port: 3002,
        open: true,
    },
})
