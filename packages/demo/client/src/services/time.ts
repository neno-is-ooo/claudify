export class TimeService {
    sleep = (miliseconds: number) => {
        return new Promise<void>((resolve) => {
            setTimeout(resolve, miliseconds)
        })
    }
}
