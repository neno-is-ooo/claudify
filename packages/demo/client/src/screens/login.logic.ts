import { FrontendServices } from '@/services/types'
import { Logic } from '@/utils/logic'
import { executeTask, TaskState } from '@/utils/tasks'

export type LoginState = {
    isLoggedIn: boolean
    currentUser: { id: string; email: string } | null
    authError: string | null
    email: string
    password: string
    isRegistering: boolean
    loadState: TaskState
    authState: TaskState
}

export type LoginStateDependencies = {
    services: Pick<FrontendServices, 'auth'>
    redirect: (path: '/') => void
}

export class LoginLogic extends Logic<LoginStateDependencies, LoginState> {
    getInitialState = (): LoginState => ({
        isLoggedIn: false,
        currentUser: null,
        authError: null,
        email: '',
        password: '',
        isRegistering: false,
        loadState: 'pristine',
        authState: 'pristine',
    })

    async initialize() {
        await executeTask(this, 'loadState', async () => {
            await this.checkCurrentUser()
        })
    }

    checkCurrentUser = async () => {
        try {
            const user = await this.deps.services.auth.getCurrentUser()
            this.setState({
                isLoggedIn: !!user,
                currentUser: user,
                authError: null,
            })
            if (user) {
                this.deps.redirect('/')
            }
        } catch (error) {
            this.setState({
                isLoggedIn: false,
                currentUser: null,
                authError:
                    error instanceof Error ? error.message : 'Unknown error',
            })
            throw error
        }
    }

    setEmail = (email: string) => {
        this.setState({ email })
    }

    setPassword = (password: string) => {
        this.setState({ password })
    }

    toggleMode = () => {
        this.setState({
            isRegistering: !this.state.isRegistering,
            authError: null,
        })
    }

    signIn = async () => {
        const { email, password } = this.state

        await executeTask(this, 'authState', async () => {
            try {
                const result = await this.deps.services.auth.signIn(
                    email,
                    password,
                )
                if (result.success) {
                    await this.checkCurrentUser()
                } else {
                    this.setState({
                        authError:
                            result.error ?? 'Invalid email and/or password',
                    })
                }
            } catch (error) {
                this.setState({
                    authError:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                })
                throw error
            }
        })
    }

    signUp = async () => {
        const { email, password } = this.state

        await executeTask(this, 'authState', async () => {
            try {
                const result = await this.deps.services.auth.signUp(
                    email,
                    password,
                )
                if (result.success) {
                    await this.checkCurrentUser()
                } else {
                    this.setState({
                        authError: result.error || 'Sign up failed',
                    })
                    throw new Error(result.error || 'Sign up failed')
                }
            } catch (error) {
                this.setState({
                    authError:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                })
                throw error
            }
        })
    }

    handleSubmit = async () => {
        if (this.state.isRegistering) {
            await this.signUp()
        } else {
            await this.signIn()
        }
    }

    handleKeyPress = (key: string) => {
        // If Enter key is pressed, attempt to login/register
        if (key === 'Enter') {
            this.handleSubmit()
        }
    }
}
