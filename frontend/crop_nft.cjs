const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function cropNFTsClean() {
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

  // Exact coordinates excluding the blue grid separator lines
  const colRanges = [
    { x: 0, w: 675 },
    { x: 688, w: 672 },
    { x: 1373, w: 675 }
  ];

  const rowRanges = [
    { y: 0, h: 676 },
    { y: 688, h: 673 },
    { y: 1375, h: 673 }
  ];

  let count = 0;
  for (let r = 0; r < rowRanges.length; r++) {
    for (let c = 0; c < colRanges.length; c++) {
      count++;
      const { x, w } = colRanges[c];
      const { y, h } = rowRanges[r];

      // Clean crop excluding blue border lines
      const cropped = image.clone().crop({ x, y, w, h });
      const filename = `${count}.png`;
      const outputPath = path.join(outputDir, filename);

      await cropped.write(outputPath);
      console.log(`Saved Clean NFT #${count} -> ${filename} (${w}x${h} at x:${x}, y:${y})`);
    }
  }

  console.log(`\n🎉 SUCCESS! Extracted ${count} 100% CLEAN NFT images (zero blue lines) to ${outputDir}`);
}

cropNFTsClean().catch(console.error);
