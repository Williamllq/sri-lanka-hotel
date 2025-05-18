// Service Worker for Sri Lanka Stay & Explore
// Handles offline caching and image optimization

const CACHE_NAME = 'srilanka-stay-explore-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/responsive.css',
  '/css/gallery-fix.css',
  '/js/main.js',
  '/js/translations.js',
  '/js/user-auth.js',
  '/js/my-bookings.js',
  '/images/ranga_bandara_logo_v2.png',
  '/images/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Enhanced fetch event with image optimization
self.addEventListener('fetch', event => {
  // Special handling for image requests
  if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    event.respondWith(handleImageRequest(event.request));
  } else {
    // Regular fetch strategy for non-image requests
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached response if available
          if (response) {
            return response;
          }
          
          // Otherwise fetch from network
          return fetch(event.request)
            .then(networkResponse => {
              // Cache the network response for future
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
              return networkResponse;
            })
            .catch(error => {
              console.error('Fetch failed:', error);
              // Could return a fallback page/image here
            });
        })
    );
  }
});

// Function to handle image requests with optimization
async function handleImageRequest(request) {
  // Check cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fetch from network
    const response = await fetch(request);
    
    // Clone response for caching
    const responseToCache = response.clone();
    
    // Open cache and store response
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, responseToCache);
    
    return response;
  } catch (error) {
    console.error('Image fetch failed:', error);
    // Return a placeholder image if available
    return caches.match('/images/placeholder.webp');
  }
}

// Sync event for background sync of uploaded images
self.addEventListener('sync', event => {
  if (event.tag === 'sync-images') {
    event.waitUntil(syncImages());
  }
});

// Function to sync images in the background
async function syncImages() {
  try {
    // Get pending uploads from IndexedDB
    const pendingUploads = await getPendingUploads();
    
    // Process each pending upload
    for (const upload of pendingUploads) {
      try {
        // Upload to server
        await fetch('/api/images/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(upload)
        });
        
        // Mark as uploaded in IndexedDB
        await markAsUploaded(upload.id);
      } catch (error) {
        console.error('Failed to sync image:', error);
      }
    }
  } catch (error) {
    console.error('Image sync failed:', error);
  }
}

// Helper functions for IndexedDB operations
async function getPendingUploads() {
  // This function would fetch pending uploads from IndexedDB
  // Implementation will be added in the IndexedDB module
  return [];
}

async function markAsUploaded(id) {
  // This function would mark an upload as completed in IndexedDB
  // Implementation will be added in the IndexedDB module
} 