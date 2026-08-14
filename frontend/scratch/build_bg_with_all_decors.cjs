const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function buildBgWithAllDecors() {
  const mapPath = "C:/Users/builder/Desktop/vibe/frontend/public/verse-map.jpg";
  const targetBgPath = "C:/Users/builder/Desktop/vibe/frontend/public/map-bg.jpg";

  console.log(`Loading original verse-map.jpg to preserve all fences, lanterns, signs, and decors...`);
  const mapImg = await Jimp.read(mapPath);
  const W = mapImg.bitmap.width;
  const H = mapImg.bitmap.height;

  // Sample clean grass patch (from x: 48%, y: 38%)
  const sampleX = Math.floor(0.48 * W);
  const sampleY = Math.floor(0.38 * H);
  const patchW = 32;
  const patchH = 32;
  const grassPatch = mapImg.clone().crop({ x: sampleX, y: sampleY, w: patchW, h: patchH });

  // Define precise bounding boxes for ONLY the main building structures (roofs/walls) to remove:
  const buildingBodiesToRemove = [
    // 1. Vibe Arena Stadium structure (x: 18%..39%, y: 10%..36%)
    { name: 'Arena Stadium', minX: Math.floor(0.18 * W), maxX: Math.floor(0.39 * W), minY: Math.floor(0.10 * H), maxY: Math.floor(0.36 * H) },

    // 2. Vibe Bank Vault building (x: 18%..30%, y: 41%..59%)
    { name: 'Bank Vault', minX: Math.floor(0.18 * W), maxX: Math.floor(0.30 * W), minY: Math.floor(0.41 * H), maxY: Math.floor(0.59 * H) },

    // 3. Poster Office 2-story brick building (x: 48%..62%, y: 12%..32%)
    { name: 'Poster Building', minX: Math.floor(0.48 * W), maxX: Math.floor(0.62 * W), minY: Math.floor(0.12 * H), maxY: Math.floor(0.32 * H) },

    // 4. Home Doghouse structure (x: 46%..54%, y: 44%..58%)
    { name: 'Doghouse Roof', minX: Math.floor(0.46 * W), maxX: Math.floor(0.54 * W), minY: Math.floor(0.44 * H), maxY: Math.floor(0.58 * H) },

    // 5. DeFi Glass Skyscraper building (x: 72%..85%, y: 30%..58%)
    { name: 'DeFi Skyscraper', minX: Math.floor(0.72 * W), maxX: Math.floor(0.85 * W), minY: Math.floor(0.30 * H), maxY: Math.floor(0.58 * H) }
  ];

  for (const bld of buildingBodiesToRemove) {
    console.log(`Erasing ${bld.name} body (x: ${bld.minX}..${bld.maxX}, y: ${bld.minY}..${bld.maxY})...`);
    for (let x = bld.minX; x < bld.maxX; x += patchW) {
      for (let y = bld.minY; y < bld.maxY; y += patchH) {
        const blitW = Math.min(patchW, bld.maxX - x);
        const blitH = Math.min(patchH, bld.maxY - y);
        mapImg.blit({ src: grassPatch, x, y, srcX: 0, srcY: 0, srcW: blitW, srcH: blitH });
      }
    }
  }

  await mapImg.write(targetBgPath);
  console.log(`Successfully updated ${targetBgPath} keeping all fences, lanterns, benches, signs, and decors!`);
}

buildBgWithAllDecors().catch(console.error);
