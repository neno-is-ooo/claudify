import {
    EdgeFunctionInput,
    EdgeFunctionName,
    EdgeFunctionOutput,
} from '@backend/supabase/functions/types'

export type EdgeFunctionCallResult<Name extends EdgeFunctionName> =
    | EdgeFunctionOutput<Name>
    | { error: 'invocation-error'; details: any }

export interface EdgeFunctionsService {
    call<Name extends EdgeFunctionName>(
        name: Name,
        input: EdgeFunctionInput<Name>,
    ): Promise<EdgeFunctionCallResult<Name>>
}
