import { ColorSchemeName } from '@/types/theme'
import { AsyncStorageInterface } from './asyncStorage/types'
import { CacheService } from './cache'
import { DefaultFetchInterface } from './fetch'
import { ThemeService } from './theme'
import { FrontendServices } from './types'
import { SupabaseAuthService } from './auth/supabase'
import { SupabaseClient } from '@supabase/supabase-js'
import { TimeService } from './time'

export type ServiceCreationDependencies = {
    asyncStorage: AsyncStorageInterface // TODO: Why pass this in as dep
    supabase: SupabaseClient
    getColorScheme: () => ColorSchemeName
}

export function createServices(
    dependencies: ServiceCreationDependencies,
): FrontendServices {
    const { asyncStorage } = dependencies
    const cache = new CacheService()
    return {
        asyncStorage,
        fetch: new DefaultFetchInterface(),
        cache,
        theme: new ThemeService(asyncStorage, dependencies.getColorScheme),
        auth: new SupabaseAuthService(dependencies.supabase),
        time: new TimeService(),
    }
}
