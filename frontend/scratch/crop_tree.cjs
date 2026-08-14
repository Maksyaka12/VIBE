const { Jimp } = require('jimp');
const path = require('path');

async function cropTree() {
  const mapPath = "C:/Users/builder/Desktop/vibe/frontend/public/verse-map.jpg";
  console.log('Loading verse-map.jpg...');
  const image = await Jimp.read(mapPath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  // Crop a clean tree from the map (approx x: 41.5% to 47.0%, y: 44.0% to 57.0%)
  const sx = Math.floor(0.415 * width);
  const sy = Math.floor(0.440 * height);
  const sw = Math.floor(0.055 * width);
  const sh = Math.floor(0.130 * height);

  console.log(`Cropping tree: x=${sx}, y=${sy}, w=${sw}, h=${sh}`);
  const tree = image.clone().crop({ x: sx, y: sy, w: sw, h: sh });

  // Chroma key grass background to transparent
  tree.scan(0, 0, tree.bitmap.width, tree.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const isGreen = (g > r * 1.05 && g > b * 1.05 && g > 30) || 
                    (g > 50 && r < 55 && b < 55) ||
                    (g > 90 && r > 40 && r < 140 && b < 100);
    if (isGreen) {
      this.bitmap.data[idx + 3] = 0; // Transparent
    }
  });

  const outputPath = "C:/Users/builder/Desktop/vibe/frontend/public/tree-overlay.png";
  await tree.write(outputPath);
  console.log(`Saved transparent tree-overlay.png`);
}

cropTree().catch(console.error);
