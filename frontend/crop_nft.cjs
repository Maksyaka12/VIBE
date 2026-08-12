const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function cropNFTs() {
  const inputPath = path.join(__dirname, 'public', 'nft9.png');
  const outputDir = path.join(__dirname, 'public', 'nft', 'images');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Loading image:', inputPath);
  const image = await Jimp.read(inputPath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  console.log(`Original Image Dimensions: ${width}x${height}`);

  const rows = 3;
  const cols = 3;
  const cellW = Math.floor(width / cols);
  const cellH = Math.floor(height / rows);

  console.log(`Cell size: ${cellW}x${cellH}`);

  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      count++;
      const x = c * cellW;
      const y = r * cellH;

      // Crop current cell
      const cropped = image.clone().crop({ x, y, w: cellW, h: cellH });
      const filename = `${count}.png`;
      const outputPath = path.join(outputDir, filename);

      await cropped.write(outputPath);
      console.log(`Saved NFT #${count} -> ${filename} (${cellW}x${cellH} at x:${x}, y:${y})`);
    }
  }

  // Remove test_crop.png if it exists
  const testFile = path.join(__dirname, 'public', 'test_crop.png');
  if (fs.existsSync(testFile)) fs.unlinkSync(testFile);

  console.log(`\n🎉 SUCCESS! Extracted ${count} individual NFT images into ${outputDir}`);
}

cropNFTs().catch(console.error);
