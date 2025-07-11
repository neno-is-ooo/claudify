import { FrontendServices } from '@/services/types'
import { TodoStorageInterface } from './types'

export type TodoStorageDependencies = {
    services: Pick<FrontendServices, 'asyncStorage'>
}

export class LocalTodoStorage implements TodoStorageInterface {
    constructor(private deps: TodoStorageDependencies) {}

    loadTodos = async () => {
        const todos = await this.deps.services.asyncStorage.getItem('todos')
        return todos ? JSON.parse(todos) : []
    }

    saveTodos: TodoStorageInterface['saveTodos'] = async (todos) => {
        await this.deps.services.asyncStorage.setItem(
            'todos',
            JSON.stringify(todos),
        )
    }
}
