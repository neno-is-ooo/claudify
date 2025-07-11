import { AsyncStorageData, AsyncStorageInterface } from './types'

export class WebAsyncStorage implements AsyncStorageInterface {
    // Generic typed methods for our app
    async getItem<Key extends keyof AsyncStorageData>(
        key: Key,
    ): Promise<AsyncStorageData[Key] | null> {
        const value = localStorage.getItem(key as string)
        if (value === null) {
            return null
        }
        try {
            return JSON.parse(value)
        } catch (e) {
            console.error(`Error parsing stored value for key ${key}:`, e)
            return null
        }
    }

    async setItem<Key extends keyof AsyncStorageData>(
        key: Key,
        value: AsyncStorageData[Key],
    ): Promise<void> {
        localStorage.setItem(key as string, JSON.stringify(value))
    }

    async removeItem<Key extends keyof AsyncStorageData>(
        key: Key,
    ): Promise<void> {
        localStorage.removeItem(key as string)
    }

    async clear(): Promise<void> {
        localStorage.clear()
    }
}
