// Netlify Serverless Function for Image Synchronization
// Handles synchronization between admin-uploaded images and frontend display

const fs = require('fs').promises;
const path = require('path');

// Image categories with their respective folder paths
const IMAGE_CATEGORIES = {
  gallery: 'images/gallery',
  accommodations: 'images/accommodations',
  testimonials: 'images/testimonials',
  hotel: 'images/hotel'
};

// Main function handler
exports.handler = async (event, context) => {
  const { httpMethod, path: requestPath } = event;
  
  try {
    // Handle different endpoints
    if (requestPath.endsWith('/list')) {
      return await handleListImages(event);
    } else if (requestPath.endsWith('/sync')) {
      return await handleSyncImages(event);
    } else if (requestPath.endsWith('/metadata')) {
      return await handleImageMetadata(event);
    }
    
    // Default response for unknown endpoints
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not Found' })
    };
  } catch (error) {
    console.error('Image sync error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
};

// Function to handle listing images
async function handleListImages(event) {
  const { queryStringParameters } = event;
  const category = queryStringParameters?.category || 'gallery';
  
  // Validate category
  if (!IMAGE_CATEGORIES[category]) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid category' })
    };
  }
  
  try {
    // Get images from the specified category folder
    const folderPath = path.join(process.env.LAMBDA_TASK_ROOT, '..', '..', IMAGE_CATEGORIES[category]);
    const files = await fs.readdir(folderPath);
    
    // Filter for image files
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
    
    // Format response with image metadata
    const images = await Promise.all(imageFiles.map(async filename => {
      try {
        const filePath = path.join(folderPath, filename);
        const stats = await fs.stat(filePath);
        
        return {
          filename,
          path: `/${IMAGE_CATEGORIES[category]}/${filename}`,
          size: stats.size,
          lastModified: stats.mtime,
          category
        };
      } catch (error) {
        console.error(`Error processing file ${filename}:`, error);
        return null;
      }
    }));
    
    // Filter out failed entries
    const validImages = images.filter(Boolean);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        category,
        count: validImages.length,
        images: validImages
      })
    };
  } catch (error) {
    console.error(`Error listing images for category ${category}:`, error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to list images', message: error.message })
    };
  }
}

// Function to handle image synchronization
async function handleSyncImages(event) {
  // Only allow POST requests for sync
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }
  
  try {
    const { category, images, lastSyncTimestamp } = JSON.parse(event.body);
    
    // Validate category
    if (!IMAGE_CATEGORIES[category]) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid category' })
      };
    }
    
    // Get server-side list of images
    const folderPath = path.join(process.env.LAMBDA_TASK_ROOT, '..', '..', IMAGE_CATEGORIES[category]);
    const files = await fs.readdir(folderPath);
    const serverImages = await Promise.all(files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(async filename => {
        const filePath = path.join(folderPath, filename);
        const stats = await fs.stat(filePath);
        
        return {
          filename,
          path: `/${IMAGE_CATEGORIES[category]}/${filename}`,
          size: stats.size,
          lastModified: stats.mtime.getTime(),
          category
        };
      }));
    
    // Calculate differences
    const clientFilenames = new Set(images.map(img => img.filename));
    const serverFilenames = new Set(serverImages.map(img => img.filename));
    
    // Images to add (on server but not on client)
    const imagesToAdd = serverImages.filter(img => !clientFilenames.has(img.filename));
    
    // Images to remove (on client but not on server)
    const imagesToRemove = images.filter(img => !serverFilenames.has(img.filename)).map(img => img.filename);
    
    // Images to update (modified since last sync)
    const imagesToUpdate = serverImages.filter(serverImg => {
      const clientImg = images.find(img => img.filename === serverImg.filename);
      return clientImg && serverImg.lastModified > lastSyncTimestamp;
    });
    
    // Calculate current timestamp for next sync
    const syncTimestamp = Date.now();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        syncTimestamp,
        updates: {
          add: imagesToAdd,
          remove: imagesToRemove,
          update: imagesToUpdate
        },
        totalServerImages: serverImages.length
      })
    };
  } catch (error) {
    console.error('Error syncing images:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to sync images', message: error.message })
    };
  }
}

// Function to handle retrieving image metadata
async function handleImageMetadata(event) {
  const { queryStringParameters } = event;
  const { path: imagePath } = queryStringParameters || {};
  
  if (!imagePath) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing image path' })
    };
  }
  
  try {
    // Sanitize the path to prevent directory traversal
    const normalizedPath = path.normalize(imagePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(process.env.LAMBDA_TASK_ROOT, '..', '..', normalizedPath);
    
    // Get file stats
    const stats = await fs.stat(fullPath);
    
    // Read any existing metadata file if it exists
    let metadata = {};
    const metadataPath = `${fullPath}.meta.json`;
    
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      metadata = JSON.parse(metadataContent);
    } catch (err) {
      // Metadata file might not exist, which is okay
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        path: normalizedPath,
        filename: path.basename(normalizedPath),
        size: stats.size,
        lastModified: stats.mtime,
        metadata
      })
    };
  } catch (error) {
    console.error(`Error retrieving metadata for ${imagePath}:`, error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to retrieve image metadata', message: error.message })
    };
  }
} 