import { TodoItem } from '@/features/todo/types'
import { FrontendServices } from '@/services/types'
import { FrontendStorage, BackendStorage } from '@/storage/types'
import { Logic } from '@/utils/logic'
import { executeTask, TaskState } from '@/utils/tasks'
import { trailingDebounce } from '@/utils/time'

export type IndexPageState = {
    loadState: TaskState
    saveState: TaskState
    loadErrorMessage?: string
    todos: Array<TodoItem>
}
export type IndexStateDependencies = {
    services: Pick<FrontendServices, 'theme' | 'cache' | 'auth' | 'time'>
    storage: {
        backend: Pick<BackendStorage, 'todos'>
    }
    redirect: (path: '/login') => void
}

export class IndexPageLogic extends Logic<
    IndexStateDependencies,
    IndexPageState
> {
    saveDebounce = trailingDebounce(500)

    getInitialState = (): IndexPageState => ({
        // TODO: Why method, not property
        loadState: 'pristine',
        saveState: 'pristine',
        todos: [],
    })

    async initialize() {
        // Skip authentication for demo - just load with empty todos
        await executeTask(this, 'loadState', async () => {
            this.setState({ todos: [] })
        })
    }

    async save() {
        await this.saveDebounce(async () => {
            await executeTask(this, 'saveState', async () => {
                await this.deps.storage.backend.todos.saveTodos(
                    this.state.todos,
                )
            })
            await this.deps.services.time.sleep(500)
            this.setState({ saveState: 'pristine' })
        })
    }

    addEmptyTodoItem = async () => {
        this.setState({
            todos: [...this.state.todos, { text: '', completed: false }],
        })
        await this.save()
    }

    removeTodoItem = async (index: number) => {
        const todos = [
            ...this.state.todos.slice(0, index),
            ...this.state.todos.slice(index + 1),
        ]
        this.setState({ todos })
        await this.save()
    }

    setTodoItemText = async (index: number, text: string) => {
        const todos = [...this.state.todos]
        todos[index] = { ...todos[index], text }
        this.setState({ todos })
        await this.save()
    }

    toggleTodoItemCompleted = async (index: number) => {
        const todos = [...this.state.todos]
        todos[index] = { ...todos[index], completed: !todos[index].completed }
        this.setState({ todos })
        await this.save()
    }

    moveTodoItem = async (from: number, to: number) => {
        const todos = [...this.state.todos]
        const todo = todos[from]
        todos.splice(from, 1)
        todos.splice(to, 0, todo)
        this.setState({ todos })
        await this.save()
    }
}
