const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function editStep2RoadsUserRequest() {
  const roadsPath = "C:/Users/builder/Desktop/vibe/frontend/public/map-roads.png";

  console.log('Loading map-roads.png to apply 3 road edits...');
  const img = await Jimp.read(roadsPath);
  const W = img.bitmap.width;
  const H = img.bitmap.height;

  // Road colors
  const sandR = 224, sandG = 158, sandB = 72, sandA = 255;
  const borderR = 102, borderG = 62, borderB = 32, borderA = 255;

  // 1. Fix Point 1: Fill in eroded top edge of horizontal road (x: 60%..68%, y: 34%..36.5%)
  const p1_x1 = Math.floor(0.60 * W);
  const p1_x2 = Math.floor(0.68 * W);
  const p1_y1 = Math.floor(0.340 * H);
  const p1_y2 = Math.floor(0.365 * H);

  for (let x = p1_x1; x <= p1_x2; x++) {
    for (let y = p1_y1; y <= p1_y2; y++) {
      const idx = (y * W + x) * 4;
      // Fill with road sand color if currently transparent or notch
      if (img.bitmap.data[idx + 3] === 0 || y < p1_y1 + 4) {
        img.bitmap.data[idx + 0] = (y <= p1_y1 + 2) ? borderR : sandR;
        img.bitmap.data[idx + 1] = (y <= p1_y1 + 2) ? borderG : sandG;
        img.bitmap.data[idx + 2] = (y <= p1_y1 + 2) ? borderB : sandB;
        img.bitmap.data[idx + 3] = 255;
      }
    }
  }

  // 2. Fix Point 2: Erase bottom-right isolated road stub (x: 77%..85%, y: 77%..92%)
  const p2_x1 = Math.floor(0.77 * W);
  const p2_x2 = Math.floor(0.85 * W);
  const p2_y1 = Math.floor(0.77 * H);
  const p2_y2 = Math.floor(0.92 * H);

  for (let x = p2_x1; x <= p2_x2; x++) {
    for (let y = p2_y1; y <= p2_y2; y++) {
      const idx = (y * W + x) * 4;
      img.bitmap.data[idx + 3] = 0; // Make 100% transparent
    }
  }

  // 3. Fix Point 3: Draw curved road extension extending down and turning right
  // From (x: 71.5% W, y: 74% H) curving to (x: 78.5% W, y: 78% H)
  const roadRadius = Math.floor(0.018 * W); // Path thickness

  for (let t = 0; t <= 1; t += 0.005) {
    // Quadratic Bezier curve
    const startX = 0.715 * W;
    const startY = 0.740 * H;
    const ctrlX  = 0.730 * W;
    const ctrlY  = 0.785 * H;
    const endX   = 0.785 * W;
    const endY   = 0.780 * H;

    const cx = Math.floor((1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ctrlX + t * t * endX);
    const cy = Math.floor((1 - t) * (1 - t) * startY + 2 * (1 - t) * t * ctrlY + t * t * endY);

    for (let dx = -roadRadius; dx <= roadRadius; dx++) {
      for (let dy = -roadRadius; dy <= roadRadius; dy++) {
        const px = cx + dx;
        const py = cy + dy;
        if (px >= 0 && px < W && py >= 0 && py < H) {
          const dist = Math.hypot(dx, dy);
          if (dist <= roadRadius) {
            const idx = (py * W + px) * 4;
            const isBorder = (dist >= roadRadius - 2.5);
            img.bitmap.data[idx + 0] = isBorder ? borderR : sandR;
            img.bitmap.data[idx + 1] = isBorder ? borderG : sandG;
            img.bitmap.data[idx + 2] = isBorder ? borderB : sandB;
            img.bitmap.data[idx + 3] = 255;
          }
        }
      }
    }
  }

  await img.write(roadsPath);
  console.log(`Successfully updated map-roads.png with 3 requested road edits!`);
}

editStep2RoadsUserRequest().catch(console.error);
