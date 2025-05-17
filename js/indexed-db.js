// IndexedDB Module for Sri Lanka Stay & Explore
// Handles larger storage needs for image caching and offline functionality

const DB_NAME = 'SriLankaStayExploreDB';
const DB_VERSION = 1;
let db;

// Database structure
const OBJECT_STORES = {
  IMAGES: 'images',
  GALLERY: 'gallery',
  PENDING_UPLOADS: 'pendingUploads',
  USER_PREFERENCES: 'userPreferences'
};

// Initialize the database
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject('Error opening database');
    };
    
    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('Database opened successfully');
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(OBJECT_STORES.IMAGES)) {
        const imagesStore = db.createObjectStore(OBJECT_STORES.IMAGES, { keyPath: 'id' });
        imagesStore.createIndex('category', 'category', { unique: false });
        imagesStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(OBJECT_STORES.GALLERY)) {
        const galleryStore = db.createObjectStore(OBJECT_STORES.GALLERY, { keyPath: 'id' });
        galleryStore.createIndex('category', 'category', { unique: false });
        galleryStore.createIndex('displayOrder', 'displayOrder', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(OBJECT_STORES.PENDING_UPLOADS)) {
        const uploadsStore = db.createObjectStore(OBJECT_STORES.PENDING_UPLOADS, { keyPath: 'id', autoIncrement: true });
        uploadsStore.createIndex('timestamp', 'timestamp', { unique: false });
        uploadsStore.createIndex('status', 'status', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(OBJECT_STORES.USER_PREFERENCES)) {
        db.createObjectStore(OBJECT_STORES.USER_PREFERENCES, { keyPath: 'id' });
      }
    };
  });
}

// Image Operations
const ImageStore = {
  // Add an image to the store
  addImage: async (imageData) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OBJECT_STORES.IMAGES], 'readwrite');
      const store = transaction.objectStore(OBJECT_STORES.IMAGES);
      
      // Add timestamp if not present
      if (!imageData.timestamp) {
        imageData.timestamp = Date.now();
      }
      
      const request = store.add(imageData);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  
  // Get an image by ID
  getImage: async (id) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OBJECT_STORES.IMAGES], 'readonly');
      const store = transaction.objectStore(OBJECT_STORES.IMAGES);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  
  // Get all images, optionally filtered by category
  getAllImages: async (category = null) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OBJECT_STORES.IMAGES], 'readonly');
      const store = transaction.objectStore(OBJECT_STORES.IMAGES);
      
      let request;
      if (category) {
        const index = store.index('category');
        request = index.getAll(category);
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  
  // Update an image
  updateImage: async (imageData) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OBJECT_STORES.IMAGES], 'readwrite');
      const store = transaction.objectStore(OBJECT_STORES.IMAGES);
      const request = store.put(imageData);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  
  // Delete an image
  deleteImage: async (id) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OBJECT_STORES.IMAGES], 'readwrite');
      const store = transaction.objectStore(OBJECT_STORES.IMAGES);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
};

// Gallery Operations
const GalleryStore = {
  // Add an image to the gallery
  addToGallery: async (galleryItem) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OBJECT_STORES.GALLERY], 'readwrite');
      const store = transaction.objectStore(OBJECT_STORES.GALLERY);
      
      // Set display order if not present
      if (!galleryItem.displayOrder) {
        // Get the highest current display order
        const countRequest = store.count();
        countRequest.onsuccess = () => {
          galleryItem.displayOrder = countRequest.result + 1;
          const addRequest = store.add(galleryItem);
          addRequest.onsuccess = () => resolve(addRequest.result);
          addRequest.onerror = () => reject(addRequest.error);
        };
        countRequest.onerror = () => reject(countRequest.error);
      } else {
        const request = store.add(galleryItem);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }
    });
  },
  
  // Get all gallery items, optionally filtered by category
  getGalleryItems: async (category = null) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OBJECT_STORES.GALLERY], 'readonly');
      const store = transaction.objectStore(OBJECT_STORES.GALLERY);
      
      let request;
      if (category) {
        const index = store.index('category');
        request = index.getAll(category);
      } else {
        // Get all items sorted by display order
        const index = store.index('displayOrder');
        request = index.getAll();
      }
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  
  // Update gallery item
  updateGalleryItem: async (galleryItem) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OBJECT_STORES.GALLERY], 'readwrite');
      const store = transaction.objectStore(OBJECT_STORES.GALLERY);
      const request = store.put(galleryItem);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  
  // Remove from gallery
  removeFromGallery: async (id) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OBJECT_STORES.GALLERY], 'readwrite');
      const store = transaction.objectStore(OBJECT_STORES.GALLERY);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  },
  
  // Reorder gallery items
  reorderGallery: async (itemIds) => {
    return new Promise(async (resolve, reject) => {
      const transaction = db.transaction([OBJECT_STORES.GALLERY], 'readwrite');
      const store = transaction.objectStore(OBJECT_STORES.GALLERY);
      
      try {
        // Update each item with new display order
        for (let i = 0; i < itemIds.length; i++) {
          const id = itemIds[i];
          const request = store.get(id);
          
          await new Promise((resolveItem, rejectItem) => {
            request.onsuccess = async () => {
              const item = request.result;
              if (item) {
                item.displayOrder = i + 1;
                const updateRequest = store.put(item);
                
                updateRequest.onsuccess = () => resolveItem();
                updateRequest.onerror = () => rejectItem(updateRequest.error);
              } else {
                rejectItem(new Error(`Item with ID ${id} not found`));
              }
            };
            request.onerror = () => rejectItem(request.error);
          });
        }
        
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }
};

// Pending Uploads Operations
const PendingUploadsStore = {
  // Add a pending upload
  addPendingUpload: async (uploadData) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OBJECT_STORES.PENDING_UPLOADS], 'readwrite');
      const store = transaction.objectStore(OBJECT_STORES.PENDING_UPLOADS);
      
      // Add timestamp and status if not present
      if (!uploadData.timestamp) {
        uploadData.timestamp = Date.now();
      }
      
      if (!uploadData.status) {
        uploadData.status = 'pending';
      }
      
      const request = store.add(uploadData);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  
  // Get all pending uploads
  getPendingUploads: async () => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OBJECT_STORES.PENDING_UPLOADS], 'readonly');
      const store = transaction.objectStore(OBJECT_STORES.PENDING_UPLOADS);
      const index = store.index('status');
      const request = index.getAll('pending');
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  
  // Mark upload as completed
  markAsUploaded: async (id) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OBJECT_STORES.PENDING_UPLOADS], 'readwrite');
      const store = transaction.objectStore(OBJECT_STORES.PENDING_UPLOADS);
      const request = store.get(id);
      
      request.onsuccess = () => {
        const data = request.result;
        if (data) {
          data.status = 'completed';
          data.completedTimestamp = Date.now();
          
          const updateRequest = store.put(data);
          updateRequest.onsuccess = () => resolve(true);
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error(`Upload with ID ${id} not found`));
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  },
  
  // Delete completed uploads older than specified days
  cleanupOldUploads: async (olderThanDays = 7) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OBJECT_STORES.PENDING_UPLOADS], 'readwrite');
      const store = transaction.objectStore(OBJECT_STORES.PENDING_UPLOADS);
      const index = store.index('status');
      const request = index.getAll('completed');
      
      request.onsuccess = async () => {
        const completedUploads = request.result;
        const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
        let deletedCount = 0;
        
        try {
          for (const upload of completedUploads) {
            if (upload.completedTimestamp && upload.completedTimestamp < cutoffTime) {
              await new Promise((resolveDelete, rejectDelete) => {
                const deleteRequest = store.delete(upload.id);
                deleteRequest.onsuccess = () => {
                  deletedCount++;
                  resolveDelete();
                };
                deleteRequest.onerror = () => rejectDelete(deleteRequest.error);
              });
            }
          }
          
          resolve(deletedCount);
        } catch (error) {
          reject(error);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }
};

// User Preferences Operations
const UserPreferencesStore = {
  // Save user preferences
  savePreferences: async (preferences) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OBJECT_STORES.USER_PREFERENCES], 'readwrite');
      const store = transaction.objectStore(OBJECT_STORES.USER_PREFERENCES);
      
      // Always use 'userPreferences' as the ID
      preferences.id = 'userPreferences';
      
      const request = store.put(preferences);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  },
  
  // Get user preferences
  getPreferences: async () => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OBJECT_STORES.USER_PREFERENCES], 'readonly');
      const store = transaction.objectStore(OBJECT_STORES.USER_PREFERENCES);
      const request = store.get('userPreferences');
      
      request.onsuccess = () => {
        // Return an empty object if no preferences are found
        resolve(request.result || {});
      };
      
      request.onerror = () => reject(request.error);
    });
  }
};

// Export the module
const IndexedDB = {
  initDB,
  ImageStore,
  GalleryStore,
  PendingUploadsStore,
  UserPreferencesStore
};

// Auto-initialize when the script loads
window.addEventListener('load', () => {
  initDB()
    .then(() => console.log('IndexedDB initialized successfully'))
    .catch(error => console.error('Failed to initialize IndexedDB:', error));
});

// Make the module available globally
window.IndexedDB = IndexedDB; 