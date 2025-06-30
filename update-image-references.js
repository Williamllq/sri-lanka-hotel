
// Image Reference Update Script
// Run this in the browser console or add to your JavaScript files

function updateImageReferences() {
    const imageUpdates = {
        'images/nine-arch-bridge.jpg': 'images/Scenery in Sir Lanka 3.jpg',
        'images/temple-tooth.jpg': 'images/kandy-temple.jpg',
        'images/unawatuna-beach.jpg': 'images/placeholder.jpg', // No alternative found
        'images/yala-leopard.jpg': 'images/sri-lankan-leopard.jpg',
        'images/sri-lankan-food.jpg': 'images/placeholder.jpg', // No alternative found
        'images/sigiriya.jpg': 'images/placeholder.jpg', // No alternative found
        'images/pattern-bg.png': 'images/placeholder.jpg', // No alternative found
        'css/images/Image (16).jpg': 'images/placeholder.jpg', // No alternative found
        'css/images/Image (17).jpg': 'images/placeholder.jpg', // No alternative found
        'css/images/Image (23).jpg': 'images/placeholder.jpg', // No alternative found
    };

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
    style.textContent = `
        [style*="images/nine-arch-bridge.jpg"] { background-image: url('images/Scenery in Sir Lanka 3.jpg') !important; }
        [style*="images/temple-tooth.jpg"] { background-image: url('images/kandy-temple.jpg') !important; }
        [style*="images/unawatuna-beach.jpg"] { background-image: url('images/placeholder.jpg') !important; }
        [style*="images/yala-leopard.jpg"] { background-image: url('images/sri-lankan-leopard.jpg') !important; }
        [style*="images/sri-lankan-food.jpg"] { background-image: url('images/placeholder.jpg') !important; }
        [style*="images/sigiriya.jpg"] { background-image: url('images/placeholder.jpg') !important; }
        [style*="images/pattern-bg.png"] { background-image: url('images/placeholder.jpg') !important; }
        [style*="css/images/Image (16).jpg"] { background-image: url('images/placeholder.jpg') !important; }
        [style*="css/images/Image (17).jpg"] { background-image: url('images/placeholder.jpg') !important; }
        [style*="css/images/Image (23).jpg"] { background-image: url('images/placeholder.jpg') !important; }
    `;
    document.head.appendChild(style);

    console.log('✅ Image references updated');
}

// Run the update
updateImageReferences();
