import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prompt = encodeURIComponent('cute 3d render avatar of white fluffy maltipoo dog wearing blue football jersey and helmet, vibrant royal blue studio background, 3d render NFT avatar, high detail');
const url = `https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&nologo=true&seed=42`;

const outDir = path.join(__dirname, '../public/nft/images');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const file = fs.createWriteStream(path.join(outDir, 'nft_004.jpg'));

https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Test automated NFT #004 downloaded successfully to public/nft/images/nft_004.jpg!');
  });
}).on('error', (err) => {
  console.error('Error downloading image:', err);
});
