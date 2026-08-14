const fs = require('fs');
const path = require('path');

const src = "C:/Users/builder/.gemini/antigravity/brain/be1b603b-2161-4e2c-9125-ecbafbf2febb/vibe_verse_clean_terrain_exact_1786317288064.jpg";
const dest = "C:/Users/builder/Desktop/vibe/frontend/public/map-bg.jpg";

fs.copyFileSync(src, dest);
console.log(`Copied ${src} -> ${dest}`);
