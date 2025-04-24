// Download images for Sri Lanka Stay & Explore website
const fs = require('fs');
const path = require('path');
const https = require('https');
const { createCanvas, loadImage } = require('canvas');

// Create the images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

// Download an image from a URL and save it to the images directory
function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        console.log(`Downloading image: ${filename}`);
        
        // Make a GET request to the URL
        https.get(url, (res) => {
            // Check if the response is successful
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download image, status code: ${res.statusCode}`));
                return;
            }
            
            // Create a write stream to save the image
            const filePath = path.join(imagesDir, filename);
            const fileStream = fs.createWriteStream(filePath);
            
            // Pipe the response data to the file
            res.pipe(fileStream);
            
            // When the file is done writing, resolve the promise
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`Downloaded: ${filename}`);
                resolve(filePath);
            });
            
            // Handle errors
            fileStream.on('error', (err) => {
                fs.unlink(filePath, () => {}); // Delete the file if there's an error
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Create an error placeholder image
async function createErrorPlaceholder() {
    const width = 400;
    const height = 300;
    
    // Create a canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fill the background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    
    // Add error text
    ctx.fillStyle = '#888888';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Image Not Found', width / 2, height / 2 - 20);
    
    // Add a warning symbol
    ctx.fillStyle = '#666666';
    ctx.font = '60px Arial';
    ctx.fillText('⚠', width / 2, height / 2 - 80);
    
    // Save the canvas to a file
    const filePath = path.join(imagesDir, 'image-error.jpg');
    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(filePath, buffer);
    
    console.log('Created error placeholder image');
    return filePath;
}

// Main function to download all images
async function downloadAllImages() {
    // List of images to download with their metadata
    const imagesToDownload = [
        {
            url: 'https://images.unsplash.com/photo-1586948430486-81e990197f2e?q=80&w=1200',
            filename: 'sigiriya-rock.jpg',
            category: 'scenery',
            name: 'Sigiriya Rock Fortress',
            description: 'Ancient rock fortress in central Sri Lanka'
        },
        {
            url: 'https://images.unsplash.com/photo-1581618748913-eb58e126c907?q=80&w=1200',
            filename: 'sri-lankan-beach.jpg',
            category: 'beach',
            name: 'Sri Lankan Beach',
            description: 'Beautiful tropical beach with palm trees'
        },
        {
            url: 'https://images.unsplash.com/photo-1629995297574-c1fc3f5a6a99?q=80&w=1200',
            filename: 'sri-lankan-cuisine.jpg',
            category: 'food',
            name: 'Sri Lankan Cuisine',
            description: 'Traditional Sri Lankan rice and curry dishes'
        },
        {
            url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1200',
            filename: 'kandy-temple.jpg',
            category: 'culture',
            name: 'Kandy Temple',
            description: 'Sacred Temple of the Tooth Relic in Kandy'
        },
        {
            url: 'https://images.unsplash.com/photo-1589879809594-71a8a2c22fb3?q=80&w=1200',
            filename: 'wild-elephants.jpg',
            category: 'wildlife',
            name: 'Wild Elephants',
            description: 'Wild elephants in Udawalawe National Park'
        },
        {
            url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=1200',
            filename: 'tea-plantations.jpg',
            category: 'scenery',
            name: 'Tea Plantations',
            description: 'Beautiful tea plantations in the highlands'
        },
        {
            url: 'https://images.unsplash.com/photo-1622134445522-ce128429e163?q=80&w=1200',
            filename: 'traditional-dancers.jpg',
            category: 'culture',
            name: 'Traditional Dancers',
            description: 'Colorful Kandyan dancers in traditional costume'
        },
        {
            url: 'https://images.unsplash.com/photo-1622623349703-63cd94acac6a?q=80&w=1200',
            filename: 'train-to-ella.jpg',
            category: 'scenery',
            name: 'Train to Ella',
            description: 'Scenic train ride through Sri Lankan highlands'
        },
        {
            url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1200',
            filename: 'sri-lankan-leopard.jpg',
            category: 'wildlife',
            name: 'Sri Lankan Leopard',
            description: 'Rare Sri Lankan leopard in Yala National Park'
        },
        {
            url: 'https://images.unsplash.com/photo-1545579133-99bb5ab189bd?q=80&w=1200',
            filename: 'stilt-fishermen.jpg',
            category: 'culture',
            name: 'Stilt Fishermen',
            description: 'Traditional stilt fishermen at sunset'
        }
    ];
    
    // Create the error placeholder image
    await createErrorPlaceholder();
    
    // Download each image
    const downloadResults = [];
    
    for (const image of imagesToDownload) {
        try {
            const filePath = await downloadImage(image.url, image.filename);
            downloadResults.push({
                success: true,
                image: image,
                filePath: filePath
            });
        } catch (error) {
            console.error(`Error downloading ${image.filename}:`, error);
            downloadResults.push({
                success: false,
                image: image,
                error: error.message
            });
        }
    }
    
    // Print summary
    console.log('\nDownload Summary:');
    console.log(`Total images: ${imagesToDownload.length}`);
    console.log(`Successfully downloaded: ${downloadResults.filter(r => r.success).length}`);
    console.log(`Failed: ${downloadResults.filter(r => !r.success).length}`);
    
    // Create a registry file with image metadata
    const registry = {
        lastUpdated: new Date().toISOString(),
        images: downloadResults.filter(r => r.success).map(r => ({
            filename: r.image.filename,
            category: r.image.category,
            name: r.image.name,
            description: r.image.description
        }))
    };
    
    fs.writeFileSync(
        path.join(__dirname, 'images', 'image-registry.json'),
        JSON.stringify(registry, null, 2)
    );
    
    console.log('\nImage registry created: images/image-registry.json');
    console.log('Download process completed!');
}

// Run the download function
downloadAllImages().catch(error => {
    console.error('Error in main process:', error);
});