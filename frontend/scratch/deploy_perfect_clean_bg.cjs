const fs = require('fs');
const path = require('path');

const src = "C:/Users/builder/.gemini/antigravity/brain/be1b603b-2161-4e2c-9125-ecbafbf2febb/map_bg_perfect_clean_1786318825442.jpg";
const dest = "C:/Users/builder/Desktop/vibe/frontend/public/map-bg.jpg";

fs.copyFileSync(src, dest);
console.log(`Successfully deployed perfect clean terrain image ${src} -> ${dest}`);
