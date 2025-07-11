/// <reference types="vite/client" />

declare module 'vite'
declare module '@vitejs/plugin-react'
declare module 'vite-tsconfig-paths'
declare module 'path'

// Add global Node.js variables
declare const __dirname: string

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
