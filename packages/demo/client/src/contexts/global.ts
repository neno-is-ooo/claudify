import { createContext } from 'react'
import type { FrontendStorage, BackendStorage } from '@/storage/types'
import type { FrontendServices } from '@/services/types'

export type GlobalContextObject = {
    storage: {
        frontend: FrontendStorage
        backend: BackendStorage
    }
    services: FrontendServices
}

export const GlobalContext = createContext<GlobalContextObject>(null!)
