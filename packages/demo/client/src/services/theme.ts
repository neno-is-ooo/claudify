import { ColorSchemeName } from '@/types/theme'
import { ThemeVariant } from '@/theme'
import { AsyncStorageInterface } from './asyncStorage/types'
import { EventEmitter } from '@/utils/events'

/**
 * Service allowing user to manually override theme variant.
 * Use the `useTheme` hook to correctly handle updates and edge cases.
 */
export class ThemeService {
    initialized: Promise<void>
    variant: ThemeVariant | null = null

    onVariantUpdate = new EventEmitter<ThemeVariant | null>()

    constructor(
        public asyncStorage: AsyncStorageInterface,
        public getColorScheme: () => ColorSchemeName,
    ) {
        this.initialized = (async () => {
            const variant = await asyncStorage.getItem('theme')
            if (variant) {
                this.setThemeVariant(variant, false)
            }
        })()
    }

    async getThemeVariant() {
        await this.initialized
        // If the user didn't configure a color scheme explicitly, use the system config
        return this.variant ?? this.getColorScheme()
    }

    async setThemeVariant(variant: ThemeVariant | null, store = true) {
        // Optimistically update UI,
        this.variant = variant
        this.onVariantUpdate.emit(variant)

        // but await this, so if there's an error, we can show the user it's not saved
        if (store) {
            if (variant) {
                await this.asyncStorage.setItem('theme', variant)
            } else {
                await this.asyncStorage.removeItem('theme')
            }
        }
    }
}
