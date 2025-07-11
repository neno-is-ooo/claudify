import { TodoStorageInterface as FrontendTodoStorageInterface } from '@/features/todo/storage/types'
import { TodoStorageInterface as BackendTodoStorageInterface } from '@backend/src/features/todos/storage/types'

export type FrontendStorage = {
    todos: FrontendTodoStorageInterface
}

export type BackendStorage = {
    todos: BackendTodoStorageInterface
}
