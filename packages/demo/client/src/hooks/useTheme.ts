import { GlobalContext } from '@/contexts/global'
import { FrontendServices } from '@/services/types'
import { DEFAULT_THEME_VARIANT, THEME_VARIANTS } from '@/theme'
import { useContext, useEffect, useState } from 'react'

export function useTheme() {
    const { services } = useContext(GlobalContext)
    return innerUseTheme(services)
}

export function innerUseTheme(services: FrontendServices) {
    // Only set when a user explicitly toggled the theme
    const [variantOverride, setVariantOverride] = useState(
        services.theme.variant,
    )

    useEffect(() => {
        const unsubscribe = services.theme.onVariantUpdate.listen((variant) =>
            setVariantOverride(variant),
        )

        // This useEffect() is executed after the initial render, so the variantOveride may be
        // out of date by the time we got here because it loaded from asyncStorage in the background
        if (variantOverride != services.theme.variant) {
            setVariantOverride(services.theme.variant)
        }

        return unsubscribe
    }, [])

    // Default in case the color scheme is not loaded yet, is not set and the user didn't configure a color scheme explicitly
    const variant = variantOverride ?? DEFAULT_THEME_VARIANT
    return { variant, theme: THEME_VARIANTS[variant] }
}
