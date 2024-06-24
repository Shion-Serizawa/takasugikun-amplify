import { fetchAuthSession } from "aws-amplify/auth"
import { InvokeWithResponseStreamCommand, LambdaClient } from '@aws-sdk/client-lambda'

import outputs from "../../amplify_outputs.json"
import { useState } from 'react'


const InvokeBedrock: React.FC = () => {
    const [prompt, setPrompt] = useState("")
    const [aiMessage, setAiMessage] = useState("")


    async function invokeBedrock() {

        const { credentials } = await fetchAuthSession()
        const awsRegion = outputs.auth.aws_region
        const functionName = outputs.custom.invokeBedrockFunctionName

        const labmda = new LambdaClient({ credentials: credentials, region: awsRegion })
        const command = new InvokeWithResponseStreamCommand({
            FunctionName: functionName,
            Payload: new TextEncoder().encode(JSON.stringify({ prompt: prompt }))
        })
        const apiResponse = await labmda.send(command);

        let completeMessage = ''
        if (apiResponse.EventStream) {
            for await (const item of apiResponse.EventStream) {
                if (item.PayloadChunk) {
                    const payload = new TextDecoder().decode(item.PayloadChunk.Payload)
                    completeMessage = completeMessage + payload
                    setAiMessage(completeMessage)
                }
            }
        }
    }

    return (
        <div>
            <textarea
                onChange={(e) => setPrompt(e.target.value)}
                value={prompt}
                style={{ width: '50vw', textAlign: 'left' }}
            ></textarea>
            <br />
            <button onClick={invokeBedrock}>invokeBedrock</button>
            <div style={{ width: '50vw', textAlign: 'left' }}>{aiMessage}</div>
        </div>
    )
}

export default InvokeBedrock