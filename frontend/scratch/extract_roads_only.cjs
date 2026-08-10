const { Jimp } = require('jimp');

async function extractRoadsOnly() {
  const versePath = "C:/Users/builder/Desktop/vibe/frontend/public/verse-map.jpg";
  const targetPath = "C:/Users/builder/Desktop/vibe/frontend/public/map-roads.png";

  console.log("Loading verse-map.jpg...");
  const img = await Jimp.read(versePath);
  const W = img.bitmap.width;
  const H = img.bitmap.height;
  console.log(`Image size: ${W}x${H}`);

  // We'll create a new RGBA image (transparent base)
  const out = new Jimp({ width: W, height: H, color: 0x00000000 });

  // ─────────────────────────────────────────────────────────────────────────────
  // STRATEGY:
  // Copy pixels from verse-map.jpg ONLY if they are "road" colored.
  // Road = sandy/earthy warm brown: R ~150-220, G ~100-170, B ~45-120
  //   with R > G+20 and G > B  (warm earthy hue)
  //
  // Also copy pixels of small animals/dogs that walk on roads.
  // Dogs are small white/cream colored animals near road areas.
  // We detect them by looking for non-grass, non-water, non-green pixels
  // within a close proximity to sandy road pixels.
  //
  // Approach: 
  // 1. First pass: mark all road pixels
  // 2. Second pass: mark pixels adjacent to road pixels that are NOT grass/water/tree
  // 3. Copy all marked pixels to output PNG with full opacity
  // ─────────────────────────────────────────────────────────────────────────────

  // --- Pass 1: build road mask ---
  console.log("Pass 1: detecting road pixels...");
  const roadMask = new Uint8Array(W * H); // 1 = road, 0 = not road

  img.scan(0, 0, W, H, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    const isSandyRoad = (
      r >= 148 && r <= 225 &&
      g >= 98  && g <= 172 &&
      b >= 43  && b <= 125 &&
      r > g + 18 &&
      g > b
    );
    if (isSandyRoad) {
      roadMask[y * W + x] = 1;
    }
  });

  // --- Pass 2: detect pixels near road that look like dogs/animals ---
  // Dogs: small white/cream/light tan creatures
  console.log("Pass 2: detecting animals on roads...");
  const animalMask = new Uint8Array(W * H);
  const radius = 18; // pixels radius to search for animals near roads

  img.scan(0, 0, W, H, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    // Animal (dog) colors: white/cream/light tan
    const isAnimal = (
      r >= 200 && g >= 185 && b >= 155 &&  // light/white/cream
      r < 255
    );

    if (!isAnimal) return;

    // Check if there's a road pixel nearby
    let nearRoad = false;
    for (let dy = -radius; dy <= radius && !nearRoad; dy++) {
      for (let dx = -radius; dx <= radius && !nearRoad; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H) {
          if (roadMask[ny * W + nx] === 1) {
            nearRoad = true;
          }
        }
      }
    }
    if (nearRoad) {
      animalMask[y * W + x] = 1;
    }
  });

  // --- Pass 3: copy road + animal pixels to output ---
  console.log("Pass 3: copying road & animal pixels to transparent PNG...");
  img.scan(0, 0, W, H, function(x, y, idx) {
    const i = y * W + x;
    if (roadMask[i] || animalMask[i]) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      const outIdx = (y * W + x) * 4;
      out.bitmap.data[outIdx + 0] = r;
      out.bitmap.data[outIdx + 1] = g;
      out.bitmap.data[outIdx + 2] = b;
      out.bitmap.data[outIdx + 3] = 255; // fully opaque
    }
    // else: stays transparent (0x00000000)
  });

  console.log("Saving transparent roads PNG...");
  await out.write(targetPath);
  console.log(`Done! Saved to: ${targetPath}`);
}

extractRoadsOnly().catch(console.error);
