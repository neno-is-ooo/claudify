export type EventListener<EventData> = (data: EventData) => void
export class EventEmitter<EventData> {
    _listeners: { [id: number]: EventListener<EventData> } = {}
    _nextId = 0

    emit(data: EventData) {
        for (const listener of Object.values(this._listeners)) {
            listener(data)
        }
    }

    listen(listener: EventListener<EventData>) {
        const id = this._nextId++
        this._listeners[id] = listener
        const unsubscribe = () => {
            delete this._listeners[id]
        }
        return unsubscribe
    }
}
