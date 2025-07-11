import { Logic } from '@/utils/logic'
import { useEffect, useRef, useState } from 'react'

export function useLogic<L extends Logic<any, any>>(
    LogicClass: new (deps: L['deps']) => L,
    deps: L['deps'],
) {
    type Deps = L['deps']
    type State = ReturnType<L['getInitialState']>

    const logicRef = useRef(new LogicClass(deps))
    const logic = logicRef.current
    let [state, setState] = useState<State>(logic.getInitialState())
    logic.getState = () => state
    logic.setState = (newState) => {
        state = { ...state, ...newState }
        setState(state)
    }
    useEffect(() => {
        logic.initialize?.()

        if (logic.cleanup != null) {
            return () => {
                logic.cleanup()
                for (const fn of logic.cleanupFns) {
                    fn()
                }
            }
        }
    }, [])

    useEffect(() => {
        const oldDeps = logic.deps
        logic.deps = deps
        if (logic.shouldReload(oldDeps, deps)) {
            logic.initialize?.()
        }
    }, Object.values(deps))

    return { logic, state }
}
