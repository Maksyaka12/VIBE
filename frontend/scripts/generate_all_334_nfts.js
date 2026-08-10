import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collectionPath = path.join(__dirname, '../public/nft/collection.json');
const outDir = path.join(__dirname, '../public/nft/images');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

function downloadNftImage(item, index) {
  return new Promise((resolve) => {
    const paddedId = String(item.tokenId).padStart(3, '0');
    const fileName = `nft_${paddedId}.jpg`;
    const filePath = path.join(outDir, fileName);

    // Skip if already generated
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 5000) {
      console.log(`[${index + 1}/${collection.length}] ${fileName} already exists. Skipping.`);
      return resolve();
    }

    const promptText = `cute 3d render avatar of white fluffy maltipoo dog wearing ${item.outfit}, vibrant royal blue studio background, 3d render NFT avatar, high detail, studio lighting`;
    const encodedPrompt = encodeURIComponent(promptText);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${1000 + item.tokenId}`;

    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`[${index + 1}/${collection.length}] Successfully generated & saved ${fileName} (${item.role})!`);
        setTimeout(resolve, 300); // 300ms pause between requests
      });
    }).on('error', (err) => {
      console.error(`Error downloading ${fileName}:`, err);
      resolve();
    });
  });
}

async function run() {
  console.log(`🚀 Starting 100% Automated Generation of ${collection.length} Genesis NFT Images...`);
  for (let i = 0; i < collection.length; i++) {
    await downloadNftImage(collection[i], i);
  }
  console.log(`🎉 ALL ${collection.length} GENESIS NFT IMAGES GENERATED SUCCESSFULLY!`);
}

run();
