import {
    createTestDevice,
    expectEqual,
    expectSleepEqual,
    loginTestUser,
    setupTestLogic,
} from '@/utils/tests'
import { IndexPageLogic } from './index.logic'

async function setupTest(options?: { login?: boolean }) {
    const device = createTestDevice()
    const { services, storage } = device
    if (options?.login) {
        await loginTestUser(device, 'user1@test.com')
    }
    await device.supabase
        .from('todos')
        .delete()
        .eq('user_id', (await services.auth.getCurrentUser())!.id)

    const mockRedirect = () => {}
    const logic = setupTestLogic(
        new IndexPageLogic({
            services,
            storage,
            redirect: mockRedirect as any,
        }),
    )
    return { ...device, logic }
}

describe('IndexScreenLogic', () => {
    it('should do initial load', async () => {
        const { logic } = await setupTest({ login: true })
        await logic.initialize()
        expectEqual(logic.state, {
            loadState: 'success',
            saveState: 'pristine',
            todos: [],
        })
    })

    it('should add a todo item, edit its label, and save it and load it again', async () => {
        const { logic, injectSleep } = await setupTest({ login: true })
        await logic.initialize()
        await logic.addEmptyTodoItem()
        expectEqual(logic.state, {
            loadState: 'success',
            saveState: 'pristine',
            todos: [{ text: '', completed: false }],
        })
        const sleep = injectSleep()
        const editPromise = logic.setTodoItemText(0, 'Buy milk')
        await sleep.waitUntilCalled
        expectSleepEqual(sleep, 500)
        expectEqual(logic.state, {
            loadState: 'success',
            saveState: 'success',
            todos: [{ text: 'Buy milk', completed: false }],
        })
        sleep.undo()
        await editPromise
        expectEqual(logic.state, {
            loadState: 'success',
            saveState: 'pristine',
            todos: [{ text: 'Buy milk', completed: false }],
        })

        logic.setState(logic.getInitialState())
        await logic.initialize()
        expectEqual(logic.state, {
            loadState: 'success',
            saveState: 'pristine',
            todos: [
                expect.objectContaining({ text: 'Buy milk', completed: false }),
            ],
        })
    })
})
