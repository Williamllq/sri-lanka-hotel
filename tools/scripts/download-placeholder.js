// Script to download a placeholder image
const fs = require('fs');
const https = require('https');

console.log('Downloading placeholder image...');

// URL of a simple placeholder image
const imageUrl = 'https://via.placeholder.com/400x300/e0e0e0/888888?text=Image+Not+Available';
const outputPath = './images/placeholder.jpg';

// Check if the file already exists
if (fs.existsSync(outputPath)) {
    console.log('Placeholder image already exists, skipping download.');
    process.exit(0);
}

// Download the image
https.get(imageUrl, (response) => {
    if (response.statusCode !== 200) {
        console.error(`Failed to download image: HTTP status code ${response.statusCode}`);
        process.exit(1);
    }

    const fileStream = fs.createWriteStream(outputPath);
    response.pipe(fileStream);
    
    fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Placeholder image downloaded to ${outputPath}`);
    });
}).on('error', (err) => {
    console.error(`Error downloading placeholder image: ${err.message}`);
    process.exit(1);
}); 