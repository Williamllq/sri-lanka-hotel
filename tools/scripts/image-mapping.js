
// Image Category Mapping
const imageCategories = {
  "sri-lankan-destinations": [
    "Scenery in Sir Lanka 1.jpg",
    "Scenery in Sir Lanka 2.jpg",
    "Scenery in Sir Lanka 3.jpg",
    "scenic-mountains.jpg",
    "tea-plantation.jpg"
  ],
  "wildlife": [
    "sri-lankan-leopard.jpg",
    "Scenery in Sir Lanka elephant 1.jpg",
    "Scenery in Sir Lanka elephant 2.jpg",
    "Scenery in Sir Lanka monkey.jpg"
  ],
  "cultural-sites": [
    "kandy-temple.jpg",
    "temple.jpg"
  ],
  "food-culture": [
    "food.jpg"
  ],
  "beaches": [
    "beach.jpg",
    "stilt-fishermen.jpg"
  ]
};

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
