import { FunctionInvokeOptions, SupabaseClient } from '@supabase/supabase-js'
import {
    EdgeFunctionInput,
    EdgeFunctionOutput,
    EdgeFunctionName,
} from '@backend/supabase/functions/types'
import { EdgeFunctionCallResult, EdgeFunctionsService } from './types'

export class SupabaseEdgeFunctionsService implements EdgeFunctionsService {
    constructor(public supabase: SupabaseClient) {}

    async call<Name extends EdgeFunctionName>(
        name: Name,
        input: EdgeFunctionInput<Name>,
        opts: Omit<FunctionInvokeOptions, 'body'> = {},
    ): Promise<EdgeFunctionCallResult<Name>> {
        try {
            const response = await this.supabase.functions.invoke(name, {
                body: input as any, // automatically gets serialized to JSON with right header
            })
            if (response.error) {
                return { error: 'invocation-error', details: response.error }
            }
            return response.data
        } catch (err) {
            return { error: 'invocation-error', details: err }
        }
    }
}
