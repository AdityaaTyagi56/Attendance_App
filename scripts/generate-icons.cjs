const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Create a high-resolution icon from SVG
const svgContent = `<svg width="512" height="512" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="6" fill="#004c7a"/>
<path d="M7 17L12 7L17 17" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.5 14H15.5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];

async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  const buildDir = path.join(__dirname, '..', 'build');
  
  // Ensure build directory exists
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  
  // Generate main icon.png (512x512)
  const buffer = Buffer.from(svgContent);
  await sharp(buffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon.png'));
  console.log('Generated public/icon.png (512x512)');
  
  // Copy to build folder as well
  await sharp(buffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(buildDir, 'icon.png'));
  console.log('Generated build/icon.png (512x512)');
  
  // Generate different sizes
  for (const size of sizes) {
    await sharp(buffer)
      .resize(size, size)
      .png()
      .toFile(path.join(buildDir, `icon-${size}.png`));
    console.log(`Generated build/icon-${size}.png`);
  }
  
  console.log('\nAll icons generated successfully!');
  console.log('Note: For Windows .ico file, you may need to use an online converter or png-to-ico package.');
}

generateIcons().catch(console.error);
