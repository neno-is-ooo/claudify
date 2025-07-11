import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@backend/src/types/supabase'
import { AuthServiceInterface } from './types'

export class SupabaseAuthService implements AuthServiceInterface {
    private supabase: SupabaseClient<Database>

    constructor(supabase: SupabaseClient<Database>) {
        this.supabase = supabase
    }

    /**
     * Sign up a new user
     */
    signUp = async (
        email: string,
        password: string,
    ): Promise<{ success: boolean; error?: string }> => {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true }
    }

    /**
     * Sign in an existing user
     */
    signIn = async (
        email: string,
        password: string,
    ): Promise<{ success: boolean; error?: string }> => {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true }
    }

    /**
     * Sign out the current user
     */
    signOut = async (): Promise<void> => {
        await this.supabase.auth.signOut()
    }

    /**
     * Get the current authenticated user
     */
    getCurrentUser = async (): Promise<{
        id: string
        email: string
    } | null> => {
        const { data, error } = await this.supabase.auth.getUser()

        if (error || !data.user) {
            return null
        }

        return {
            id: data.user.id,
            email: data.user.email || '',
        }
    }
}
