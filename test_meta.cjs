// Test lighthouse IPFS upload for metadata folder
const fs = require('fs');
const path = require('path');

const METADATA_DIR = path.join(__dirname, 'frontend', 'public', 'nft', 'metadata');
console.log('Metadata files ready:', fs.readdirSync(METADATA_DIR).length);
