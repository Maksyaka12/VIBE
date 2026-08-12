/**
 * Batch NFT Grid Cropper Script (3x3 Grid -> Individual Clean NFTs)
 *
 * Scans public/ for any grid image files (nft9.png, nft9_1.png, nft9_2.png or public/nft_grids/*.png).
 * Automatically crops out 9 clean individual NFT images per grid file:
 * - Excludes outer grid margins
 * - Excludes blue separator lines
 * - Excludes bottom text banners ("Vibe Club: #...")
 * - Saves clean square art images into public/nft/images/
 */

const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function processAllGridImages() {
  const publicDir = path.join(__dirname, 'public');
  const gridsDir = path.join(publicDir, 'nft_grids');
  const outputDir = path.join(publicDir, 'nft', 'images');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Find all grid images to process
  const gridFiles = [];

  if (fs.existsSync(gridsDir)) {
    const files = fs.readdirSync(gridsDir).filter(f => /\.(png|jfif|jpg|jpeg|webp)$/i.test(f));
    files.forEach(f => gridFiles.push(path.join(gridsDir, f)));
  }

  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir).filter(f => /^nft9.*?\.(png|jfif|jpg|jpeg|webp)$/i.test(f));
    files.forEach(f => gridFiles.push(path.join(publicDir, f)));
  }

  // Deduplicate files
  const uniqueGridFiles = Array.from(new Set(gridFiles));

  if (uniqueGridFiles.length === 0) {
    console.log('⚠️ No grid images found. Place 3x3 grid files as public/nft9.png or inside public/nft_grids/');
    return;
  }

  console.log(`🚀 Found ${uniqueGridFiles.length} grid image(s) to process.\n`);

  let globalNftCount = 0;

  for (let fileIdx = 0; fileIdx < uniqueGridFiles.length; fileIdx++) {
    const inputPath = uniqueGridFiles[fileIdx];
    console.log(`--------------------------------------------------`);
    console.log(`Processing Grid [${fileIdx + 1}/${uniqueGridFiles.length}]: ${path.basename(inputPath)}`);

    const image = await Jimp.read(inputPath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    console.log(`Image Size: ${width}x${height}`);

    // Exact grid coordinates excluding blue separator lines
    const colRanges = [
      { x: Math.floor(width * 0.000), w: Math.floor(width * 0.329) },
      { x: Math.floor(width * 0.336), w: Math.floor(width * 0.328) },
      { x: Math.floor(width * 0.670), w: Math.floor(width * 0.330) }
    ];

    // Rows cropped ABOVE the bottom text banner
    const rowRanges = [
      { y: Math.floor(height * 0.000), h: Math.floor(height * 0.295) },
      { y: Math.floor(height * 0.336), h: Math.floor(height * 0.295) },
      { y: Math.floor(height * 0.671), h: Math.floor(height * 0.295) }
    ];

    let gridCount = 0;
    for (let r = 0; r < rowRanges.length; r++) {
      for (let c = 0; c < colRanges.length; c++) {
        globalNftCount++;
        gridCount++;

        const { x, w } = colRanges[c];
        const { y, h } = rowRanges[r];

        const cropped = image.clone().crop({ x, y, w, h });
        const numFilename = `${globalNftCount}.png`;
        const numOutputPath = path.join(outputDir, numFilename);

        await cropped.write(numOutputPath);
        console.log(`  ✓ Extracted NFT #${globalNftCount} -> ${numFilename} (${w}x${h})`);
      }
    }
    console.log(`Completed grid ${path.basename(inputPath)}: ${gridCount} NFTs extracted.`);
  }

  console.log(`\n🎉 BATCH SUCCESS! Total ${globalNftCount} clean NFT images generated in ${outputDir}`);
}

processAllGridImages().catch(console.error);
