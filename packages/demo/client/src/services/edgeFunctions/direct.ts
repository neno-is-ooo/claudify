import {
    EdgeFunctionContext,
    EdgeFunctionInput,
    EdgeFunctionName,
} from '@backend/supabase/functions/types'
import { collectEdgeFunctions } from '@backend/supabase/functions/tests'
import { EdgeFunctionCallResult, EdgeFunctionsService } from './types'
import { functionRegistry } from '@backend/supabase/functions/setup'

export class DirectEdgeFunctions implements EdgeFunctionsService {
    constructor(public context: EdgeFunctionContext) {}

    async call<Name extends EdgeFunctionName>(
        name: Name,
        input: EdgeFunctionInput<Name>,
    ): Promise<EdgeFunctionCallResult<Name>> {
        if (!Object.keys(functionRegistry).length) {
            await collectEdgeFunctions()
        }
        const f = functionRegistry[name]
        if (!f) {
            throw new Error(`Edge function not registered: ${name}`)
        }
        return f(input, this.context)
    }
}
