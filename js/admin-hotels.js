/**
 * Admin Hotel Management
 * 处理管理员界面的酒店和房间管理功能
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Accommodations Management loaded');
    
    // First ensure we have both storage keys properly initialized
    initializeStorageKeys();
    
    // 初始化酒店和房间管理
    initAccommodationsManagement();
});

/**
 * Initialize the localStorage keys for both admin and front-end
 */
function initializeStorageKeys() {
    console.log('Initializing hotel management storage keys');
    
    // Initialize Luxurious Accommodations storage
    if (!localStorage.getItem('luxuriousRooms')) {
        console.log('Creating initial luxuriousRooms in localStorage');
        const demoRooms = createDemoRooms();
        localStorage.setItem('luxuriousRooms', JSON.stringify(demoRooms));
    } else {
        console.log('luxuriousRooms already exists in localStorage');
    }
    
    // Ensure compatibility with any old data
    const oldRoomsData = localStorage.getItem('adminRooms');
    if (oldRoomsData && !localStorage.getItem('luxuriousRooms')) {
        console.log('Migrating old adminRooms data to luxuriousRooms');
        localStorage.setItem('luxuriousRooms', oldRoomsData);
    }
    
    // Validate the luxuriousRooms data to ensure it's proper JSON
    try {
        const rooms = JSON.parse(localStorage.getItem('luxuriousRooms') || '[]');
        console.log(`Valid luxuriousRooms data found with ${rooms.length} rooms`);
    } catch (e) {
        console.error('Invalid luxuriousRooms data in localStorage, resetting:', e);
        const demoRooms = createDemoRooms();
        localStorage.setItem('luxuriousRooms', JSON.stringify(demoRooms));
    }
}

/**
 * Create demo room data for testing
 */
function createDemoRooms() {
    console.log('Creating demo rooms data');
    
    // Sample room images
    const oceanViewImage = 'https://sri-lanka-stay-explore.netlify.app/images/ocean-view-suite.jpg';
    const tropicalGardenImage = 'https://sri-lanka-stay-explore.netlify.app/images/tropical-garden-suite.jpg';
    const privatePoolImage = 'https://sri-lanka-stay-explore.netlify.app/images/private-pool-villa.jpg';
    
    // Demo room data
    const demoRooms = [
        {
            id: 'room_demo_1',
            name: 'Ocean View Suite',
            description: 'Wake up to breathtaking views of the Indian Ocean',
            price: 250,
            size: 55,
            bedType: 'King Bed',
            hasWifi: true,
            imageUrl: oceanViewImage,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        },
        {
            id: 'room_demo_2',
            name: 'Tropical Garden Suite',
            description: 'Immerse yourself in lush tropical gardens',
            price: 180,
            size: 45,
            bedType: 'Queen Bed',
            hasWifi: true,
            imageUrl: tropicalGardenImage,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        },
        {
            id: 'room_demo_3',
            name: 'Private Pool Villa',
            description: 'Ultimate luxury with your own infinity pool',
            price: 450,
            size: 120,
            bedType: 'King Bed',
            hasWifi: true,
            imageUrl: privatePoolImage,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        }
    ];
    
    return demoRooms;
}

/**
 * 初始化酒店管理功能
 */
function initAccommodationsManagement() {
    console.log('Initializing accommodations management');
    
    // Initialize storage keys
    initializeStorageKeys();
    
    // Initialize room display
    initLuxuriousRooms();
    
    // Setup room form handlers (for adding/editing rooms)
    setupRoomForm();
    
    // Setup Add New Room button handler
    const addRoomBtn = document.getElementById('addRoomBtn');
    if (addRoomBtn) {
        console.log('Add room button found, setting up click handler');
        addRoomBtn.addEventListener('click', function() {
            const roomModal = document.getElementById('roomModal');
            if (roomModal) {
                document.getElementById('roomModalTitle').textContent = 'Add New Room';
                document.getElementById('roomForm').reset();
                document.getElementById('roomId').value = '';
                
                // Clear image preview
                const preview = document.getElementById('roomImagePreview');
                if (preview) {
                    preview.innerHTML = '';
                }
                
                roomModal.style.display = 'flex';
                roomModal.classList.add('active');
            } else {
                console.error('Room modal not found');
            }
        });
    } else {
        console.error('Add Room button not found');
    }
    
    // Setup room management UI
    loadAndDisplayRooms();
    
    console.log('Accommodations management initialized successfully');
}

/**
 * 初始化奢华客房管理
 */
function initLuxuriousRooms() {
    console.log('Initializing luxury rooms management');
    
    // 加载和显示奢华客房
    loadAndDisplayRooms();
    
    // 设置取消按钮
    const cancelBtns = document.querySelectorAll('.cancel-btn');
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Cancel button clicked');
            const modal = this.closest('.admin-modal');
            if (modal) {
                console.log('Closing modal:', modal.id);
                closeModal(modal.id);
            }
        });
    });
    
    // 设置关闭按钮
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Close button clicked');
            const modal = this.closest('.admin-modal');
            if (modal) {
                console.log('Closing modal:', modal.id);
                closeModal(modal.id);
            }
        });
    });
}

/**
 * 加载并显示客房
 */
function loadAndDisplayRooms() {
    console.log('Loading and displaying rooms');
    
    // Get the container for room cards
    const roomsGrid = document.getElementById('roomsGrid');
    
    if (!roomsGrid) {
        console.error('Rooms grid container not found');
        return;
    }
    
    try {
        // Get rooms from localStorage
        const rooms = JSON.parse(localStorage.getItem('luxuriousRooms') || '[]');
        console.log(`Loaded ${rooms.length} rooms from storage`);
        
        // Clear the grid
        roomsGrid.innerHTML = '';
        
        // If no rooms, show a message
        if (rooms.length === 0) {
            roomsGrid.innerHTML = `
                <div class="no-content-message">
                    <i class="fas fa-bed"></i>
                    <p>No rooms have been added yet. Click "Add New Room" to create your first room.</p>
                </div>
            `;
            return;
        }
        
        // Sort rooms by price (lowest to highest)
        const sortedRooms = [...rooms].sort((a, b) => a.price - b.price);
        
        // Create and append room cards
        sortedRooms.forEach(room => {
            const roomCard = document.createElement('div');
            roomCard.className = 'room-card';
            roomCard.setAttribute('data-id', room.id);
            
            // Determine if the room has WiFi
            const hasWifi = typeof room.hasWifi === 'boolean' ? 
                room.hasWifi : 
                room.hasWifi === 'yes';
            
            // Create HTML for room card
            roomCard.innerHTML = `
                <div class="room-image">
                    ${room.imageUrl ? 
                        `<img src="${room.imageUrl}" alt="${room.name}">` :
                        `<div class="no-image">
                            <i class="fas fa-bed"></i>
                        </div>`
                    }
                </div>
                <div class="room-info">
                    <h3>${room.name}</h3>
                    <p>${room.description}</p>
                </div>
                <div class="room-details">
                    <span><i class="fas fa-ruler-combined"></i> ${room.size} m²</span>
                    <span><i class="fas fa-bed"></i> ${room.bedType}</span>
                    <span><i class="fas fa-wifi"></i> WiFi ${hasWifi ? 'Included' : 'Not Available'}</span>
                </div>
                <div class="room-price">
                    <span>$${parseFloat(room.price).toFixed(2)} per night</span>
                </div>
                <div class="room-actions">
                    <button class="edit-room-btn" data-id="${room.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-room-btn" data-id="${room.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            roomsGrid.appendChild(roomCard);
        });
        
        console.log('Rooms display updated successfully');
    } catch (error) {
        console.error('Error loading rooms:', error);
        roomsGrid.innerHTML = `
            <div class="no-content-message error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading rooms. Please refresh the page and try again.</p>
            </div>
        `;
    }
}

/**
 * 设置客房卡片的事件处理程序
 */
function setupRoomEventHandlers() {
    console.log('Setting up room event handlers');
    
    // Edit and Delete buttons - using event delegation for dynamically added elements
    document.addEventListener('click', function(e) {
        // Edit Room button
        if (e.target && (e.target.classList.contains('edit-room-btn') || 
            (e.target.parentElement && e.target.parentElement.classList.contains('edit-room-btn')))) {
            
            // Get the button element (could be the icon or the button itself)
            const button = e.target.classList.contains('edit-room-btn') ? 
                e.target : e.target.parentElement;
            
            const roomId = button.getAttribute('data-id');
            console.log('Edit button clicked for room ID:', roomId);
            
            if (roomId) {
                editRoom(roomId);
            } else {
                console.error('No room ID found on edit button');
            }
        }
        
        // Delete Room button
        if (e.target && (e.target.classList.contains('delete-room-btn') || 
            (e.target.parentElement && e.target.parentElement.classList.contains('delete-room-btn')))) {
            
            // Get the button element (could be the icon or the button itself)  
            const button = e.target.classList.contains('delete-room-btn') ? 
                e.target : e.target.parentElement;
            
            const roomId = button.getAttribute('data-id');
            console.log('Delete button clicked for room ID:', roomId);
            
            if (roomId) {
                if (confirm('Are you sure you want to delete this room?')) {
                    deleteRoom(roomId);
                }
            } else {
                console.error('No room ID found on delete button');
            }
        }
    });
}

/**
 * 设置客房表单事件
 */
function setupRoomForm() {
    console.log('Setting up room form handlers');
    
    const roomForm = document.getElementById('roomForm');
    const roomModal = document.getElementById('roomModal');
    const cancelBtn = roomModal ? roomModal.querySelector('.cancel-btn') : null;
    const closeModalBtn = roomModal ? roomModal.querySelector('.close-modal') : null;
    
    // Setup cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            roomModal.style.display = 'none';
            roomModal.classList.remove('active');
            roomForm.reset();
        });
    } else {
        console.error('Cancel button not found in room modal');
    }
    
    // Setup close button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            roomModal.style.display = 'none';
            roomModal.classList.remove('active');
            roomForm.reset();
        });
    } else {
        console.error('Close button not found in room modal');
    }
    
    // Setup click outside modal to close
    window.addEventListener('click', function(event) {
        if (event.target === roomModal) {
            roomModal.style.display = 'none';
            roomModal.classList.remove('active');
            roomForm.reset();
        }
    });
    
    // Handle image preview
    const roomImage = document.getElementById('roomImage');
    const roomImagePreview = document.getElementById('roomImagePreview');
    
    if (roomImage && roomImagePreview) {
        roomImage.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    roomImagePreview.innerHTML = `<img src="${e.target.result}" alt="Room preview">`;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    } else {
        console.error('Room image or preview elements not found');
    }
    
    // Handle form submission
    if (roomForm) {
        roomForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Room form submitted');
            
            // Get form values
            const roomId = document.getElementById('roomId').value;
            const roomName = document.getElementById('roomName').value;
            const roomDescription = document.getElementById('roomDescription').value;
            const roomPrice = document.getElementById('roomPrice').value;
            const roomSize = document.getElementById('roomSize').value;
            const bedType = document.getElementById('bedType').value;
            const hasWifi = document.querySelector('input[name="hasWifi"]:checked').value === 'yes';
            
            // Get current image if already set (for editing)
            let imageUrl = '';
            const roomImageElement = roomImagePreview.querySelector('img');
            if (roomImageElement) {
                imageUrl = roomImageElement.src;
            }
            
            // Get new image if selected
            const roomImageInput = document.getElementById('roomImage');
            if (roomImageInput && roomImageInput.files && roomImageInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Create room object with the new image
                    const room = {
                        id: roomId || 'room_' + Date.now(),
                        name: roomName,
                        description: roomDescription,
                        price: parseFloat(roomPrice),
                        size: roomSize,
                        bedType: bedType,
                        hasWifi: hasWifi,
                        imageUrl: e.target.result
                    };
                    
                    // Save to storage
                    saveRoomToStorage(room);
                    
                    // Close modal and reset form
                    roomModal.style.display = 'none';
                    roomModal.classList.remove('active');
                    roomForm.reset();
                    roomImagePreview.innerHTML = '';
                };
                reader.readAsDataURL(roomImageInput.files[0]);
            } else {
                // Create room object with existing image
                const room = {
                    id: roomId || 'room_' + Date.now(),
                    name: roomName,
                    description: roomDescription,
                    price: parseFloat(roomPrice),
                    size: roomSize,
                    bedType: bedType,
                    hasWifi: hasWifi,
                    imageUrl: imageUrl
                };
                
                // Save to storage
                saveRoomToStorage(room);
                
                // Close modal and reset form
                roomModal.style.display = 'none';
                roomModal.classList.remove('active');
                roomForm.reset();
                roomImagePreview.innerHTML = '';
            }
        });
    } else {
        console.error('Room form not found');
    }
}

/**
 * 保存客房到localStorage
 * @param {Object} room - 客房对象
 */
function saveRoomToStorage(room) {
    console.log('Saving room to storage:', room);
    
    try {
        // Get existing rooms
        const rooms = JSON.parse(localStorage.getItem('luxuriousRooms') || '[]');
        
        // Check if this is an edit or a new room
        const existingIndex = rooms.findIndex(r => r.id === room.id);
        
        if (existingIndex >= 0) {
            // Update existing room
            console.log('Updating existing room with ID:', room.id);
            rooms[existingIndex] = {
                ...rooms[existingIndex],
                ...room,
                lastUpdated: new Date().toISOString()
            };
        } else {
            // Add new room
            console.log('Adding new room with ID:', room.id);
            rooms.push({
                ...room,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            });
        }
        
        // Save to localStorage
        localStorage.setItem('luxuriousRooms', JSON.stringify(rooms));
        
        // Reload rooms display
        loadAndDisplayRooms();
        
        // Show success message
        alert(`Room "${room.name}" saved successfully!`);
        
        return true;
    } catch (error) {
        console.error('Error saving room to localStorage:', error);
        alert('Failed to save room. Please try again.');
        return false;
    }
}

/**
 * 编辑客房
 * @param {string} roomId - 客房ID
 */
function editRoom(roomId) {
    console.log('Editing room with ID:', roomId);
    
    // Get rooms from storage
    const rooms = JSON.parse(localStorage.getItem('luxuriousRooms') || '[]');
    const room = rooms.find(r => r.id === roomId);
    
    if (!room) {
        console.error('Room not found with ID:', roomId);
        alert('Room not found!');
        return;
    }
    
    // Get modal elements
    const roomModal = document.getElementById('roomModal');
    const roomForm = document.getElementById('roomForm');
    const roomIdInput = document.getElementById('roomId');
    const roomNameInput = document.getElementById('roomName');
    const roomDescriptionInput = document.getElementById('roomDescription');
    const roomPriceInput = document.getElementById('roomPrice');
    const roomSizeInput = document.getElementById('roomSize');
    const bedTypeSelect = document.getElementById('bedType');
    const hasWifiYes = document.querySelector('input[name="hasWifi"][value="yes"]');
    const hasWifiNo = document.querySelector('input[name="hasWifi"][value="no"]');
    const roomImagePreview = document.getElementById('roomImagePreview');
    
    // Check if all elements exist
    if (!roomModal || !roomForm || !roomIdInput || !roomNameInput || !roomDescriptionInput || 
        !roomPriceInput || !roomSizeInput || !bedTypeSelect || 
        !hasWifiYes || !hasWifiNo || !roomImagePreview) {
        console.error('One or more form elements not found');
        return;
    }
    
    // Set form values
    roomIdInput.value = room.id;
    roomNameInput.value = room.name;
    roomDescriptionInput.value = room.description;
    roomPriceInput.value = room.price;
    roomSizeInput.value = room.size;
    
    // Set dropdown value
    if (bedTypeSelect) {
        for (let i = 0; i < bedTypeSelect.options.length; i++) {
            if (bedTypeSelect.options[i].value === room.bedType) {
                bedTypeSelect.selectedIndex = i;
                break;
            }
        }
    }
    
    // Set radio button
    if (room.hasWifi) {
        hasWifiYes.checked = true;
        hasWifiNo.checked = false;
    } else {
        hasWifiYes.checked = false;
        hasWifiNo.checked = true;
    }
    
    // Show image preview
    if (room.imageUrl) {
        roomImagePreview.innerHTML = `<img src="${room.imageUrl}" alt="${room.name}">`;
    } else {
        roomImagePreview.innerHTML = '';
    }
    
    // Update modal title
    const modalTitle = document.getElementById('roomModalTitle');
    if (modalTitle) {
        modalTitle.innerHTML = `<i class="fas fa-edit"></i> Edit Room: ${room.name}`;
    }
    
    // Show modal
    roomModal.style.display = 'flex';
    roomModal.classList.add('active');
    
    console.log('Room edit modal opened and populated with data');
}

/**
 * 删除客房
 * @param {string} roomId - 客房ID
 */
function deleteRoom(roomId) {
    console.log('Deleting room with ID:', roomId);
    
    try {
        // Get current rooms
        const rooms = JSON.parse(localStorage.getItem('luxuriousRooms') || '[]');
        
        // Find room index
        const roomIndex = rooms.findIndex(room => room.id === roomId);
        
        if (roomIndex === -1) {
            console.error('Room not found for deletion:', roomId);
            alert('Room not found. It may have been already deleted.');
            return false;
        }
        
        // Get room name for confirmation message
        const roomName = rooms[roomIndex].name;
        
        // Remove the room
        rooms.splice(roomIndex, 1);
        
        // Save updated rooms list
        localStorage.setItem('luxuriousRooms', JSON.stringify(rooms));
        
        // Reload rooms display
        loadAndDisplayRooms();
        
        // Show success message
        alert(`Room "${roomName}" has been deleted successfully.`);
        return true;
    } catch (error) {
        console.error('Error deleting room:', error);
        alert('Failed to delete room. Please try again.');
        return false;
    }
} 