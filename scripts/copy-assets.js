// Copies non-TS assets (icons) from src to dist preserving structure.
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const DIST = path.join(__dirname, '..', 'dist');
const ASSET_EXT = new Set(['.svg', '.png']);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (ASSET_EXT.has(path.extname(entry.name))) {
      const rel = path.relative(SRC, full);
      const dest = path.join(DIST, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(full, dest);
      console.log(`copied ${rel}`);
    }
  }
}

if (fs.existsSync(SRC)) {
  walk(SRC);
}
