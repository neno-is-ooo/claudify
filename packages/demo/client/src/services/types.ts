import { AsyncStorageInterface } from './asyncStorage/types'
import { FetchServiceInterface } from './fetch'
import { CacheService } from './cache'
import { ThemeService } from './theme'
import { AuthServiceInterface } from './auth/types'
import { TimeService } from './time'

export type FrontendServices = {
    asyncStorage: AsyncStorageInterface
    fetch: FetchServiceInterface
    cache: CacheService
    theme: ThemeService
    auth: AuthServiceInterface
    time: TimeService
}
