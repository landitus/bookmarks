import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

// Create a simple "P" icon with dark background
async function generateIcon(size) {
  // Calculate proportions
  const fontSize = Math.round(size * 0.6);
  const cornerRadius = Math.round(size * 0.2);

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="#18181b"/>
      <text 
        x="50%" 
        y="68%" 
        font-size="${fontSize}" 
        font-weight="bold" 
        text-anchor="middle" 
        fill="white" 
        font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
      >P</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(publicDir, `icon-${size}.png`));

  console.log(`Generated icon-${size}.png`);
}

// Generate all sizes
async function main() {
  await generateIcon(16);
  await generateIcon(48);
  await generateIcon(128);
  console.log("All icons generated!");
}

main().catch(console.error);
