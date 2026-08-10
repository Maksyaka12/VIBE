const fs = require('fs');
const path = require('path');

const src = "C:/Users/builder/.gemini/antigravity/brain/be1b603b-2161-4e2c-9125-ecbafbf2febb/map_bg_erase_2_right_trees_1786319055077.jpg";
const dest = "C:/Users/builder/Desktop/vibe/frontend/public/map-bg.jpg";

fs.copyFileSync(src, dest);
console.log(`Successfully rolled back terrain background ${src} -> ${dest}`);
