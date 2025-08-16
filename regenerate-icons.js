#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'public', 'icons');
const sourceIcon = path.join(iconsDir, 'icon-source.svg');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes needed for PWA manifest
const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const maskableSizes = [192, 512];

// Read the source SVG
const sourceSvg = fs.readFileSync(sourceIcon, 'utf8');

// Create maskable version (add padding/safe area)
function createMaskableSVG(sourceSvg, size) {
  // For maskable icons, we need to ensure the brain is in the safe area
  // Safe area is typically 80% of the icon (40px margin on a 512px icon)
  const safeAreaScale = 0.8;
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background fill for maskable -->
  <rect x="0" y="0" width="512" height="512" fill="#007AFF"/>
  
  <!-- Scaled down content for safe area -->
  <g transform="translate(256, 256) scale(${safeAreaScale}) translate(-256, -256)">
    ${sourceSvg.replace(/<svg[^>]*>/, '').replace('</svg>', '')}
  </g>
</svg>`;
}

// Generate icons
async function generateIcons() {
  console.log('Regenerating PWA icons from icon-source.svg...');
  
  // Generate standard icons
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(Buffer.from(sourceSvg))
        .resize(size, size)
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(outputPath);
      
      console.log(`✓ Created icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`✗ Failed to create icon-${size}x${size}.png:`, error.message);
    }
  }
  
  // Generate maskable icons
  for (const size of maskableSizes) {
    const maskableSvg = createMaskableSVG(sourceSvg, size);
    const outputPath = path.join(iconsDir, `icon-${size}x${size}-maskable.png`);
    
    try {
      await sharp(Buffer.from(maskableSvg))
        .resize(size, size)
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(outputPath);
      
      console.log(`✓ Created icon-${size}x${size}-maskable.png`);
    } catch (error) {
      console.error(`✗ Failed to create icon-${size}x${size}-maskable.png:`, error.message);
    }
  }
  
  // Generate favicon.ico
  try {
    await sharp(Buffer.from(sourceSvg))
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, 'public', 'favicon.png'));
    
    // Convert PNG to ICO (approximation - browsers often accept PNG)
    await sharp(Buffer.from(sourceSvg))
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, 'public', 'favicon.ico'));
    
    console.log('✓ Created favicon.ico');
  } catch (error) {
    console.error('✗ Failed to create favicon:', error.message);
  }
  
  console.log('\n🧠 All brain icons generated successfully!');
  console.log(`📁 Icons saved to: ${iconsDir}`);
}

// Run the generation
generateIcons().catch(console.error);