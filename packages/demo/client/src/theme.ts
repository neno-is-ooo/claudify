export type ThemeVariant = 'light' | 'dark'

// Define the exact shape of color sections
export type ColorSection = {
    foreground: string
    background: string
}

// Define the exact theme structure with no additional properties allowed
export type Theme = {
    variant: ThemeVariant
    primary: ColorSection
    secondary: ColorSection
    accent: ColorSection
}

export const THEME_VARIANTS: { [Key in ThemeVariant]: Theme } = {
    light: {
        variant: 'light',
        primary: {
            foreground: '#000',
            background: '#FFF',
        },
        secondary: {
            foreground: '#333',
            background: '#F0F0F0',
        },
        accent: {
            foreground: '#FFF',
            background: '#0066CC',
        },
    },
    dark: {
        variant: 'dark',
        primary: {
            foreground: '#FFF',
            background: '#000',
        },
        secondary: {
            foreground: '#DDD',
            background: '#333',
        },
        accent: {
            foreground: '#FFF',
            background: '#0099FF',
        },
    },
}

export const DEFAULT_THEME_VARIANT: ThemeVariant = 'light'
