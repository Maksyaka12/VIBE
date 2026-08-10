import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectDir = path.join(__dirname, '..');
const traitsDir = path.join(projectDir, 'VibeNFTCollection');
const outImagesDir = path.join(projectDir, 'public/nft/images');
const outMetaDir = path.join(projectDir, 'public/nft/metadata');

// Ensure output directories exist
[traitsDir, outImagesDir, outMetaDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function prepareTraits() {
  console.log('🎨 Preparing Trait Layers in 2000x2000 PNG format...');

  const W = 1000;
  const H = 1000;

  // 0. Backgrounds
  const bgBlue = new Jimp({ width: W, height: H, color: 0x0a37dbff });
  await bgBlue.write(path.join(traitsDir, '0_Backgrounds/Royal_Blue.png'));

  const bgSpace = new Jimp({ width: W, height: H, color: 0x020b26ff });
  // Add subtle star dots to space background
  for (let i = 0; i < 200; i++) {
    const rx = Math.floor(Math.random() * W);
    const ry = Math.floor(Math.random() * H);
    bgSpace.setPixelColor(0xffffffff, rx, ry);
  }
  await bgSpace.write(path.join(traitsDir, '0_Backgrounds/Space.png'));

  const bgNeon = new Jimp({ width: W, height: H, color: 0x1a0033ff });
  await bgNeon.write(path.join(traitsDir, '0_Backgrounds/Neon.png'));

  const bgGold = new Jimp({ width: W, height: H, color: 0x332200ff });
  await bgGold.write(path.join(traitsDir, '0_Backgrounds/Gold.png'));

  // 1. Base Dog (Using vibe-dog.jpg)
  const vibeDog = await Jimp.read(path.join(projectDir, 'public/vibe-dog.jpg'));
  vibeDog.resize({ w: 700, h: 700 });

  const baseDogOpen = new Jimp({ width: W, height: H, color: 0x00000000 });
  baseDogOpen.composite(vibeDog, 150, 150);
  await baseDogOpen.write(path.join(traitsDir, '1_Base/Dog_Original.png'));

  // 2. Hats (Overlay Elements)
  const hatTop = new Jimp({ width: W, height: H, color: 0x00000000 });
  // Draw Top Hat overlay
  const hatImg = new Jimp({ width: 300, height: 150, color: 0x880044ff });
  hatTop.composite(hatImg, 350, 120);
  await hatTop.write(path.join(traitsDir, '2_Hats/Top_Hat.png'));

  const hatCrown = new Jimp({ width: W, height: H, color: 0x00000000 });
  const crownImg = new Jimp({ width: 260, height: 140, color: 0xffd700ff });
  hatCrown.composite(crownImg, 370, 110);
  await hatCrown.write(path.join(traitsDir, '2_Hats/Crown.png'));

  const hatNone = new Jimp({ width: W, height: H, color: 0x00000000 });
  await hatNone.write(path.join(traitsDir, '2_Hats/None.png'));

  // 3. Eyes
  const eyesAviators = new Jimp({ width: W, height: H, color: 0x00000000 });
  const shades = new Jimp({ width: 320, height: 100, color: 0x111111ff });
  eyesAviators.composite(shades, 340, 360);
  await eyesAviators.write(path.join(traitsDir, '3_Eyes/Aviators.png'));

  const eyesCyber = new Jimp({ width: W, height: H, color: 0x00000000 });
  const cyberVisor = new Jimp({ width: 340, height: 80, color: 0x00f5ffff });
  eyesCyber.composite(cyberVisor, 330, 370);
  await eyesCyber.write(path.join(traitsDir, '3_Eyes/Cyber_Visor.png'));

  const eyesNone = new Jimp({ width: W, height: H, color: 0x00000000 });
  await eyesNone.write(path.join(traitsDir, '3_Eyes/None.png'));

  // 4. Neck
  const neckGoldChain = new Jimp({ width: W, height: H, color: 0x00000000 });
  const chain = new Jimp({ width: 400, height: 90, color: 0xffd700ff });
  neckGoldChain.composite(chain, 300, 680);
  await neckGoldChain.write(path.join(traitsDir, '4_Neck/Gold_Chain.png'));

  const neckBowTie = new Jimp({ width: W, height: H, color: 0x00000000 });
  const bow = new Jimp({ width: 220, height: 110, color: 0xff007fff });
  neckBowTie.composite(bow, 390, 690);
  await neckBowTie.write(path.join(traitsDir, '4_Neck/Bow_Tie.png'));

  const neckNone = new Jimp({ width: W, height: H, color: 0x00000000 });
  await neckNone.write(path.join(traitsDir, '4_Neck/None.png'));

  console.log('✅ All Trait Layers created successfully!');
}

async function compositeCollection() {
  console.log('⚡ Starting Trait-Based Compositing Engine for 334 NFTs...');

  const bgFiles = ['Royal_Blue.png', 'Space.png', 'Neon.png', 'Gold.png'];
  const hatFiles = ['Top_Hat.png', 'Crown.png', 'None.png'];
  const eyesFiles = ['Aviators.png', 'Cyber_Visor.png', 'None.png'];
  const neckFiles = ['Gold_Chain.png', 'Bow_Tie.png', 'None.png'];

  const collection = [];

  for (let i = 1; i <= 334; i++) {
    const bgName = bgFiles[(i - 1) % bgFiles.length];
    const hatName = hatFiles[(i - 1 + Math.floor(i / 3)) % hatFiles.length];
    const eyesName = eyesFiles[(i - 1 + Math.floor(i / 5)) % eyesFiles.length];
    const neckName = neckFiles[(i - 1 + Math.floor(i / 7)) % neckFiles.length];

    const bgImg = await Jimp.read(path.join(traitsDir, '0_Backgrounds', bgName));
    const baseImg = await Jimp.read(path.join(traitsDir, '1_Base/Dog_Original.png'));
    const neckImg = await Jimp.read(path.join(traitsDir, '4_Neck', neckName));
    const eyesImg = await Jimp.read(path.join(traitsDir, '3_Eyes', eyesName));
    const hatImg = await Jimp.read(path.join(traitsDir, '2_Hats', hatName));

    // Stack layers in exact order: 0_Background -> 1_Base -> 4_Neck -> 3_Eyes -> 2_Hats
    const finalCard = bgImg.clone();
    finalCard.composite(baseImg, 0, 0);
    finalCard.composite(neckImg, 0, 0);
    finalCard.composite(eyesImg, 0, 0);
    finalCard.composite(hatImg, 0, 0);

    const outPngName = `${i}.png`;
    const outJsonName = `${i}.json`;

    await finalCard.write(path.join(outImagesDir, outPngName));

    const metadata = {
      name: `$VIBE NFT #${i}`,
      description: `Genesis Vibe Club NFT #${i} on Base`,
      image: `ipfs://YOUR_CID/${i}.png`,
      attributes: [
        { trait_type: 'Background', value: bgName.replace('.png', '') },
        { trait_type: 'Base', value: 'Original Maltipoo' },
        { trait_type: 'Hat', value: hatName.replace('.png', '') },
        { trait_type: 'Eyewear', value: eyesName.replace('.png', '') },
        { trait_type: 'Neck', value: neckName.replace('.png', '') }
      ]
    };

    fs.writeFileSync(path.join(outMetaDir, outJsonName), JSON.stringify(metadata, null, 2));
    collection.push(metadata);

    if (i % 25 === 0 || i === 334) {
      console.log(`[${i}/334] Composited ${outPngName} & ${outJsonName}!`);
    }
  }

  fs.writeFileSync(path.join(projectDir, 'public/nft/collection.json'), JSON.stringify(collection, null, 2));
  console.log('🎉 334 NFT PNG IMAGES & 334 JSON METADATA FILES GENERATED SUCCESSFULLY!');
}

async function run() {
  await prepareTraits();
  await compositeCollection();
}

run().catch(console.error);
