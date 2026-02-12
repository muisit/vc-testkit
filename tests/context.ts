import { test as baseTest } from 'vitest'

let key:any = null;

import { createKey } from '../src/identifiers/createKey';
export const context = baseTest.extend({
  // https://vitest.dev/guide/test-context.html#fixture-initialization
  key: async ({}, use) => {
    if (key === null) {
        key = await createKey('Secp256r1');   
    }
    await use(key);
    // do not clean up
  },
  // https://vitest.dev/guide/test-context.html#default-fixture
  url: [
    // default value if "url" is not defined in the config
    '/default',
    // mark the fixture as "injected" to allow the override
    { injected: true },
  ],
})