const Jimp = require('jimp');

async function processImage(inputPath, outputPath) {
  const image = await Jimp.read(inputPath);
  
  const bgHex = image.getPixelColor(0, 0);
  const bgR = Jimp.intToRGBA(bgHex).r;
  const bgG = Jimp.intToRGBA(bgHex).g;
  const bgB = Jimp.intToRGBA(bgHex).b;

  const threshold = 90;

  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    const dist = Math.sqrt(Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2));
    
    if (dist < threshold) {
      this.bitmap.data[idx + 3] = 0; 
    }
  });

  await image.writeAsync(outputPath);
  console.log('Processed ' + outputPath);
}

async function run() {
  try {
    await processImage('../frontend/public/vibe-logo.png', '../frontend/public/vibe-logo-nobg.png');
    await processImage('../frontend/public/vibe-sad-logo.png', '../frontend/public/vibe-sad-logo-nobg.png');
  } catch(e) {
    console.error(e);
  }
}

run();
