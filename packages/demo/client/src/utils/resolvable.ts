export interface Resolvable<T> extends Promise<T> {
    resolve(value: T): void
    reject(error: Error): void
}

export function createResolvable<T = void>(): Resolvable<T> {
    let resolve: Resolvable<T>['resolve']
    let reject: Resolvable<T>['reject']
    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    }) as Resolvable<T>
    promise.resolve = resolve!
    promise.reject = reject!
    return promise
}
