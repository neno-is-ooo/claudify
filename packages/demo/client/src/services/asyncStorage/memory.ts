import { AsyncStorageInterface } from './types'

export class MemoryAsyncStorage implements AsyncStorageInterface {
    store: { [key: string]: string } = {}

    getItem: AsyncStorageInterface['getItem'] = async (key) => {
        return (this.store[key] as any) ?? null
    }

    setItem: AsyncStorageInterface['setItem'] = async (key, value) => {
        this.store[key] = value
    }

    removeItem: AsyncStorageInterface['removeItem'] = async (key) => {
        delete this.store[key]
    }
}
