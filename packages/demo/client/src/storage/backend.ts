import { SupabaseTodoStorage } from '@backend/src/features/todos/storage/supabase'
import { BackendStorage } from './types'
import { SupabaseClient } from '@supabase/supabase-js'

export type BackendStorageDependencies = {
    supabase: SupabaseClient
}

export function createBackendStorage(
    deps: BackendStorageDependencies,
): BackendStorage {
    return {
        todos: new SupabaseTodoStorage(
            deps.supabase,
            async () =>
                (await deps.supabase.auth.getUser()).data.user?.id ?? null,
        ),
    }
}
