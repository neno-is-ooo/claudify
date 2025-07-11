import { useEffect, useMemo, useState } from 'react'
import {
    createSupabaseClient,
    SUPABASE_LOCAL_ANON_KEY,
    SUPABASE_LOCAL_URL,
} from '@/supabase'
import { GlobalContext, GlobalContextObject } from '@/contexts/global'
import { createFrontendStorage } from '@/storage/frontend'
import { createBackendStorage } from '@/storage/backend'
import { createServices } from '@/services'
import { WebAsyncStorage } from '@/services/asyncStorage/web'
import { innerUseTheme } from '@/hooks/useTheme'
import { getRoute, navigate } from '@/routes'

// Screens
import IndexPage from '@/screens/index'
import SettingsPage from '@/screens/settings'
import ChatPage from '@/screens/chat'
import { PageNotFound } from '@/screens/not-found'

export default function App() {
    const [href, setHref] = useState(window.location.href)

    useEffect(() => {
        const listener = () => {
            setHref(window.location.href)
        }
        window.addEventListener('pushstate', listener)
        window.addEventListener('popstate', listener)
        return () => {
            window.removeEventListener('pushstate', listener)
            window.removeEventListener('popstate', listener)
        }
    }, [])

    useEffect(() => {
        const listener = (event: Event) => {
            const target = (event.target as HTMLElement).closest('a')
            if (!target) {
                return
            }
            const href = target.getAttribute('href')
            if (!href?.startsWith('/')) {
                return
            }
            event.preventDefault()
            navigate(href)
        }
        document.addEventListener('click', listener)
        return () => {
            document.removeEventListener('click', listener)
        }
    }, [])

    const asyncStorage = new WebAsyncStorage()
    const supabase = useMemo(
        () =>
            createSupabaseClient(
                import.meta.env.VITE_SUPABASE_URL ?? SUPABASE_LOCAL_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY ??
                    SUPABASE_LOCAL_ANON_KEY,
                {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: false,
                    },
                },
            ),
        [],
    )

    const frontendStorage = useMemo(
        () =>
            createFrontendStorage({
                asyncStorage,
            }),
        [],
    )

    const backendStorage = useMemo(
        () =>
            createBackendStorage({
                supabase,
            }),
        [],
    )

    const services = useMemo(
        () =>
            createServices({
                asyncStorage,
                getColorScheme: () => 'light',
                supabase,
            }),
        [],
    )

    const { variant } = innerUseTheme(services)

    const globalContext: GlobalContextObject = {
        storage: {
            frontend: frontendStorage,
            backend: backendStorage,
        },
        services,
    }

    const route = getRoute(new URL(href))

    return (
        <GlobalContext.Provider value={globalContext}>
            <div className={`app-container ${variant}`}>
                {route.type === 'home' && <IndexPage />}
                {route.type === 'settings' && <SettingsPage />}
                {route.type === 'chat' && <ChatPage />}
                {route.type === 'not-found' && <PageNotFound />}
            </div>
        </GlobalContext.Provider>
    )
}
