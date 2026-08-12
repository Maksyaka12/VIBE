const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

// Exact mapping of filenames for each of the 9 NFTs based on their title banner
const NFT_NAMES = [
  'Vibe Club #177 Footballer.png',
  'Vibe Club #178 Ninja.png',
  'Vibe Club #179 Samurai.png',
  'Vibe Club #180 Astronaut.png',
  'Vibe Club #181 Pirate.png',
  'Vibe Club #182 King.png',
  'Vibe Club #183 Wizard.png',
  'Vibe Club #184 Cyberpunk.png',
  'Vibe Club #185 Detective.png'
];

async function cropNFTsWithoutBanner() {
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

  // Columns excluding blue vertical separator lines
  const colRanges = [
    { x: 0, w: 675 },
    { x: 688, w: 672 },
    { x: 1373, w: 675 }
  ];

  // Rows cropped ABOVE the bottom text banner (height = 605px)
  const rowRanges = [
    { y: 0, h: 605 },
    { y: 688, h: 605 },
    { y: 1375, h: 605 }
  ];

  let count = 0;
  for (let r = 0; r < rowRanges.length; r++) {
    for (let c = 0; c < colRanges.length; c++) {
      const { x, w } = colRanges[c];
      const { y, h } = rowRanges[r];

      // Crop current cell without bottom banner and without blue lines
      const cropped = image.clone().crop({ x, y, w, h });
      const filename = NFT_NAMES[count] || `NFT_${count + 1}.png`;
      const outputPath = path.join(outputDir, filename);

      await cropped.write(outputPath);
      console.log(`Saved Clean NFT #${count + 1} -> "${filename}" (${w}x${h} at x:${x}, y:${y})`);
      
      // Also save a fallback copy as 1.png, 2.png etc.
      const numFilename = `${count + 1}.png`;
      const numOutputPath = path.join(outputDir, numFilename);
      await cropped.write(numOutputPath);

      count++;
    }
  }

  console.log(`\n🎉 SUCCESS! Extracted ${count} 100% CLEAN NFT images (zero text banner & zero blue lines) into ${outputDir}`);
}

cropNFTsWithoutBanner().catch(console.error);
