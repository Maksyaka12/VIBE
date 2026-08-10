const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function buildStep2ExactRoads() {
  const mapPath = "C:/Users/builder/Desktop/vibe/frontend/public/verse-map.jpg";
  const publicDir = "C:/Users/builder/Desktop/vibe/frontend/public";

  console.log('Loading original verse-map.jpg to extract exact road network...');
  const mapImg = await Jimp.read(mapPath);
  const W = mapImg.bitmap.width;
  const H = mapImg.bitmap.height;

  // 1. Extract exact dirt roads from verse-map.jpg
  const roadsImg = mapImg.clone();
  roadsImg.scan(0, 0, W, H, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    // Detect dirt road pixels (golden sand/orange-brown hue with dark border)
    const isRoadSand = (r > 160 && g > 110 && g < r && b < 120 && (r - b) > 40) ||
                       (r > 180 && g > 125 && b < 120);

    const isRoadBorder = (r > 70 && r < 140 && g > 40 && g < 95 && b > 15 && b < 65);

    if (isRoadSand || isRoadBorder) {
      this.bitmap.data[idx + 3] = 255; // Keep road pixel
    } else {
      this.bitmap.data[idx + 3] = 0; // Make non-road pixel transparent
    }
  });

  const outPath = path.join(publicDir, "map-roads.png");
  await roadsImg.write(outPath);
  console.log(`Saved exact step 2 roads PNG to ${outPath}`);
}

buildStep2ExactRoads().catch(console.error);
