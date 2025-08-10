// Script to create a simple SVG placeholder image
const fs = require('fs');

console.log('Creating placeholder image...');

const outputPath = './images/placeholder.jpg';

// Check if the file already exists
if (fs.existsSync(outputPath)) {
    console.log('Placeholder image already exists, skipping creation.');
    process.exit(0);
}

// Simple SVG placeholder with text "Image Not Available"
const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#e0e0e0"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="#888888">Image Not Available</text>
</svg>`;

// Create an SVG file first
const svgPath = './images/placeholder.svg';
fs.writeFileSync(svgPath, svgContent);
console.log(`SVG placeholder created at ${svgPath}`);

// For compatibility with the existing code, copy the SVG to the JPG path
fs.copyFileSync(svgPath, outputPath);
console.log(`Placeholder copied to ${outputPath}`);

console.log('Placeholder image created successfully.'); 