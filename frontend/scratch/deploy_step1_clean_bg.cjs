const fs = require('fs');
const path = require('path');

const cleanGenImage = "C:/Users/builder/.gemini/antigravity/brain/be1b603b-2161-4e2c-9125-ecbafbf2febb/vibe_verse_clean_terrain_exact_1786317288064.jpg";
const targetBg = "C:/Users/builder/Desktop/vibe/frontend/public/map-bg.jpg";

console.log('Copying clean generated empty island background...');
fs.copyFileSync(cleanGenImage, targetBg);
console.log(`Successfully deployed ${cleanGenImage} -> ${targetBg}`);
