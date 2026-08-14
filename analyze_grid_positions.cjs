const fs = require('fs');
const path = require('path');
const { Jimp } = require('./frontend/node_modules/jimp');

async function analyzeGridPositions() {
  const dir = path.join(__dirname, 'frontend', 'public', 'nft');

  for (const filename of ['nova.jfif', 'nova2.jfif']) {
    const img = await Jimp.read(path.join(dir, filename));
    const W = img.bitmap.width; // 2752
    const H = img.bitmap.height; // 1536

    console.log(`\n================================`);
    console.log(`Analyzing ${filename} (${W}x${H})...`);

    // Let's sample horizontal row at Y = 200 (top tiles)
    // Find where the blue background starts/ends or where vertical black separator lines are
    const verticalLines = [];
    for (let x = 10; x < W - 10; x++) {
      // Check column x from y=100 to y=400: is it black (line)?
      let darkCount = 0;
      for (let y = 100; y < 400; y += 10) {
        const p = img.getPixelColor(x, y);
        const r = (p >> 24) & 255;
        const g = (p >> 16) & 255;
        const b = (p >> 8) & 255;
        if (r < 20 && g < 20 && b < 20) darkCount++;
      }
      if (darkCount > 25) {
        verticalLines.push(x);
      }
    }

    // Group adjacent dark column coordinates
    const colDividers = [];
    if (verticalLines.length > 0) {
      let group = [verticalLines[0]];
      for (let i = 1; i < verticalLines.length; i++) {
        if (verticalLines[i] - verticalLines[i - 1] <= 3) {
          group.push(verticalLines[i]);
        } else {
          colDividers.push(Math.round(group.reduce((a, b) => a + b, 0) / group.length));
          group = [verticalLines[i]];
        }
      }
      colDividers.push(Math.round(group.reduce((a, b) => a + b, 0) / group.length));
    }

    console.log(`Detected vertical column dividers (X coords):`, colDividers);

    // Horizontal line detection
    const horizontalLines = [];
    for (let y = 10; y < H - 10; y++) {
      let darkCount = 0;
      for (let x = 200; x < W - 200; x += 30) {
        const p = img.getPixelColor(x, y);
        const r = (p >> 24) & 255;
        const g = (p >> 16) & 255;
        const b = (p >> 8) & 255;
        if (r < 20 && g < 20 && b < 20) darkCount++;
      }
      if (darkCount > 50) {
        horizontalLines.push(y);
      }
    }

    const rowDividers = [];
    if (horizontalLines.length > 0) {
      let group = [horizontalLines[0]];
      for (let i = 1; i < horizontalLines.length; i++) {
        if (horizontalLines[i] - horizontalLines[i - 1] <= 3) {
          group.push(horizontalLines[i]);
        } else {
          rowDividers.push(Math.round(group.reduce((a, b) => a + b, 0) / group.length));
          group = [horizontalLines[i]];
        }
      }
      rowDividers.push(Math.round(group.reduce((a, b) => a + b, 0) / group.length));
    }

    console.log(`Detected horizontal row dividers (Y coords):`, rowDividers);
  }
}

analyzeGridPositions().catch(console.error);
