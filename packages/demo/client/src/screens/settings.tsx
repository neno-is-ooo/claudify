import React, { useContext } from 'react'
import { useLogic } from '@/hooks/useLogic'
import { GlobalContext } from '@/contexts/global'
import { useTheme } from '@/hooks/useTheme'
import { SettingsLogic } from './settings.logic'
import { navigate } from '@/routes'

export default function SettingsPage() {
    const { services, storage } = useContext(GlobalContext)

    const { logic, state } = useLogic(SettingsLogic, {
        services,
        storage,
        redirect: (path) => navigate(path),
    })

    const { theme, variant } = useTheme()

    return (
        <div
            style={{
                backgroundColor: theme.primary.background,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
            }}
        >
            <header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '30px',
                }}
            >
                <button
                    onClick={() => navigate('/')}
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: theme.primary.foreground,
                    }}
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M19 12H5"
                            stroke={variant === 'dark' ? '#fff' : '#000'}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M12 19L5 12L12 5"
                            stroke={variant === 'dark' ? '#fff' : '#000'}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span style={{ marginLeft: '10px' }}>Back</span>
                </button>
                <h1
                    style={{
                        color: theme.primary.foreground,
                        margin: '0 auto',
                        fontSize: '20px',
                    }}
                >
                    Settings
                </h1>
            </header>

            <main>
                <section
                    style={{
                        marginBottom: '30px',
                    }}
                >
                    <h2
                        style={{
                            color: theme.primary.foreground,
                            fontSize: '18px',
                            marginBottom: '15px',
                        }}
                    >
                        Theme
                    </h2>
                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                        }}
                    >
                        <button
                            onClick={() => logic.setTheme?.('light')}
                            style={{
                                padding: '10px 20px',
                                backgroundColor:
                                    variant === 'light'
                                        ? theme.accent.background
                                        : 'transparent',
                                color:
                                    variant === 'light'
                                        ? theme.accent.foreground
                                        : theme.primary.foreground,
                                border: `1px solid ${variant === 'light' ? theme.accent.background : theme.primary.foreground}`,
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            Light
                        </button>
                        <button
                            onClick={() => logic.setTheme?.('dark')}
                            style={{
                                padding: '10px 20px',
                                backgroundColor:
                                    variant === 'dark'
                                        ? theme.accent.background
                                        : 'transparent',
                                color:
                                    variant === 'dark'
                                        ? theme.accent.foreground
                                        : theme.primary.foreground,
                                border: `1px solid ${variant === 'dark' ? theme.accent.background : theme.primary.foreground}`,
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            Dark
                        </button>
                    </div>
                </section>

                <section>
                    <h2
                        style={{
                            color: theme.primary.foreground,
                            fontSize: '18px',
                            marginBottom: '15px',
                        }}
                    >
                        Account
                    </h2>
                    <button
                        onClick={() => logic.logout?.()}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'transparent',
                            color: 'red',
                            border: '1px solid red',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Logout
                    </button>
                </section>
            </main>
        </div>
    )
}
