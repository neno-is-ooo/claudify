export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export type DebouncedFunction = () => void | Promise<void>
export function trailingDebounce(
    miliseconds: number,
): (f: DebouncedFunction) => Promise<void> {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let next: DebouncedFunction | null = null
    let executing = false

    return (f: () => void | Promise<void>) => {
        return new Promise<void>((resolve, reject) => {
            const wrapped = async () => {
                try {
                    await f()
                    resolve()
                } catch (err) {
                    reject(err)
                }
            }

            if (executing) {
                next = wrapped
                return
            }
            if (timeoutId) {
                clearTimeout(timeoutId)
            }

            const execute = async (f: DebouncedFunction) => {
                timeoutId = null
                executing = true
                await f()
                executing = false
                if (next) {
                    f = next
                    next = null
                    execute(f)
                }
            }

            timeoutId = setTimeout(() => execute(wrapped), miliseconds)
        })
    }
}
