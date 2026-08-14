const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

const INPUT_DIR = path.join(__dirname, 'frontend', 'public', 'nft_grids');
const OUTPUT_DIR = path.join(__dirname, 'frontend', 'public', 'nft', 'images');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function cropAllGrids() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.log(`Input directory ${INPUT_DIR} does not exist yet. Create it and add your 3x3 grid files.`);
    return;
  }

  const files = fs.readdirSync(INPUT_DIR).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f)).sort();

  if (files.length === 0) {
    console.log(`No image files found in ${INPUT_DIR}`);
    return;
  }

  console.log(`Found ${files.length} grid files to crop...`);
  let globalCount = 0;

  for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
    const filename = files[fileIndex];
    const filePath = path.join(INPUT_DIR, filename);
    console.log(`Processing grid ${fileIndex + 1}/${files.length}: ${filename}`);

    try {
      const image = await Jimp.read(filePath);
      const width = image.bitmap.width;
      const height = image.bitmap.height;

      const cellW = Math.floor(width / 3);
      const cellH = Math.floor(height / 3);

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          globalCount++;
          if (globalCount > 333) break;

          const x = col * cellW;
          const y = row * cellH;

          // Clone and crop cell
          const tile = image.clone().crop({ x, y, w: cellW, h: cellH });
          const outPath = path.join(OUTPUT_DIR, `${globalCount}.png`);
          await tile.write(outPath);
          console.log(` Saved NFT #${globalCount} -> ${outPath}`);
        }
      }
    } catch (err) {
      console.error(`Error processing ${filename}:`, err);
    }
  }

  console.log(`✅ Successfully cropped ${globalCount} NFTs into ${OUTPUT_DIR}!`);
}

cropAllGrids();
