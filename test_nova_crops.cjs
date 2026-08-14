const fs = require('fs');
const path = require('path');
const { Jimp } = require('./frontend/node_modules/jimp');

async function testNovaCrops() {
  const dir = path.join(__dirname, 'frontend', 'public', 'nft');
  const outDir = path.join(dir, 'test_nova_crops');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const filename of ['nova.jfif', 'nova2.jfif']) {
    const filePath = path.join(dir, filename);
    const img = await Jimp.read(filePath);
    const W = img.bitmap.width; // 2752
    const H = img.bitmap.height; // 1536

    const cols = 4;
    const rows = 3;
    const cellW = W / cols; // 688
    const cellH = H / rows; // 512

    console.log(`Processing ${filename} -> cell size: ${cellW} x ${cellH}`);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c + 1;
        const x = Math.round(c * cellW);
        const y = Math.round(r * cellH);
        const w = Math.round(cellW);
        const h = Math.round(cellH);

        // Save raw cell
        const rawCell = img.clone().crop({ x, y, w, h });
        await rawCell.write(path.join(outDir, `${filename.replace('.jfif', '')}_tile_${idx}_raw.png`));

        // Save clean avatar:
        // Exclude bottom banner: banner is at the bottom of the cell (roughly bottom 18-20% of 512px = ~90px)
        // Usable height = 512 - 90 = ~422px
        // Center a square of size ~420x420 horizontally within the 688px cell
        const bannerH = Math.round(h * 0.18);
        const inset = 4;
        const availH = h - (inset * 2) - bannerH;
        const squareSize = availH;
        const cropX = x + Math.round((w - squareSize) / 2);
        const cropY = y + inset;

        const cleanCell = img.clone().crop({ x: cropX, y: cropY, w: squareSize, h: squareSize });
        cleanCell.resize({ w: 600, h: 600 });
        await cleanCell.write(path.join(outDir, `${filename.replace('.jfif', '')}_tile_${idx}_clean.png`));
      }
    }
  }

  console.log(`Saved test crops in ${outDir}`);
}

testNovaCrops().catch(console.error);
