import { ThemeVariant } from '@/theme'

/**
 * Defines the structure of data stored in AsyncStorage.
 * All values must be strings as enforced by the StorageData type.
 * Complex data types must be serialized (e.g., as JSON strings).
 */
export type AsyncStorageData = StorageData<{
    theme: ThemeVariant
    todos: string // JSON
    todo_backend_save_queue: string
}>

export interface AsyncStorageInterface {
    getItem<Key extends keyof AsyncStorageData>(
        key: Key,
    ): Promise<AsyncStorageData[Key] | null>
    setItem<Key extends keyof AsyncStorageData>(
        key: Key,
        value: AsyncStorageData[Key],
    ): Promise<void>
    removeItem<Key extends keyof AsyncStorageData>(key: Key): Promise<void>
}

/**
 * A utility type that enforces all storage values to be strings.
 * This is necessary because localStorage/sessionStorage can only
 * store string values.
 *
 * @template Data - An object type where all values must be strings
 */
type StorageData<Data extends { [key: string]: string }> = Data
