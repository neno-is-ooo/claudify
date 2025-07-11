import { FrontendStorage } from './types'
import { LocalTodoStorage } from '@/features/todo/storage/local'
import { AsyncStorageInterface } from '@/services/asyncStorage/types'

export type FrontendStorageDependencies = {
    asyncStorage: AsyncStorageInterface
}

export function createFrontendStorage(
    deps: FrontendStorageDependencies,
): FrontendStorage {
    return {
        todos: new LocalTodoStorage({
            services: {
                asyncStorage: deps.asyncStorage,
            },
        }),
    }
}
