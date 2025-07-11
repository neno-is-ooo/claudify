export type Route = HomeRoute | SettingsRoute | ChatRoute | NotFoundRoute

export type HomeRoute = { type: 'home' }
export type SettingsRoute = { type: 'settings' }
export type ChatRoute = { type: 'chat' }
export type NotFoundRoute = { type: 'not-found' }

const ROUTES: { [pathname: string]: Route } = {
    '/': { type: 'chat' }, // Default to chat page
    '/home': { type: 'home' },
    '/settings': { type: 'settings' },
    '/chat': { type: 'chat' },
}

export function getRoute(url: URL): Route {
    const { pathname } = url
    const route = ROUTES[pathname]

    if (route) {
        return route
    }

    return { type: 'not-found' }
}

export function navigate(url: string) {
    history.pushState({}, '', url)
    window.dispatchEvent(new Event('pushstate'))
}
