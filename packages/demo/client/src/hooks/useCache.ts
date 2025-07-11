import { GlobalContext } from '@/contexts/global'
import { CachedData } from '@/services/cache'
import { useContext, useEffect, useRef, useState } from 'react'

export function useCache(keys: Array<keyof CachedData>) {
    const keySetRef = useRef(new Set([...keys]))
    const keySet = keySetRef.current

    const { services } = useContext(GlobalContext)
    const [cachedData, setCachedData] = useState<CachedData>({
        ...services.cache.getData(),
    })

    useEffect(() => {
        return services.cache.onUpdate.listen((keys) => {
            for (const key of keys) {
                if (keySet.has(key)) {
                    setCachedData({ ...services.cache.getData() })
                    break
                }
            }
        })
    })

    return new Proxy(
        {},
        {
            get: (_, key) => {
                if (!keySet.has(key as keyof CachedData)) {
                    throw new Error(
                        `Tried to access key of cache without passing it into useCache(['key'])`,
                    )
                }
                return cachedData[key as keyof CachedData]
            },
        },
    ) as CachedData
}
