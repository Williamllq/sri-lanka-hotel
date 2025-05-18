// Service Worker - Version 2.0
// This worker ensures offline capability without interfering with page scrolling

const CACHE_NAME = 'sri-lanka-stay-explore-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/responsive.css',
  '/css/mobile-fix.css',
  '/css/scroll-fix.css',
  '/js/main.js',
  '/js/map.js',
  '/js/translations.js',
  '/images/favicon.ico',
  '/images/ranga_bandara_logo_v2.png'
];

// Install event - caches assets
self.addEventListener('install', event => {
  // Use waitUntil to prevent the worker from being considered installed
  // until the promise is resolved
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service worker caching assets');
        
        // Cache each asset individually and continue on failure
        // This prevents failure of the entire installation if one asset fails
        return Promise.allSettled(
          ASSETS_TO_CACHE.map(url => 
            cache.add(url).catch(error => {
              console.error(`Failed to cache ${url}: ${error}`);
              return null; // Continue despite error
            })
          )
        );
      })
      .then(() => {
        // Force activation without waiting for page reload
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName !== CACHE_NAME;
          }).map(cacheName => {
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        // Take control of all uncontrolled clients
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests to avoid CORS issues
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For HTML requests, use network-first strategy
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For all other assets, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            // Don't cache responses that aren't successful
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cache the fetched response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            // Return a fallback response or error
            return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
          });
      })
  );
});

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