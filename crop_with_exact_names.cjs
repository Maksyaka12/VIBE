const fs = require('fs');
const path = require('path');
const { Jimp } = require('./frontend/node_modules/jimp');
const { createWorker } = require('./frontend/node_modules/tesseract.js');

const INPUT_DIR = path.join(__dirname, 'frontend', 'public', 'nft');
const OUTPUT_DIR = path.join(__dirname, 'frontend', 'public', 'nft', 'images');

// Ensure clean output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
} else {
  // Clear old numeric files
  const old = fs.readdirSync(OUTPUT_DIR);
  for (const f of old) {
    fs.unlinkSync(path.join(OUTPUT_DIR, f));
  }
}

// Canonical traits for fallback / cleanup
const CANONICAL_TRAITS = {
  1: "Astronaut", 2: "Gamer", 3: "Skater", 4: "Cyborg", 5: "Rapper", 6: "Hippie", 7: "Zombie", 8: "Pilot", 9: "Detective",
  10: "Doctor", 11: "Chef", 12: "Firefighter", 13: "Police Officer", 14: "Astronaut", 15: "Gamer", 16: "Skater", 17: "Cyborg", 18: "Rapper", 19: "Crypto Trader",
  20: "Zombie", 21: "Pilot", 22: "Detective", 23: "Satoshi Nakamoto", 24: "Bull Market King", 25: "Bear Hunter", 26: "Pepe Dog", 27: "Web3 Whale",
  28: "Footballer", 29: "Basketballer", 30: "Boxer", 31: "Tennis Player", 32: "Cyclist", 33: "Golfer", 34: "Karate Master", 35: "Ninja", 36: "Surfer",
  37: "Rock Star", 38: "DJ", 39: "Opera Singer", 40: "Punk Rocker", 41: "Jazz Musician", 42: "Reggae Dog", 43: "Pop Diva", 44: "Drummer", 45: "Electric Guitarist",
  46: "Vampire", 47: "Mummy", 48: "Alien Extra-terrestrial", 49: "Knight", 50: "Viking Warrior", 51: "Pirate Captain", 52: "Egyptian Pharaoh", 53: "Greek Zeus God", 54: "Cyberpunk Mercenary",
  55: "Mexican Amigo", 56: "Cowboy", 57: "Sheik Sultan", 58: "Gentleman", 59: "80s Retro Disco", 60: "Medieval King", 61: "Emperor Caesar", 62: "Wizard Gandalf", 63: "Samurai",
  64: "Barista", 65: "Baker", 66: "Sailor Captain", 67: "Football Referee", 68: "Formula 1 Driver", 69: "Astronaut Moonwalker", 70: "Deep Sea Diver", 71: "Shadow Ninja", 72: "Sheriff",
  73: "Angel", 74: "Devil", 75: "Santa Claus", 76: "Elf", 77: "Werewolf", 78: "Frankenstein", 79: "Skeleton", 80: "Ghost", 81: "Sorcerer",
  82: "Programmer", 83: "Hacker", 84: "Pro Gamer", 85: "VR Explorer", 86: "Streamer", 87: "Tech CEO", 88: "Cybernetic Agent", 89: "Android Robot", 90: "Hologram Dog",
  91: "Fisherman", 92: "Farmer", 93: "Gardener", 94: "Lumberjack", 95: "Miner", 96: "Safari Explorer", 97: "Mountain Climber", 98: "Camper", 99: "Skydiver",
  100: "Painter Artist", 101: "Photographer", 102: "Sculptor", 103: "Film Director", 104: "Magician", 105: "Circus Clown", 106: "Ringmaster", 107: "Acrobat", 108: "Jester",
  109: "Basketball Legend", 110: "Ice Hockey Player", 111: "Baseball Batter", 112: "American Footballer", 113: "Olympic Runner", 114: "Swimmer", 115: "Skateboarder Trick", 116: "Snowboarder", 117: "Motocross Racer",
  118: "Matrix Neo", 119: "Terminator", 120: "Star Wars Jedi", 121: "Darth Vader Style", 122: "Iron Armor Hero", 123: "Spider Dog", 124: "Thor God of Thunder", 125: "Captain America", 126: "Hulk Mutant",
  127: "Violinist", 128: "Saxophonist", 129: "Pianist", 130: "Trumpeter", 131: "Heavy Metal Singer", 132: "Country Singer", 133: "Beatboxer", 134: "Sound Engineer", 135: "Vinyl Collector",
  136: "Roman Legionnaire", 137: "Spartan Warrior", 138: "Mongolian Horseman", 139: "Gladiator", 140: "Robin Hood Archer", 141: "Musketeer", 142: "Pirate Quartermaster", 143: "Aztec Chief", 144: "Samurai Daimyo",
  145: "Wall Street Broker", 146: "Venture Capitalist", 147: "Banker", 148: "Gold Miner", 149: "Treasury Guard", 150: "Cashier", 151: "Auctioneer", 152: "Real Estate Mogul", 153: "Casino High Roller",
  154: "Flight Attendant", 155: "Train Conductor", 156: "Bus Driver", 157: "Helicopter Pilot", 158: "Submarine Captain", 159: "Spaceship Commander", 160: "Race Mechanic", 161: "Taxi Driver", 162: "Space Station Tech",
  163: "Sherlock Holmes", 164: "Agent 007", 165: "Bodyguard", 166: "SWAT Officer", 167: "Coast Guard", 168: "Park Ranger", 169: "Private Detective", 170: "Inspector", 171: "Cipher Expert",
  172: "Professor", 173: "Mathematician", 174: "Chemist", 175: "Astronomer", 176: "Archaeologist", 177: "Historian", 178: "Biologist", 179: "Physicist", 180: "Philosopher",
  181: "Sushi Chef", 182: "Pizza Maker", 183: "Burger Master", 184: "Ice Cream Artisan", 185: "Sommelier", 186: "Chocolatier", 187: "Bartender", 188: "BBQ Pitmaster", 189: "Waiter",
  190: "Fashion Designer", 191: "Supermodel", 192: "Tailor", 193: "Barber", 194: "Tattoo Artist", 195: "Jeweler", 196: "Stylist", 197: "Vintage Collector", 198: "Streetwear Hypebeast",
  199: "Sumo Wrestler", 200: "MMA Fighter", 201: "Taekwondo Master", 202: "Master Archer", 203: "Fencer", 204: "Weightlifter", 205: "Gym Fitness Trainer", 206: "Marathon Runner", 207: "Skydiver Pro",
  208: "Disco Fever 70s", 209: "Hippie Peace 60s", 210: "Neon 80s Rocker", 211: "90s Hip-Hop", 212: "Y2K Cyber Kid", 213: "Arcade Gamer", 214: "1920s Mafia Mobster", 215: "Victorian Lord", 216: "Renaissance Prince",
  217: "Dragon Rider", 218: "Phoenix Wizard", 219: "Druid", 220: "Necromancer", 221: "Paladin", 222: "Bard", 223: "Rogue Assassin", 224: "Goblin Miner", 225: "Orc Chieftain",
  226: "Cyber Cop", 227: "Neon Racer", 228: "Mech Pilot", 229: "Space Smuggler", 230: "Galaxy Explorer", 231: "Time Traveler", 232: "Quantum Scientist", 233: "AI Core Master", 234: "Drone Operator",
  235: "News Anchor", 236: "Journalist", 237: "Podcast Host", 238: "Radio DJ", 239: "Movie Director", 240: "Cameraman", 241: "Movie Star", 242: "Red Carpet Celebrity", 243: "TikTok Influencer",
  244: "Paramedic", 245: "Surgeon", 246: "Dentist", 247: "Veterinarian", 248: "Nurse", 249: "Pharmacist", 250: "Fitness Coach", 251: "Yoga Master", 252: "Spa Specialist",
  253: "Fire Captain", 254: "Rescue Scuba", 255: "Lifeguard", 256: "Mountain Rescue", 257: "First Responder", 258: "Smokejumper", 259: "Patrol Officer", 260: "K9 Partner", 261: "Coast Rescue",
  262: "Chess Grandmaster", 263: "Esports Champion", 264: "Board Game Strategist", 265: "Poker Pro", 266: "Bowling Champion", 267: "Billiards Master", 268: "Darts Champion", 269: "Archery Master", 270: "Domino King",
  271: "Sailor", 272: "Cruise Captain", 273: "Yacht Master", 274: "Kayaker", 275: "Windsurfer", 276: "Jet Ski Racer", 277: "Deep Diver", 278: "Fishing Boat Captain", 279: "Island Navigator",
  280: "Space Engineer", 281: "Rocket Scientist", 282: "Satellite Tech", 283: "Rover Operator", 284: "Starship Navigator", 285: "Cosmic Explorer", 286: "Asteroid Miner", 287: "Alien Ambassador", 288: "Quantum Voyager",
  289: "Master Tailor", 290: "Shoemaker", 291: "Clockmaker", 292: "Blacksmith", 293: "Carpenter", 294: "Glassblower", 295: "Jeweler Artisan", 296: "Potter", 297: "Weaver",
  298: "Hip Hop Dancer", 299: "Breakdancer", 300: "Ballet Dancer", 301: "Salsa Dancer", 302: "Tango Master", 303: "Street Performer", 304: "Beatbox Champion", 305: "DJ Turntablist", 306: "Hype Man",
  307: "Royal King", 308: "Queen Sovereign", 309: "Crown Prince", 310: "Duke", 311: "Baron", 312: "Knight Commander", 313: "Royal Guard", 314: "Court Jester", 315: "High Chancellor",
  316: "Gold Vault Guardian", 317: "Crypto Security Expert", 318: "Hardware Wallet Dev", 319: "Blockchain Validator", 320: "Smart Contract Auditor", 321: "DeFi Architect", 322: "Web3 Builder", 323: "DAO President", 324: "VIBE Veteran",
  325: "Maltipoo Supreme", 326: "VibeVerse Founder", 327: "Master Doge Vibe", 328: "Genesis #328 Legend", 329: "Genesis #329 Boss", 330: "Golden Vibe King", 331: "Diamond Dog", 332: "Crown Maltipoo", 333: "ULTRA RARE GENESIS #333"
};

function cleanTraitName(ocrText, number) {
  // If we have canonical trait for this number, prefer it for 100% cleanliness
  if (CANONICAL_TRAITS[number]) {
    return CANONICAL_TRAITS[number];
  }
  
  // Extract trait after number
  const clean = ocrText.replace(/[\r\n]+/g, ' ').trim();
  const m = clean.match(/#\d+\s+(.*)/i);
  if (m && m[1]) {
    return m[1].replace(/[^A-Za-z0-9\s\-]/g, '').trim();
  }
  return `NFT ${number}`;
}

async function runPreciseNamedCropping() {
  console.log('Initializing Tesseract OCR worker...');
  const worker = await createWorker('eng');

  const allFiles = fs.readdirSync(INPUT_DIR).filter(f => {
    const fullPath = path.join(INPUT_DIR, f);
    return fs.statSync(fullPath).isFile() && 
           /\.(jfif|png|jpg|jpeg|webp)$/i.test(f) && 
           !f.startsWith('test') &&
           !f.startsWith('tile');
  });

  console.log(`Processing ${allFiles.length} grid images...`);
  const results = [];
  let processedCount = 0;
  const usedNumbers = new Set();

  for (let fIdx = 0; fIdx < allFiles.length; fIdx++) {
    const filename = allFiles[fIdx];
    const filePath = path.join(INPUT_DIR, filename);

    try {
      const img = await Jimp.read(filePath);
      const W = img.bitmap.width;
      const H = img.bitmap.height;

      const cellW = W / 3;
      const cellH = H / 3;

      console.log(`\n[Grid ${fIdx + 1}/${allFiles.length}] Processing ${filename} (${W}x${H})...`);

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const tileIdx = row * 3 + col + 1;

          const x = Math.round(col * cellW);
          const y = Math.round(row * cellH);
          const w = Math.round(cellW);
          const h = Math.round(cellH);

          // 1. Crop banner for OCR
          const bannerH = Math.round(h * 0.16);
          const bannerY = y + h - bannerH;
          const banner = img.clone().crop({ x, y: bannerY, w, h: bannerH });
          const buf = await banner.getBuffer('image/png');
          const ocrRes = await worker.recognize(buf);
          const rawOcr = ocrRes.data.text.trim().replace(/[\r\n]+/g, ' ');

          // Extract number from OCR
          const numMatch = rawOcr.match(/#(\d+)/);
          let nftNumber = numMatch ? parseInt(numMatch[1], 10) : null;

          // If OCR missed the number, infer from surrounding or global
          if (!nftNumber) {
            nftNumber = processedCount + 1;
          }

          const trait = cleanTraitName(rawOcr, nftNumber);
          
          // Format filenames cleanly (e.g. "Vibe Club - #15 Gamer.png")
          const cleanFileName = `Vibe Club - #${nftNumber} ${trait}.png`;
          const cleanFileNameWin = cleanFileName.replace(/[<>:"/\\|?*]/g, '');

          // 2. Crop clean square avatar image (cutting banner & grid lines)
          const inset = Math.max(4, Math.round(w * 0.012));
          const bannerCut = Math.round(h * 0.14);
          const availableW = w - (inset * 2);
          const availableH = h - inset - bannerCut;
          const squareSize = Math.min(availableW, availableH);

          const cropX = x + inset + Math.round((availableW - squareSize) / 2);
          const cropY = y + inset;

          const cleanAvatar = img.clone().crop({
            x: cropX,
            y: cropY,
            w: squareSize,
            h: squareSize
          });

          cleanAvatar.resize({ w: 600, h: 600 });

          // Save formatted named file
          const outPath = path.join(OUTPUT_DIR, cleanFileNameWin);
          await cleanAvatar.write(outPath);

          processedCount++;
          usedNumbers.add(nftNumber);

          console.log(`  [Tile ${tileIdx}] OCR: "${rawOcr}" -> Saved as: "${cleanFileNameWin}"`);
          
          results.push({
            nftNumber,
            trait,
            fileName: cleanFileNameWin,
            gridFile: filename
          });
        }
      }
    } catch (err) {
      console.error(`Error in ${filename}:`, err);
    }
  }

  await worker.terminate();

  // Save metadata json
  fs.writeFileSync(path.join(OUTPUT_DIR, 'metadata.json'), JSON.stringify(results, null, 2));

  console.log(`\n🎉 COMPLETE! Successfully cropped and named ${processedCount} NFTs in ${OUTPUT_DIR}`);
}

runPreciseNamedCropping().catch(console.error);
