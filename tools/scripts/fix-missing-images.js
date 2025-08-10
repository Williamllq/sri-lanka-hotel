/**
 * Fix Missing Images Script
 * This script helps resolve missing image issues in the Sri Lankan tourism website
 */

const fs = require('fs');
const path = require('path');

class ImageFixer {
    constructor() {
        this.missingImages = [
            'images/nine-arch-bridge.jpg',
            'images/temple-tooth.jpg', 
            'images/unawatuna-beach.jpg',
            'images/yala-leopard.jpg',
            'images/sri-lankan-food.jpg',
            'images/sigiriya.jpg',
            'images/pattern-bg.png',
            'css/images/Image (16).jpg',
            'css/images/Image (17).jpg', 
            'css/images/Image (23).jpg'
        ];
        
        this.alternativeImages = {
            'nine-arch-bridge.jpg': 'Scenery in Sir Lanka 3.jpg',
            'temple-tooth.jpg': 'kandy-temple.jpg',
            'unawatuna-beach.jpg': 'beach.jpg',
            'yala-leopard.jpg': 'sri-lankan-leopard.jpg',
            'sri-lankan-food.jpg': 'food.jpg',
            'sigiriya.jpg': 'scenic-mountains.jpg'
        };
    }

    // Check which images actually exist in the filesystem
    checkExistingImages() {
        console.log('🔍 Checking for missing images...');
        const missing = [];
        const existing = [];

        for (const imagePath of this.missingImages) {
            const fullPath = path.join(__dirname, imagePath);
            if (fs.existsSync(fullPath)) {
                existing.push(imagePath);
                console.log(`✅ Found: ${imagePath}`);
            } else {
                missing.push(imagePath);
                console.log(`❌ Missing: ${imagePath}`);
            }
        }

        return { missing, existing };
    }

    // Find alternative images that could be used as replacements
    findAlternatives() {
        console.log('\n🔄 Looking for alternative images...');
        const alternatives = {};

        // Check images directory for potential alternatives
        const imagesDir = path.join(__dirname, 'images');
        if (fs.existsSync(imagesDir)) {
            const availableImages = fs.readdirSync(imagesDir)
                .filter(file => /\.(jpg|jpeg|png|webp|avif)$/i.test(file));

            console.log('Available images:', availableImages);

            // Map missing images to available alternatives
            for (const [missing, alternative] of Object.entries(this.alternativeImages)) {
                if (availableImages.includes(alternative)) {
                    alternatives[missing] = alternative;
                    console.log(`📸 Can use ${alternative} for ${missing}`);
                }
            }
        }

        return alternatives;
    }

    // Generate HTML/CSS update suggestions
    generateUpdateScript() {
        const { missing } = this.checkExistingImages();
        const alternatives = this.findAlternatives();

        console.log('\n📝 Generating update script...');

        let script = `
// Image Reference Update Script
// Run this in the browser console or add to your JavaScript files

function updateImageReferences() {
    const imageUpdates = {
`;

        for (const missingImage of missing) {
            const imageName = path.basename(missingImage);
            const alternative = alternatives[imageName];
            
            if (alternative) {
                script += `        '${missingImage}': 'images/${alternative}',\n`;
            } else {
                script += `        '${missingImage}': 'images/placeholder.jpg', // No alternative found\n`;
            }
        }

        script += `    };

    // Update img src attributes
    document.querySelectorAll('img').forEach(img => {
        for (const [oldSrc, newSrc] of Object.entries(imageUpdates)) {
            if (img.src.includes(oldSrc) || img.getAttribute('src') === oldSrc) {
                console.log('Updating image:', oldSrc, '->', newSrc);
                img.src = newSrc;
                img.onerror = function() {
                    this.src = 'images/placeholder.jpg';
                };
            }
        }
    });

    // Update CSS background images
    const style = document.createElement('style');
    style.textContent = \`
`;

        for (const missingImage of missing) {
            const imageName = path.basename(missingImage);
            const alternative = alternatives[imageName] || 'placeholder.jpg';
            script += `        [style*="${missingImage}"] { background-image: url('images/${alternative}') !important; }\n`;
        }

        script += `    \`;
    document.head.appendChild(style);

    console.log('✅ Image references updated');
}

// Run the update
updateImageReferences();
`;

        return script;
    }

    // Create placeholder images for missing files
    createPlaceholders() {
        console.log('\n🖼️ Creating placeholder images...');
        
        const placeholderSvg = `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#f0f0f0"/>
    <text x="400" y="300" font-family="Arial" font-size="24" text-anchor="middle" fill="#888">
        Sri Lanka Tourism
    </text>
    <text x="400" y="330" font-family="Arial" font-size="16" text-anchor="middle" fill="#aaa">
        Image Coming Soon
    </text>
</svg>`;

        // Ensure directories exist
        const dirs = ['images', 'css/images'];
        dirs.forEach(dir => {
            const fullDir = path.join(__dirname, dir);
            if (!fs.existsSync(fullDir)) {
                fs.mkdirSync(fullDir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        });

        // Create placeholder for each missing image
        for (const imagePath of this.missingImages) {
            const fullPath = path.join(__dirname, imagePath);
            if (!fs.existsSync(fullPath)) {
                try {
                    if (imagePath.endsWith('.svg')) {
                        fs.writeFileSync(fullPath, placeholderSvg);
                    } else {
                        // For non-SVG files, copy the existing placeholder
                        const placeholderPath = path.join(__dirname, 'images/placeholder.jpg');
                        if (fs.existsSync(placeholderPath)) {
                            fs.copyFileSync(placeholderPath, fullPath);
                        } else {
                            // Create a basic SVG as backup
                            fs.writeFileSync(fullPath.replace(/\.[^.]+$/, '.svg'), placeholderSvg);
                        }
                    }
                    console.log(`✅ Created placeholder: ${imagePath}`);
                } catch (error) {
                    console.error(`❌ Failed to create ${imagePath}:`, error.message);
                }
            }
        }
    }

    // Generate file mapping for existing images
    generateImageMapping() {
        console.log('\n📋 Generating image mapping...');
        
        const mapping = {
            'sri-lankan-destinations': [
                'Scenery in Sir Lanka 1.jpg',
                'Scenery in Sir Lanka 2.jpg', 
                'Scenery in Sir Lanka 3.jpg',
                'scenic-mountains.jpg',
                'tea-plantation.jpg'
            ],
            'wildlife': [
                'sri-lankan-leopard.jpg',
                'Scenery in Sir Lanka elephant 1.jpg',
                'Scenery in Sir Lanka elephant 2.jpg',
                'Scenery in Sir Lanka monkey.jpg'
            ],
            'cultural-sites': [
                'kandy-temple.jpg',
                'temple.jpg'
            ],
            'food-culture': [
                'food.jpg'
            ],
            'beaches': [
                'beach.jpg',
                'stilt-fishermen.jpg'
            ]
        };

        const mappingScript = `
// Image Category Mapping
const imageCategories = ${JSON.stringify(mapping, null, 2)};

// Function to get random image from category
function getImageFromCategory(category) {
    const images = imageCategories[category];
    if (images && images.length > 0) {
        const randomIndex = Math.floor(Math.random() * images.length);
        return 'images/' + images[randomIndex];
    }
    return 'images/placeholder.jpg';
}

// Usage examples:
// getImageFromCategory('wildlife') - returns random wildlife image
// getImageFromCategory('sri-lankan-destinations') - returns random destination image
`;

        fs.writeFileSync(path.join(__dirname, 'image-mapping.js'), mappingScript);
        console.log('✅ Created image-mapping.js');

        return mapping;
    }

    // Main fix function
    async fixImages() {
        console.log('🚀 Starting image fix process...\n');

        const { missing, existing } = this.checkExistingImages();
        
        if (missing.length === 0) {
            console.log('🎉 No missing images found!');
            return;
        }

        console.log(`\n📊 Summary: ${missing.length} missing, ${existing.length} found`);

        // Find alternatives
        const alternatives = this.findAlternatives();
        
        // Generate update script
        const updateScript = this.generateUpdateScript();
        fs.writeFileSync(path.join(__dirname, 'update-image-references.js'), updateScript);
        console.log('✅ Created update-image-references.js');

        // Create placeholders
        this.createPlaceholders();

        // Generate image mapping
        this.generateImageMapping();

        console.log('\n🎯 Next Steps:');
        console.log('1. Run update-image-references.js in your browser console');
        console.log('2. Replace placeholder images with actual Sri Lankan tourism photos');
        console.log('3. Use image-mapping.js for dynamic image selection');
        console.log('4. Test the website to ensure all images load correctly');
    }
}

// Run the fix if executed directly
if (require.main === module) {
    const fixer = new ImageFixer();
    fixer.fixImages().catch(console.error);
}

module.exports = ImageFixer; 