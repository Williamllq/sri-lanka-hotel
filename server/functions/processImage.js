// Netlify Serverless Function for Image Processing
// Handles image resizing, optimization, and multiple resolution generation

const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');

// Function to handle image processing
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse the request body
    const { imageData, format = 'webp', sizes = [1200, 800, 400, 200], quality = 80 } = JSON.parse(event.body);
    
    if (!imageData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing image data' })
      };
    }
    
    // Convert base64 to buffer
    let imageBuffer;
    try {
      // Remove data URL prefix if present
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid image data format' })
      };
    }
    
    // Process the image at multiple resolutions
    const processedImages = await generateMultipleResolutions(imageBuffer, sizes, format, quality);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        images: processedImages
      })
    };
  } catch (error) {
    console.error('Error processing image:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process image' })
    };
  }
};

// Function to generate multiple resolutions of an image
async function generateMultipleResolutions(imageBuffer, sizes, format, quality) {
  try {
    // Load the image
    const image = await loadImage(imageBuffer);
    const originalWidth = image.width;
    const originalHeight = image.height;
    
    // Generate images at each requested size
    const results = await Promise.all(sizes.map(async (width) => {
      try {
        // Skip if requested width is larger than original
        if (width > originalWidth) {
          width = originalWidth;
        }
        
        // Calculate height to maintain aspect ratio
        const height = Math.round((width / originalWidth) * originalHeight);
        
        // Create canvas and resize
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Use better quality settings for resizing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw the image at the new size
        ctx.drawImage(image, 0, 0, width, height);
        
        // Convert to requested format
        const resizedImageBuffer = canvas.toBuffer(`image/${format}`, {
          quality: quality / 100
        });
        
        // Convert to base64 for response
        const base64Image = resizedImageBuffer.toString('base64');
        
        return {
          width,
          height,
          size: resizedImageBuffer.length,
          format,
          dataUrl: `data:image/${format};base64,${base64Image}`
        };
      } catch (error) {
        console.error(`Error generating ${width}px image:`, error);
        return null;
      }
    }));
    
    // Filter out any failed conversions
    return results.filter(Boolean);
  } catch (error) {
    console.error('Error in generateMultipleResolutions:', error);
    throw error;
  }
}

// Helper function to save an image to file (for debugging)
async function saveImageToFile(buffer, filename) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, buffer, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
} 