import React from 'react'

export type LoadingSpinnerProps = {
    size?: number
    color: string
}

export function LoadingSpinner({ size = 40, color }: LoadingSpinnerProps) {
    return (
        <>
            <style>
                {`
                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
                `}
            </style>
            <div
                style={{
                    display: 'flex',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <div
                    style={{
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderWidth: size / 10,
                        borderStyle: 'solid',
                        borderColor: color,
                        borderTopColor: 'transparent',
                        animation: 'spin 1s linear infinite',
                    }}
                />
            </div>
        </>
    )
}
