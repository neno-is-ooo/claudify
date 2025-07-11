import { TodoItem } from '@/features/todo/types'

export interface TodoStorageInterface {
    loadTodos: () => Promise<Array<TodoItem>>
    saveTodos: (todos: Array<TodoItem>) => Promise<void>
}
