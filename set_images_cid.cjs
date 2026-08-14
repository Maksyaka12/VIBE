const fs = require('fs');
const path = require('path');

const METADATA_DIR = path.join(__dirname, 'frontend', 'public', 'nft', 'metadata');

/**
 * Usage: node set_images_cid.cjs <YOUR_IMAGES_IPFS_CID>
 * Example: node set_images_cid.cjs QmXYZ123456789...
 */

const cid = process.argv[2];

if (!cid) {
  console.log('❌ Error: Please provide your Images IPFS CID.');
  console.log('Usage: node set_images_cid.cjs <IMAGES_CID>');
  process.exit(1);
}

const files = fs.readdirSync(METADATA_DIR).filter(f => f.endsWith('.json'));

console.log(`Updating ${files.length} metadata files with Images CID: ${cid}...`);

for (const file of files) {
  const filePath = path.join(METADATA_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath));
  data.image = `ipfs://${cid}/${file.replace('.json', '')}.png`;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  // Also update extensionless file
  const extlessPath = path.join(METADATA_DIR, file.replace('.json', ''));
  if (fs.existsSync(extlessPath)) {
    fs.writeFileSync(extlessPath, JSON.stringify(data, null, 2));
  }
}

console.log(`🎉 ALL 333 METADATA FILES UPDATED!`);
console.log(`Now upload the "frontend/public/nft/metadata" folder to Pinata to get your Metadata Base URI.`);
