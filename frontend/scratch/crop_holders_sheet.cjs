const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function cropHoldersSheet() {
  const sheetPath = "C:/Users/builder/.gemini/antigravity/brain/be1b603b-2161-4e2c-9125-ecbafbf2febb/buildings_sheet_1786304680273.jpg";
  const publicDir = "C:/Users/builder/Desktop/vibe/frontend/public/buildings";

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Loading buildings sheet...');
  const sheet = await Jimp.read(sheetPath);
  const W = sheet.bitmap.width;
  const H = sheet.bitmap.height;

  const colW = Math.floor(W / 3);
  const rowH = Math.floor(H / 2);

  // Row 1, Col 2 is the Gold Crown Treasury
  console.log(`Cropping Row 1, Col 2: x=${2 * colW}, y=${rowH}`);
  const holdersCropped = sheet.clone().crop({ x: 2 * colW, y: rowH, w: colW, h: rowH });

  // Chroma key black background to transparent
  holdersCropped.scan(0, 0, holdersCropped.bitmap.width, holdersCropped.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const brightness = (r + g + b) / 3;
    if (brightness < 35) {
      this.bitmap.data[idx + 3] = 0; // Transparent
    }
  });

  const outPath = path.join(publicDir, "holders.png");
  await holdersCropped.write(outPath);
  console.log(`Saved transparent PNG to ${outPath}`);
}

cropHoldersSheet().catch(console.error);
