import { defineFunction } from '@aws-amplify/backend';

export const invokeMulti = defineFunction({
    name: 'invoke-multi',
    entry: './handler.ts',
})
