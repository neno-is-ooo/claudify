export interface FetchServiceInterface {
    // TODO: Why?
    request: (typeof globalThis)['fetch']
}

export class DefaultFetchInterface implements FetchServiceInterface {
    request = globalThis['fetch']
}
