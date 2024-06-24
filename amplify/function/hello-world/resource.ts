import { defineFunction } from '@aws-amplify/backend';

export const helloworld = defineFunction({
    name: 'hello-world',
    entry: './handler.ts',
})
