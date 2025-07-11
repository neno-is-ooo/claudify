import { EventEmitter, EventListener } from './events'

export abstract class Logic<Deps, State> {
    // TODO: Document
    cleanupFns: Array<() => void> = []

    constructor(public deps: Deps) {}

    abstract getInitialState(): State
    async initialize(): Promise<void> {}
    shouldReload(oldDeps: Deps, newDeps: Deps): boolean {
        return false
    }
    async cleanup(): Promise<void> {}
    getState(): State {
        throw new Error('useLogic hook is supposed to override this')
    }
    setState(state: Partial<State>): void {
        throw new Error('useLogic hook is supposed to override this')
    }
    get state() {
        return this.getState()
    }

    // TODO: Document
    listen<EventData>(
        emitter: EventEmitter<EventData>,
        listener: EventListener<EventData>,
    ) {
        this.cleanupFns.push(emitter.listen(listener))
    }
}
