import { FrontendServices } from '@/services/types'
import { Logic } from '@/utils/logic'
import { executeTask, TaskState } from '@/utils/tasks'

export type SettingsState = {
    loadState: TaskState
    logoutState: TaskState
    errorMessage: string | null
}

export type SettingsStateDependencies = {
    services: Pick<FrontendServices, 'auth' | 'theme'>
    storage: any
    redirect: (path: '/login') => void
}

export class SettingsLogic extends Logic<
    SettingsStateDependencies,
    SettingsState
> {
    getInitialState = (): SettingsState => ({
        loadState: 'pristine',
        logoutState: 'pristine',
        errorMessage: null,
    })

    async initialize() {
        await executeTask(this, 'loadState', async () => {
            const user = await this.deps.services.auth.getCurrentUser()
            if (!user) {
                this.deps.redirect('/login')
                return
            }
        })
    }

    setTheme = async (variant: 'light' | 'dark') => {
        try {
            this.deps.services.theme.setThemeVariant(variant)
        } catch (error) {
            this.setState({
                errorMessage:
                    error instanceof Error ? error.message : 'Unknown error',
            })
        }
    }

    logout = async () => {
        await executeTask(this, 'logoutState', async () => {
            try {
                await this.deps.services.auth.signOut()
                this.deps.redirect('/login')
            } catch (error) {
                this.setState({
                    errorMessage:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                })
                throw error
            }
        })
    }
}
