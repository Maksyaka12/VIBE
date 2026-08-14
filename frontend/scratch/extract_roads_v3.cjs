const { Jimp } = require('jimp');

async function extractRoadsV3() {
  const versePath = "C:/Users/builder/Desktop/vibe/frontend/public/verse-map.jpg";
  const targetPath = "C:/Users/builder/Desktop/vibe/frontend/public/map-roads.png";

  console.log("Loading verse-map.jpg...");
  const img = await Jimp.read(versePath);
  const W = img.bitmap.width;
  const H = img.bitmap.height;
  console.log(`Image size: ${W}x${H}`);

  const out = new Jimp({ width: W, height: H, color: 0x00000000 });

  // Building exclusion zones
  const excludeZones = [
    { x1: 140, y1: 40,  x2: 490, y2: 295 },
    { x1: 140, y1: 285, x2: 370, y2: 465 },
    { x1: 585, y1: 45,  x2: 845, y2: 280 },
    { x1: 540, y1: 310, x2: 710, y2: 445 },
    { x1: 920, y1: 225, x2: 1130,y2: 465 },
    { x1: 810, y1: 290, x2: 970, y2: 465 },
    { x1: 960, y1: 475, x2: 1150,y2: 640 },
  ];

  function isInExcludeZone(x, y) {
    for (const z of excludeZones) {
      if (x >= z.x1 && x <= z.x2 && y >= z.y1 && y <= z.y2) return true;
    }
    return false;
  }

  // Road color: expanded range to capture full sandy-brown fill
  // The roads have a range from bright (194,145,82) to darker edges (130,90,45)
  function isRoad(r, g, b) {
    // Core sandy road hue check
    const isSandy = (
      r >= 125 && r <= 220 &&
      g >= 85  && g <= 175 &&
      b >= 35  && b <= 120 &&
      r > g + 15 &&
      g > b + 10 &&
      r - b > 60
    );
    if (!isSandy) return false;

    // Exclude very dark pixels (shadows/outlines, not road fill)
    const brightness = (r + g + b) / 3;
    if (brightness < 80) return false;

    // Exclude overly red pixels (building walls, flowers)
    if (r > 210 && g < 100) return false;

    return true;
  }

  // Pass 1: road mask
  console.log("Pass 1: detecting road pixels...");
  const roadMask = new Uint8Array(W * H);

  img.scan(0, 0, W, H, function(x, y, idx) {
    if (isInExcludeZone(x, y)) return;
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    if (isRoad(r, g, b)) {
      roadMask[y * W + x] = 1;
    }
  });

  // Pass 2: flood-fill road mask to close gaps (morphological dilation 1px)
  console.log("Pass 2: dilating road mask to fill gaps...");
  const dilated = new Uint8Array(roadMask);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (roadMask[y * W + x]) {
        dilated[(y-1)*W + x] = 1;
        dilated[(y+1)*W + x] = 1;
        dilated[y*W + (x-1)] = 1;
        dilated[y*W + (x+1)] = 1;
      }
    }
  }

  // Pass 3: detect animals (dogs) near road pixels
  console.log("Pass 3: detecting animals near roads...");
  const animalMask = new Uint8Array(W * H);
  const radius = 25;

  img.scan(0, 0, W, H, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    // White/cream/tan dog pixels
    const isAnimalColor = (
      r >= 195 && r <= 255 &&
      g >= 180 && g <= 245 &&
      b >= 145 && b <= 220 &&
      r >= g && g >= b
    );
    if (!isAnimalColor) return;
    if (isInExcludeZone(x, y)) return;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H) {
          if (dilated[ny * W + nx]) {
            animalMask[y * W + x] = 1;
            return;
          }
        }
      }
    }
  });

  // Pass 4: composite output
  console.log("Pass 4: compositing output...");
  img.scan(0, 0, W, H, function(x, y, idx) {
    const i = y * W + x;
    if (dilated[i] || animalMask[i]) {
      const outIdx = i * 4;
      out.bitmap.data[outIdx + 0] = this.bitmap.data[idx + 0];
      out.bitmap.data[outIdx + 1] = this.bitmap.data[idx + 1];
      out.bitmap.data[outIdx + 2] = this.bitmap.data[idx + 2];
      out.bitmap.data[outIdx + 3] = 255;
    }
  });

  console.log("Saving...");
  await out.write(targetPath);
  console.log(`Done! Saved to: ${targetPath}`);
}

extractRoadsV3().catch(console.error);
