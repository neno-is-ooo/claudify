import { createClient, SupabaseClientOptions } from '@supabase/supabase-js'
import type { Database } from '@backend/src/types/supabase'

// For some reason, using process.env directly here breaks Jest by introducing a dependency on Expo.
// So we get those env vars at the callsite of the client creation.
export const SUPABASE_LOCAL_URL = 'http://localhost:54321'
export const SUPABASE_LOCAL_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export function createSupabaseClient(
    url: string,
    key: string,
    options?: SupabaseClientOptions<'public'>,
) {
    return createClient<Database>(url, key, options)
}
