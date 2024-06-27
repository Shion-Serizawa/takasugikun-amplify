import { Context, Handler } from 'aws-lambda';
import { Writable } from 'stream';
import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import axios from 'axios';
import * as base64 from 'base-64';

type eventType = {
    prompt: string,
}

const modelId = "anthropic.claude-3-5-sonnet-20240620-v1:0";
const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/3/38/Yukidaruma.jpg";  // ここに画像のURLをベタ書き

export const handler: Handler = awslambda.streamifyResponse(
    async (event: eventType, responseStream: Writable, _context: Context) => {

        // URLから画像をダウンロード
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBase64 = base64.encode(Buffer.from(response.data, 'binary').toString('binary'));

        const prompt = "私は、キーワードや質問、写真を与えたりするので、全てに対して意識の高い返答をしてください。\n日本語の自然な口語調になるように工夫をした上で、過剰に意識が高い発言をするように心がけてください。(行き過ぎて逆に、愛されキャラに思われるかもしれない感じです。)\n\n無駄にビジネスや哲学、経済の概念を混ぜ込む性質があるといいと思います。\nまた、日本語があるのに、横文字(英語の概念をカタカナで言う)ばかりという特徴もいいかもしれません\n\nこれまでは馬鹿っぽさもありますが、翻って結びは「要するに」からはじめ、鋭い（または痛烈）な指摘で締めてください。"
        const userRequest = event.prompt;

        const payload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 2000,
            messages: [
                {
                    role: "user",
                    content: [{ type: "text", text: prompt }],
                },
                {
                    role: "assistant",
                    content: [{ type: "text", text: "承知しました。" }],
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: userRequest },
                        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } }
                    ],
                }
            ]
        };

        const client = new BedrockRuntimeClient({ region: "us-east-1" });
        const command = new InvokeModelWithResponseStreamCommand({
            contentType: "application/json",
            body: JSON.stringify(payload),
            modelId,
        });

        const apiResponse = await client.send(command);

        if (apiResponse.body) {
            for await (const item of apiResponse.body) {
                if (item.chunk) {
                    const chunk = JSON.parse(new TextDecoder().decode(item.chunk.bytes));
                    const chunk_type = chunk.type;

                    if (chunk_type === "content_block_delta") {
                        const text = chunk.delta.text;
                        responseStream.write(text);
                    }
                } else if (item.internalServerException) {
                    throw item.internalServerException;
                } else if (item.modelStreamErrorException) {
                    throw item.modelStreamErrorException;
                } else if (item.throttlingException) {
                    throw item.throttlingException;
                } else if (item.validationException) {
                    throw item.validationException;
                }
            }
        }

        responseStream.end();
    }
);