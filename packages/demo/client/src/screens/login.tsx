import React, { useContext } from 'react'
import { useLogic } from '@/hooks/useLogic'
import { GlobalContext } from '@/contexts/global'
import { useTheme } from '@/hooks/useTheme'
import { LoginLogic } from './login.logic'
import { navigate } from '@/routes'

export default function LoginPage() {
    const { services } = useContext(GlobalContext)

    const { logic, state } = useLogic(LoginLogic, {
        services,
        redirect: (path) => navigate(path),
    })

    const { theme, variant } = useTheme()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        await logic.handleSubmit?.()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        logic.handleKeyPress(e.key)
    }

    return (
        <div
            style={{
                backgroundColor: theme.primary.background,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
            }}
        >
            <h1
                style={{
                    color: theme.primary.foreground,
                    marginBottom: '30px',
                }}
            >
                {state.isRegistering ? 'Register' : 'Login'}
            </h1>

            <form
                onSubmit={handleLogin}
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                    }}
                >
                    <label
                        htmlFor="email"
                        style={{ color: theme.primary.foreground }}
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={state.email}
                        onChange={(e) => logic.setEmail(e.target.value)}
                        style={{
                            padding: '10px',
                            borderRadius: '5px',
                            border: `1px solid ${theme.primary.foreground}`,
                            backgroundColor: 'transparent',
                            color: theme.primary.foreground,
                        }}
                        required
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                    }}
                >
                    <label
                        htmlFor="password"
                        style={{ color: theme.primary.foreground }}
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={state.password}
                        onChange={(e) => logic.setPassword(e.target.value)}
                        style={{
                            padding: '10px',
                            borderRadius: '5px',
                            border: `1px solid ${theme.primary.foreground}`,
                            backgroundColor: 'transparent',
                            color: theme.primary.foreground,
                        }}
                        required
                        onKeyDown={handleKeyDown}
                    />
                </div>

                {state.authError && (
                    <div style={{ color: 'red', marginTop: '10px' }}>
                        {state.authError}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={state.authState === 'running'}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: theme.accent.background,
                        color: theme.accent.foreground,
                        border: 'none',
                        borderRadius: '5px',
                        cursor:
                            state.authState === 'running'
                                ? 'not-allowed'
                                : 'pointer',
                        opacity: state.authState === 'running' ? 0.7 : 1,
                        marginTop: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    {state.authState === 'running' && (
                        <div
                            className="spinner small"
                            style={{
                                borderColor: `${theme.accent.foreground}20`,
                                borderTopColor: theme.accent.foreground,
                                width: '16px',
                                height: '16px',
                            }}
                        ></div>
                    )}
                    {state.authState === 'running'
                        ? state.isRegistering
                            ? 'Registering...'
                            : 'Logging in...'
                        : state.isRegistering
                          ? 'Register'
                          : 'Login'}
                </button>

                <div
                    style={{
                        marginTop: '20px',
                        textAlign: 'center',
                        color: theme.primary.foreground,
                    }}
                >
                    <span>
                        {state.isRegistering
                            ? 'Already have an account?'
                            : 'Need an account?'}
                    </span>
                    <button
                        type="button"
                        onClick={logic.toggleMode}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: theme.accent.background,
                            cursor: 'pointer',
                            marginLeft: '5px',
                            textDecoration: 'underline',
                        }}
                    >
                        {state.isRegistering ? 'Login' : 'Register'}
                    </button>
                </div>
            </form>
        </div>
    )
}
