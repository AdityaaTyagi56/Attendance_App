const pngToIco = require('png-to-ico').default || require('png-to-ico');
const fs = require('fs');
const path = require('path');

async function createIco() {
  const buildDir = path.join(__dirname, '..', 'build');
  
  // Use multiple PNG sizes for a proper ICO file
  const pngPaths = [
    path.join(buildDir, 'icon-16.png'),
    path.join(buildDir, 'icon-32.png'),
    path.join(buildDir, 'icon-48.png'),
    path.join(buildDir, 'icon-64.png'),
    path.join(buildDir, 'icon-128.png'),
    path.join(buildDir, 'icon-256.png'),
  ];
  
  // Filter to only existing files
  const existingPaths = pngPaths.filter(p => fs.existsSync(p));
  console.log('Using PNG files:', existingPaths);
  
  const icoPath = path.join(buildDir, 'icon.ico');
  
  const buf = await pngToIco(existingPaths);
  fs.writeFileSync(icoPath, buf);
  console.log('Generated build/icon.ico');
  
  // Also copy to public folder
  const publicIcoPath = path.join(__dirname, '..', 'public', 'icon.ico');
  fs.writeFileSync(publicIcoPath, buf);
  console.log('Generated public/icon.ico');
  
  // Check file size
  const stats = fs.statSync(icoPath);
  console.log('ICO file size:', stats.size, 'bytes');
}

createIco().catch(console.error);
