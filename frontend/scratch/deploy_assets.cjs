const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

async function deployAssets() {
  const brainDir = "C:/Users/builder/.gemini/antigravity/brain/be1b603b-2161-4e2c-9125-ecbafbf2febb";
  const publicDir = "C:/Users/builder/Desktop/vibe/frontend/public/buildings";

  console.log('Copying individual building assets...');

  // 1. Copy Arena
  fs.copyFileSync(
    path.join(brainDir, "building_arena_1786306254131.jpg"),
    path.join(publicDir, "arena.jpg")
  );

  // 2. Copy Bank
  fs.copyFileSync(
    path.join(brainDir, "building_bank_1786306221675.jpg"),
    path.join(publicDir, "bank.jpg")
  );

  // 3. Copy DeFi
  fs.copyFileSync(
    path.join(brainDir, "building_defi_1786306285438.jpg"),
    path.join(publicDir, "defi.jpg")
  );

  // 4. Copy Home
  fs.copyFileSync(
    path.join(brainDir, "building_home_1786306204078.jpg"),
    path.join(publicDir, "home.jpg")
  );

  // 5. Copy Poster
  fs.copyFileSync(
    path.join(brainDir, "building_poster_1786306271387.jpg"),
    path.join(publicDir, "poster.jpg")
  );

  // 6. Copy Leaderboard (separately generated trophy cup)
  fs.copyFileSync(
    path.join(brainDir, "building_trophy_1786306297503.jpg"),
    path.join(publicDir, "leaderboard.jpg")
  );

  console.log('Cropping Holders and NFT Mint from buildings sheet...');
  const sheet = await Jimp.read(path.join(brainDir, "buildings_sheet_1786304680273.jpg"));
  const W = sheet.bitmap.width;
  const H = sheet.bitmap.height;

  const colW = Math.floor(W / 3);
  const rowH = Math.floor(H / 2);

  // Holders Zone: Row 1, Col 2 (Gold crown treasury)
  const holdersCropped = sheet.clone().crop({ x: 2 * colW, y: rowH, w: colW, h: rowH });
  await holdersCropped.write(path.join(publicDir, "holders.jpg"));
  console.log('Saved holders.jpg');

  // NFT Mint: Row 1, Col 1 (Orange trophy hall)
  const nftMintCropped = sheet.clone().crop({ x: colW, y: rowH, w: colW, h: rowH });
  await nftMintCropped.write(path.join(publicDir, "nft_mint.jpg"));
  console.log('Saved nft_mint.jpg');

  console.log('All 8 building assets deployed successfully!');
}

deployAssets().catch(console.error);
