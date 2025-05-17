// Placeholder Image Creator for Sri Lanka Stay & Explore
// This script generates a placeholder image to use when images fail to load

// Canvas setup for creating the placeholder
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 300;
const ctx = canvas.getContext('2d');

// Draw background
ctx.fillStyle = '#f0f0f0';
ctx.fillRect(0, 0, 400, 300);

// Draw Sri Lanka outline
ctx.beginPath();
// These coordinates represent a simplified outline of Sri Lanka
const sriLankaOutline = [
  [200, 50],  // Start at top
  [220, 60],
  [240, 70],
  [260, 90],
  [280, 120],
  [290, 150],
  [295, 180],
  [290, 210],
  [280, 230],
  [260, 245],
  [240, 255],
  [220, 260],
  [200, 260],
  [180, 255],
  [170, 240],
  [160, 220],
  [150, 190],
  [145, 160],
  [150, 130],
  [160, 100],
  [180, 70],
  [200, 50]   // Back to start
];

ctx.moveTo(sriLankaOutline[0][0], sriLankaOutline[0][1]);
for (let i = 1; i < sriLankaOutline.length; i++) {
  ctx.lineTo(sriLankaOutline[i][0], sriLankaOutline[i][1]);
}
ctx.closePath();

// Fill with gradient
const gradient = ctx.createLinearGradient(150, 50, 250, 260);
gradient.addColorStop(0, '#4CAF50');  // Green
gradient.addColorStop(1, '#FFC107');  // Yellow/gold
ctx.fillStyle = gradient;
ctx.fill();

// Add border
ctx.strokeStyle = '#2196F3'; // Blue
ctx.lineWidth = 2;
ctx.stroke();

// Add text
ctx.font = 'bold 24px Arial';
ctx.fillStyle = '#333';
ctx.textAlign = 'center';
ctx.fillText('Sri Lanka', 200, 290);

ctx.font = '16px Arial';
ctx.fillStyle = '#666';
ctx.fillText('Image Loading...', 200, 30);

// Convert to WebP format
const placeholderImage = canvas.toDataURL('image/webp', 0.8);

// Create the file if it doesn't exist
// This would be done server-side in a real implementation
// For now, we'll log the data URL to console so it can be saved manually
console.log('Placeholder image data URL:');
console.log(placeholderImage);

// Function to save the placeholder image (server-side implementation)
function savePlaceholderImage() {
  const imageData = placeholderImage.split(',')[1];
  const binaryString = window.atob(imageData);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const blob = new Blob([bytes], { type: 'image/webp' });
  
  // Create a download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'placeholder.webp';
  link.click();
  
  // Clean up
  URL.revokeObjectURL(link.href);
}

// Uncomment to save the image
// savePlaceholderImage(); 