import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');
const svgPath = join(publicDir, 'icon.svg');

await mkdir(iconsDir, { recursive: true });

await sharp(svgPath)
  .resize(192, 192)
  .png()
  .toFile(join(iconsDir, 'icon-192.png'));

await sharp(svgPath)
  .resize(512, 512)
  .png()
  .toFile(join(iconsDir, 'icon-512.png'));

console.log('Generated icon-192.png and icon-512.png');
