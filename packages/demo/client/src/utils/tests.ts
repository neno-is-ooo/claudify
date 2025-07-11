import { createServices, ServiceCreationDependencies } from '@/services'
import { MemoryAsyncStorage } from '@/services/asyncStorage/memory'
import { DEFAULT_THEME_VARIANT } from '@/theme'
import { createFrontendStorage } from '@/storage/frontend'
import { Logic } from './logic'
import { createBackendStorage } from '@/storage/backend'
import {
    createSupabaseClient,
    SUPABASE_LOCAL_ANON_KEY,
    SUPABASE_LOCAL_URL,
} from '@/supabase'
import { BackendStorage, FrontendStorage } from '@/storage/types'
import { FrontendServices } from '@/services/types'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@backend/src/types/supabase'
import { createResolvable, Resolvable } from './resolvable'

export type TestDeviceDependencies = {
    services?: Partial<ServiceCreationDependencies>
}
export type TestDevice = {
    storage: {
        frontend: FrontendStorage
        backend: BackendStorage
    }
    services: FrontendServices
    supabase: SupabaseClient<Database>
    injectSleep: () => InjectedSleep
}
export type InjectedSleep = {
    miliseconds?: number
    waitUntilCalled: Resolvable<void>
    undo: () => void
}

export function createTestDevice(
    dependencies?: TestDeviceDependencies,
): TestDevice {
    const asyncStorage =
        dependencies?.services?.asyncStorage ?? new MemoryAsyncStorage()
    const supabase = createSupabaseClient(
        SUPABASE_LOCAL_URL,
        SUPABASE_LOCAL_ANON_KEY,
    )
    const storage = {
        frontend: createFrontendStorage({
            asyncStorage,
        }),
        backend: createBackendStorage({
            supabase,
        }),
    }
    const services = createServices({
        asyncStorage,
        supabase,
        getColorScheme:
            dependencies?.services?.getColorScheme ??
            (() => DEFAULT_THEME_VARIANT),
    })
    const injectSleep = () => {
        const origSleep = services.time.sleep
        let wake = createResolvable()
        const sleep: InjectedSleep = {
            waitUntilCalled: createResolvable(),
            undo: () => {
                services.time.sleep = origSleep
                wake.resolve()
            },
        }
        services.time.sleep = async (miliseconds) => {
            sleep.miliseconds = miliseconds
            wake = createResolvable()
            sleep.waitUntilCalled.resolve()
            await wake
        }
        return sleep
    }

    return {
        services,
        storage,
        supabase,
        injectSleep,
    }
}

export async function createTestUser(device: TestDevice, email: string) {
    const { error } = await device.services.auth.signUp(email, 'testtest')
    if (error && error != 'User already registered') {
        throw new Error(error)
    }
}

export async function loginTestUser(device: TestDevice, email: string) {
    await createTestUser(device, email)
    const { error } = await device.services.auth.signIn(email, 'testtest')
    if (error) {
        throw new Error(`Unable to log in test user '${email}': ${error}`)
    }
}

export function setupTestLogic<Deps, State, T extends Logic<Deps, State>>(
    logic: T,
): T {
    let state: State = logic.getInitialState()
    logic.getState = () => state
    logic.setState = (nextState: Partial<State>) => {
        state = { ...state, ...nextState }
    }
    return logic
}

// Little utility to provide type-safety, so you can detect quicker when tests break
export function expectEqual<T>(actual: T, expected: T) {
    expect(actual).toEqual(expected)
}

// Utility to make fails easier to read
export function expectSleepEqual(
    sleep: InjectedSleep,
    miliseconds: number | undefined,
) {
    expect({ miliseconds: sleep.miliseconds }).toEqual({ miliseconds })
}
