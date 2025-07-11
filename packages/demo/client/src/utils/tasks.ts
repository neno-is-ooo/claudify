import type { Logic } from './logic'

export type TaskState = 'pristine' | 'running' | 'success' | 'error'
export async function executeTask<State extends {}>(
    logic: Logic<State>,
    keyOrMutation: keyof State | ((taskState: TaskState) => Partial<State>),
    loader: () => Promise<void>,
): Promise<void> {
    const taskStateMutation = (taskState: TaskState): Partial<State> => {
        if (typeof keyOrMutation === 'function') {
            return keyOrMutation(taskState)
        }
        return { [keyOrMutation]: taskState } as Partial<State>
    }

    logic.setState(taskStateMutation('running'))
    try {
        await loader()
        logic.setState(taskStateMutation('success'))
    } catch (err) {
        logic.setState(taskStateMutation('error'))
        throw err
    }
}
