const { createPublicClient, http } = require('./frontend/node_modules/viem');
const { base } = require('./frontend/node_modules/viem/chains');

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
});

const O1_CORE = '0x498581fF718922c3f8e6A244956aF099B2652b2b';
const POOL_ID = '0xa1a4159e61ac9fc48aa9e9992c8d4870ef8a496d5749af1d219e8002f74835c5';

// Let's decode the swap call in log 3
console.log('O1 Core Pool address:', O1_CORE);
console.log('O1 Pool ID:', POOL_ID);
