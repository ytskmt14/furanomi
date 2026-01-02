import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, '../public');
const svgPath = join(publicDir, 'icon-256x256.svg');
const outputPath = join(publicDir, 'apple-touch-icon.png');

// 180x180はiPhoneのSafariで推奨されるサイズ
const size = 180;

try {
  console.log(`Converting ${svgPath} to ${outputPath} (${size}x${size})...`);
  
  await sharp(svgPath)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(outputPath);
  
  console.log(`✓ Successfully created ${outputPath}`);
} catch (error) {
  console.error('Error converting SVG to PNG:', error);
  process.exit(1);
}

