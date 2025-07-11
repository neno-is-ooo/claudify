import React from 'react'
import { useTheme } from '../hooks/useTheme'
import { navigate } from '../routes'

export function PageNotFound() {
    const { theme } = useTheme()

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
                    marginBottom: '20px',
                }}
            >
                404 - Page Not Found
            </h1>
            <p
                style={{
                    color: theme.primary.foreground,
                    marginBottom: '30px',
                }}
            >
                The page you are looking for does not exist.
            </p>
            <button
                onClick={() => navigate('/')}
                style={{
                    padding: '10px 20px',
                    backgroundColor: theme.accent.background,
                    color: theme.accent.foreground,
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Go Home
            </button>
        </div>
    )
}
