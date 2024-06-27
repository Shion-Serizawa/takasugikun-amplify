import React, { useState } from 'react';
import { fetchAuthSession } from "aws-amplify/auth";
import { InvokeWithResponseStreamCommand, LambdaClient } from '@aws-sdk/client-lambda';
import outputs from "../../amplify_outputs.json";

const InvokeMultiModal: React.FC = () => {
    const [prompt, setPrompt] = useState("");
    const [aiMessage, setAiMessage] = useState("");
    const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/3/38/Yukidaruma.jpg";

    const invokeMultimodal = async () => {
        const { credentials } = await fetchAuthSession();
        const awsRegion = outputs.auth.aws_region;
        const functionName = outputs.custom.invokeMultiFunctionName;

        const labmda = new LambdaClient({ credentials: credentials, region: awsRegion });
        const command = new InvokeWithResponseStreamCommand({
            FunctionName: functionName,
            Payload: new TextEncoder().encode(JSON.stringify({ prompt }))
        });
        const apiResponse = await labmda.send(command);

        let completeMessage = '';
        if (apiResponse.EventStream) {
            for await (const item of apiResponse.EventStream) {
                if (item.PayloadChunk) {
                    const payload = new TextDecoder().decode(item.PayloadChunk.Payload);
                    completeMessage = completeMessage + payload;
                    setAiMessage(completeMessage);
                }
            }
        }
    };
    return (
        <div>
            <div><img src={imageUrl} alt="Selected" style={{ maxWidth: '100%' }} /></div>
            
            <textarea
                onChange={(e) => setPrompt(e.target.value)}
                value={prompt}
                style={{ width: '50vw', textAlign: 'left' }}
            ></textarea>
            <br />
            <button onClick={invokeMultimodal}>invokeMultimodal</button>
            <div className="response-container">{aiMessage}</div>
        </div>
    );
};

export default InvokeMultiModal;
