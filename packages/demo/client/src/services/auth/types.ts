export interface AuthServiceInterface {
    signUp: (
        email: string,
        password: string,
    ) => Promise<{ success: boolean; error?: string }>
    signIn: (
        email: string,
        password: string,
    ) => Promise<{ success: boolean; error?: string }>
    signOut: () => Promise<void>
    getCurrentUser: () => Promise<{ id: string; email: string } | null>
}
