import { createTestDevice, expectEqual, setupTestLogic } from '@/utils/tests'
import { SettingsLogic } from './settings.logic'

function setupTest() {
    const { services, storage } = createTestDevice()
    const state: { path: string | null } = { path: null }
    const logic = setupTestLogic(
        new SettingsLogic({
            services,
            redirect: (path) => {
                state.path = path
            },
        }),
    )
    return { services, storage, logic, state }
}

describe('IndexScreenLogic', () => {
    it('should do initial load', async () => {
        const { logic } = setupTest()
        await logic.initialize()
        expectEqual(logic.state, {
            isLoggedIn: false,
        })
    })

    it('should toggle dark mode', async () => {
        const { logic, services } = setupTest()
        await logic.initialize()
        expectEqual(await services.theme.getThemeVariant(), 'light')
        await logic.toggleDarkMode()
        expectEqual(await services.theme.getThemeVariant(), 'dark')
        expectEqual(await services.asyncStorage.getItem('theme'), 'dark')
    })
})
