const fs = require('fs');
const path = require('path');
const { Jimp } = require('./frontend/node_modules/jimp');

const INPUT_DIR = path.join(__dirname, 'frontend', 'public', 'nft');
const OUTPUT_DIR = path.join(__dirname, 'frontend', 'public', 'nft', 'images');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function processAllNFTs() {
  console.log(`Starting NFT cropping from: ${INPUT_DIR}`);
  console.log(`Saving cropped NFT images to: ${OUTPUT_DIR}`);

  // Get all valid grid images (excluding directories and temp test files)
  const allFiles = fs.readdirSync(INPUT_DIR).filter(f => {
    const fullPath = path.join(INPUT_DIR, f);
    return fs.statSync(fullPath).isFile() && 
           /\.(jfif|png|jpg|jpeg|webp)$/i.test(f) && 
           !f.startsWith('test') &&
           !f.startsWith('tile');
  });

  // Make sure example9nft.png or grid 1 is first if present
  allFiles.sort((a, b) => {
    if (a.includes('example')) return -1;
    if (b.includes('example')) return 1;
    return a.localeCompare(b);
  });

  console.log(`Found ${allFiles.length} grid files to crop (Total: ${allFiles.length * 9} NFTs)...`);

  let count = 0;

  for (let fileIdx = 0; fileIdx < allFiles.length; fileIdx++) {
    const filename = allFiles[fileIdx];
    const filePath = path.join(INPUT_DIR, filename);

    try {
      const img = await Jimp.read(filePath);
      const W = img.bitmap.width;
      const H = img.bitmap.height;

      const cellW = W / 3;
      const cellH = H / 3;

      console.log(`[Grid ${fileIdx + 1}/${allFiles.length}] Processing ${filename} (${W}x${H})...`);

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          count++;

          const x = Math.round(col * cellW);
          const y = Math.round(row * cellH);
          const w = Math.round(cellW);
          const h = Math.round(cellH);

          // Calculate precise inset to remove all grid lines and the bottom text banner:
          // Inset 1.2% on top/left/right
          // Cut bottom 14% to remove the black banner completely
          const inset = Math.max(4, Math.round(w * 0.012));
          const bannerH = Math.round(h * 0.14);

          const availableW = w - (inset * 2);
          const availableH = h - inset - bannerH;
          const squareSize = Math.min(availableW, availableH);

          // Center horizontally within the available width, and start right below the top inset
          const cropX = x + inset + Math.round((availableW - squareSize) / 2);
          const cropY = y + inset;

          // Crop square tile
          const tile = img.clone().crop({
            x: cropX,
            y: cropY,
            w: squareSize,
            h: squareSize
          });

          // Resize to standard 600x600 for optimal fast loading and crisp pixel quality
          tile.resize({ w: 600, h: 600 });

          const outPath = path.join(OUTPUT_DIR, `${count}.png`);
          await tile.write(outPath);
        }
      }
      console.log(`  -> Cropped ${fileIdx * 9 + 1} to ${count}`);
    } catch (err) {
      console.error(`Error processing ${filename}:`, err);
    }
  }

  console.log(`\n🎉 DONE! Successfully cropped ${count} NFTs cleanly into ${OUTPUT_DIR}`);
}

processAllNFTs().catch(console.error);
