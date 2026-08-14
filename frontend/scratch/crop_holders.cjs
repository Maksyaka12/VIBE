const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function cropHolders() {
  const sheetPath = "C:/Users/builder/.gemini/antigravity/brain/be1b603b-2161-4e2c-9125-ecbafbf2febb/buildings_sheet_1786304680273.jpg";
  const publicDir = "C:/Users/builder/Desktop/vibe/frontend/public/buildings";

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Loading sheet...');
  const sheet = await Jimp.read(sheetPath);
  const W = sheet.bitmap.width;
  const H = sheet.bitmap.height;

  const colW = Math.floor(W / 3);
  const rowH = Math.floor(H / 2);

  // Row 1, Col 2 is Holders Zone Gold Crown Treasury
  console.log(`Cropping Row 1, Col 2: w=${colW}, h=${rowH}`);
  const holdersCropped = sheet.clone().crop({ x: 2 * colW, y: rowH, w: colW, h: rowH });

  const outPath = path.join(publicDir, "holders.jpg");
  await holdersCropped.write(outPath);
  console.log(`Saved ${outPath}`);
}

cropHolders().catch(console.error);
