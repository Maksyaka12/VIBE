import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROLES = [
  // 0..3 Whitelist Team
  { id: 0, name: 'Vibe Club: #000 Genesis Founder', role: 'Genesis Founder', outfit: 'Gold Crown & Royal Cape', tier: 'Phase 0: Whitelist Free' },
  { id: 1, name: 'Vibe Club: #001 Base Legend (Jesse)', role: 'Base Legend', outfit: 'Blue Base Hoodie & Glasses', tier: 'Phase 0: Whitelist Free' },
  { id: 2, name: 'Vibe Club: #002 Lead Architect', role: 'Lead Architect', outfit: 'Cyber Visor & Matrix Robe', tier: 'Phase 0: Whitelist Free' },
  { id: 3, name: 'Vibe Club: #003 Master Viber', role: 'Master Viber', outfit: 'Diamond Armor & Neon Wings', tier: 'Phase 0: Whitelist Free' },

  // 4..333 Public Collection (330 Unique Roles)
  { role: 'Footballer', outfit: 'Number 10 Jersey & Cleats', emoji: '⚽' },
  { role: 'Chef', outfit: 'Chef Hat & Golden Spatula', emoji: '👨‍🍳' },
  { role: 'Swimmer', outfit: 'Goggles & Gold Medal', emoji: '🏊' },
  { role: 'Dancer', outfit: 'Disco Jacket & Light Shoes', emoji: '🕺' },
  { role: 'Clown', outfit: 'Rainbow Wig & Red Nose', emoji: '🤡' },
  { role: 'WallStreet Bull', outfit: 'Financial Suit & Horns', emoji: '🐂' },
  { role: 'Astronaut', outfit: 'Space Helmet & Oxygen Tank', emoji: '👨‍🚀' },
  { role: 'Ninja', outfit: 'Black Hood & Katana', emoji: '🥷' },
  { role: 'Cowboy', outfit: 'Stetson Hat & Leather Vest', emoji: '🤠' },
  { role: 'Samurai', outfit: 'Red Kabuto & Honor Blade', emoji: '⚔️' },
  { role: 'Aviator', outfit: 'Flight Goggles & Leather Jacket', emoji: '🕶️' },
  { role: 'Detective', outfit: 'Trench Coat & Magnifying Glass', emoji: '🕵️' },
  { role: 'Wizard', outfit: 'Pointy Star Hat & Magic Wand', emoji: '🧙‍♂️' },
  { role: 'Pirate', outfit: 'Eye Patch & Skull Tricorne', emoji: '🏴‍☠️' },
  { role: 'Cyborg', outfit: 'Laser Eye & Robotic Arm', emoji: '🤖' },
  { role: 'DJ Viber', outfit: 'Gold Headphones & Turntable', emoji: '🎧' },
  { role: 'Doctor', outfit: 'Stethoscope & Medical Coat', emoji: '👨‍⚕️' },
  { role: 'Firefighter', outfit: 'Yellow Helmet & Hose', emoji: '👨‍🚒' },
  { role: 'Rock Star', outfit: 'Electric Guitar & Leather Studs', emoji: '🎸' },
  { role: 'Viking', outfit: 'Horned Helmet & Battle Axe', emoji: '🪓' },
  { role: 'Pharaoh', outfit: 'Golden Nemes & Scepter', emoji: '👑' },
  { role: 'Superhero', outfit: 'Red Cape & Power Emblem', emoji: '🦸' },
  { role: 'Pilot', outfit: 'Captain Hat & Aviator Shades', emoji: '👨‍✈️' },
  { role: 'Skater', outfit: 'Snapback Hat & Custom Deck', emoji: '🛹' },
  { role: 'Gamer', outfit: 'RGB Headset & Pro Controller', emoji: '🎮' },
  { role: 'Boxer', outfit: 'Red Gloves & Championship Belt', emoji: '🥊' },
  { role: 'Cyberpunk', outfit: 'Neon Mohawk & Cyber Implants', emoji: '⚡' },
  { role: 'Gold Miner', outfit: 'Pickaxe & Mining Lamp Helmet', emoji: '⛏️' },
  { role: 'Police Officer', outfit: 'Badge & Officer Cap', emoji: '👮' },
  { role: 'Sailor', outfit: 'White Sailor Cap & Anchor Tattoo', emoji: '⚓' },
  { role: 'Knight', outfit: 'Shining Steel Armor & Shield', emoji: '🛡️' },
  { role: 'Basketball Pro', outfit: 'High Tops & Golden Ball', emoji: '🏀' },
  { role: 'Tennis Champion', outfit: 'Headband & Carbon Racket', emoji: '🎾' },
  { role: 'F1 Racer', outfit: 'Racing Helmet & Fireproof Suit', emoji: '🏎️' },
  { role: 'Deep Scuba Diver', outfit: 'Diving Mask & Harpoon', emoji: '🤿' },
  { role: 'Karate Master', outfit: 'Black Belt & Gi Uniform', emoji: '🥋' },
  { role: 'Jazz Musician', outfit: 'Saxophone & Fedora', emoji: '🎷' },
  { role: 'Painter Artist', outfit: 'Beret & Palette Canvas', emoji: '🎨' },
  { role: 'Mad Scientist', outfit: 'Lab Coat & Glowing Flask', emoji: '🧪' },
  { role: 'Space Explorer', outfit: 'Solar Suit & Plasma Jetpack', emoji: '🚀' },
  { role: 'Ethical Hacker', outfit: 'Black Hoodie & Matrix Laptop', emoji: '💻' },
  { role: 'Bank Governor', outfit: 'Top Hat & Monocle', emoji: '🎩' },
  { role: 'Crypto Trader', outfit: '3 Screens & Energy Drink', emoji: '📊' },
  { role: 'Whale Holder', outfit: 'Crown & Blue Whale Aura', emoji: '🐋' },
  { role: 'Base Builder', outfit: 'Construction Helmet & Blueprint', emoji: '🏗️' },
  { role: 'Diamond Hands', outfit: 'Diamond Gauntlets & Crystal Aura', emoji: '💎' },
  { role: 'Meme Lord', outfit: 'Pepe Glasses & Gold Chain', emoji: '🐸' },
  { role: 'Astral Wizard', outfit: 'Galaxy Cloak & Celestial Orb', emoji: '🔮' },
  { role: 'Ghost Buster', outfit: 'Proton Pack & Ecto Goggles', emoji: '👻' },
  { role: 'Gladiator', outfit: 'Roman Helmet & Trident', emoji: '🔱' },
];

// Additional descriptors to procedurally generate 330 rich unique roles
const PREFIXES = ['Neon', 'Cyber', 'Golden', 'Royal', 'Base', 'Galactic', 'Shadow', 'Solar', 'Ultra', 'Hyper', 'Stealth', 'Cosmic', 'Quantum', 'Legendary', 'Vibe'];
const SUFFIXES = ['Master', 'Pro', 'Legend', 'Viber', 'Champion', 'Hero', 'Lord', 'King', 'Officer', 'Expert', 'Captain', 'Guardian', 'Titan', 'Boss'];

const collection = [];

// Push 0..3 Whitelist
for (let i = 0; i < 4; i++) {
  collection.push({
    tokenId: i,
    name: ROLES[i].name,
    role: ROLES[i].role,
    outfit: ROLES[i].outfit,
    tier: ROLES[i].tier,
    price: 'FREE (Whitelist)',
    image: `/nft/images/nft_${String(i).padStart(3, '0')}.jpg`,
    attributes: [
      { trait_type: 'Role', value: ROLES[i].role },
      { trait_type: 'Outfit', value: ROLES[i].outfit },
      { trait_type: 'Rarity', value: 'Mythic Whitelist' },
      { trait_type: 'Phase', value: 'Phase 0: Whitelist Free' }
    ]
  });
}

// Push 4..333 (330 Public Mints)
let roleIdx = 4;
for (let i = 4; i < 334; i++) {
  let base = ROLES[roleIdx];
  let roleName = base ? base.role : `Viber #${i}`;
  let outfitName = base ? base.outfit : `Custom Gear #${i}`;
  let emoji = base ? base.emoji : '🐾';

  if (!base) {
    const prefix = PREFIXES[i % PREFIXES.length];
    const suffix = SUFFIXES[i % SUFFIXES.length];
    roleName = `${prefix} ${ROLES[4 + (i % 45)].role}`;
    outfitName = `${prefix} ${ROLES[4 + (i % 45)].outfit} with ${suffix} Badge`;
    emoji = ROLES[4 + (i % 45)].emoji || '⚡';
  }

  let phaseName = 'Phase 1: Early Birds';
  let price = '0.005 ETH';
  let rarity = 'Common';

  if (i >= 4 && i <= 103) {
    phaseName = 'Phase 1: Early Birds';
    price = '0.005 ETH';
    rarity = 'Rare';
  } else if (i >= 104 && i <= 203) {
    phaseName = 'Phase 2: Enthusiasts';
    price = '0.015 ETH';
    rarity = 'Epic';
  } else if (i >= 204 && i <= 303) {
    phaseName = 'Phase 3: Legends';
    price = '0.05 ETH';
    rarity = 'Legendary';
  } else {
    phaseName = 'Phase 4: Final Tier';
    price = '0.1 ETH';
    rarity = 'Mythic';
  }

  const paddedId = String(i).padStart(3, '0');
  collection.push({
    tokenId: i,
    name: `Vibe Club: #${paddedId} ${roleName}`,
    role: roleName,
    outfit: outfitName,
    emoji: emoji,
    tier: phaseName,
    price: price,
    image: `/nft/images/nft_${paddedId}.jpg`,
    attributes: [
      { trait_type: 'Role', value: roleName },
      { trait_type: 'Outfit', value: outfitName },
      { trait_type: 'Rarity', value: rarity },
      { trait_type: 'Phase', value: phaseName }
    ]
  });

  roleIdx++;
}

const outDir = path.join(__dirname, '../public/nft');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'collection.json'), JSON.stringify(collection, null, 2));
console.log(`Generated ${collection.length} Genesis NFTs in public/nft/collection.json!`);
