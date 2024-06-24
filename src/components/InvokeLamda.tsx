import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { fetchAuthSession } from 'aws-amplify/auth'

import outputs from "../../amplify_outputs.json"
import { useState } from 'react'

const InvokeLambda: React.FC = () => {
    const [text, setText] = useState<string | null>(null)


    async function invokeLambda() {
        const { credentials } = await fetchAuthSession()
        const awsRegion = outputs.auth.aws_region
        const functionName = outputs.custom.helloworldFunctionName

        const labmda = new LambdaClient({ credentials: credentials, region: awsRegion })
        const command = new InvokeCommand({
            FunctionName: functionName,
        });
        const apiResponse = await labmda.send(command);

        if (apiResponse.Payload) {
            const payload = JSON.parse(new TextDecoder().decode(apiResponse.Payload))
            setText(payload.message)
        }
    }
    

    return (
        <div>
            <button onClick={invokeLambda}>Invoke Hello World!</button>
            <p>{text}</p>
        </div>
    )
}

export default InvokeLambda
