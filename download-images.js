// download-images.js
// 脚本用于下载斯里兰卡相关图片并添加到网站中

// 用于将图片保存到本地的辅助函数
async function downloadAndSaveImage(url, fileName) {
    try {
        // 获取图片数据
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to download image from ${url}`);
        }
        
        // 将图片转换为Blob
        const blob = await response.blob();
        
        // 将Blob转换为Data URL
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = () => {
                console.log(`Downloaded image: ${fileName}`);
                resolve({
                    dataUrl: reader.result,
                    fileName: fileName
                });
            };
            reader.onerror = () => reject(new Error('Failed to convert image to data URL'));
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error(`Error downloading image ${url}:`, error);
        throw error;
    }
}

// 获取图片分类，根据图片名称猜测类别
function getCategoryFromFileName(fileName) {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('beach') || lowerName.includes('ocean') || lowerName.includes('sea')) {
        return 'beach';
    } else if (lowerName.includes('food') || lowerName.includes('dish') || lowerName.includes('cuisine')) {
        return 'food';
    } else if (lowerName.includes('elephant') || lowerName.includes('animal') || lowerName.includes('wildlife')) {
        return 'wildlife';
    } else if (lowerName.includes('temple') || lowerName.includes('dance') || lowerName.includes('culture')) {
        return 'culture';
    } else {
        return 'scenery'; // 默认类别
    }
}

// 使用随机ID生成器
function generateUniqueId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// 压缩图片以减少存储大小
function compressImage(dataURL, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
        console.log("Starting image compression...");
        const img = new Image();
        img.onload = function() {
            // 计算新尺寸
            let width = img.width;
            let height = img.height;
            
            console.log("Original image dimensions:", width, "x", height);
            
            if (width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height = height * ratio;
                console.log("Resizing to:", width, "x", height);
            }
            
            // 创建画布并调整图片大小
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            // 绘制图片
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // 获取压缩后的数据URL
            const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
            console.log("Compression complete. Original size:", dataURL.length / 1024, "KB, New size:", compressedDataURL.length / 1024, "KB");
            resolve(compressedDataURL);
        };
        img.onerror = function(err) {
            console.error("Failed to load image for compression:", err);
            reject(new Error('Failed to load image for compression'));
        };
        img.src = dataURL;
    });
}

// 将图片添加到本地存储中
async function addImageToLocalStorage(imageData) {
    try {
        // 获取现有图片
        let sitePictures = localStorage.getItem('sitePictures');
        let pictures = sitePictures ? JSON.parse(sitePictures) : [];
        
        // 创建新图片对象
        const newPicture = {
            id: generateUniqueId(),
            name: imageData.name,
            category: imageData.category,
            url: imageData.dataUrl,
            description: imageData.description || '',
            dateAdded: new Date().toISOString()
        };
        
        // 添加到数据
        pictures.push(newPicture);
        
        // 保存到localStorage
        localStorage.setItem('sitePictures', JSON.stringify(pictures));
        console.log(`Added ${imageData.name} to localStorage`);
        return true;
    } catch (error) {
        console.error('Error adding image to localStorage:', error);
        return false;
    }
}

// 创建一个图片错误占位符
async function createImageErrorPlaceholder() {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // 填充背景色
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加错误图标
    ctx.fillStyle = '#888888';
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚠️', canvas.width / 2, canvas.height / 2 - 40);
    
    // 添加错误文本
    ctx.fillStyle = '#666666';
    ctx.font = '24px Arial';
    ctx.fillText('Image Not Found', canvas.width / 2, canvas.height / 2 + 20);
    
    // 将canvas转换为dataURL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    // 保存到文件
    try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'image-error.jpg', { type: 'image/jpeg' });
        console.log('Created image-error.jpg placeholder');
        return {
            file: file,
            dataUrl: dataUrl
        };
    } catch (error) {
        console.error('Error creating image error placeholder:', error);
        return null;
    }
}

// 主函数：下载图片并添加到网站
async function downloadImagesAndAddToSite() {
    console.log('Starting image download and processing...');
    
    // 要下载的斯里兰卡相关图片列表
    const imagesToDownload = [
        {
            url: 'https://images.unsplash.com/photo-1586948430486-81e990197f2e',
            name: 'Sigiriya Rock Fortress',
            category: 'scenery',
            description: 'Ancient rock fortress in central Sri Lanka'
        },
        {
            url: 'https://images.unsplash.com/photo-1581618748913-eb58e126c907',
            name: 'Sri Lankan Beach',
            category: 'beach',
            description: 'Beautiful tropical beach with palm trees'
        },
        {
            url: 'https://images.unsplash.com/photo-1629995297574-c1fc3f5a6a99',
            name: 'Sri Lankan Cuisine',
            category: 'food',
            description: 'Traditional Sri Lankan rice and curry dishes'
        },
        {
            url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883',
            name: 'Kandy Temple',
            category: 'culture',
            description: 'Sacred Temple of the Tooth Relic in Kandy'
        },
        {
            url: 'https://images.unsplash.com/photo-1589879809594-71a8a2c22fb3',
            name: 'Wild Elephants',
            category: 'wildlife',
            description: 'Wild elephants in Udawalawe National Park'
        },
        {
            url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2',
            name: 'Tea Plantations',
            category: 'scenery',
            description: 'Beautiful tea plantations in the highlands'
        },
        {
            url: 'https://images.unsplash.com/photo-1622134445522-ce128429e163',
            name: 'Traditional Dancers',
            category: 'culture',
            description: 'Colorful Kandyan dancers in traditional costume'
        },
        {
            url: 'https://images.unsplash.com/photo-1622623349703-63cd94acac6a',
            name: 'Train to Ella',
            category: 'scenery',
            description: 'Scenic train ride through Sri Lankan highlands'
        }
    ];
    
    // 创建错误占位符图片
    const errorPlaceholder = await createImageErrorPlaceholder();
    if (errorPlaceholder) {
        // 保存错误图片
        const errorImageData = {
            name: 'Error Image',
            category: 'system',
            dataUrl: errorPlaceholder.dataUrl,
            description: 'Placeholder for image loading errors'
        };
        
        // 添加到本地存储
        await addImageToLocalStorage(errorImageData);
    }
    
    // 下载并添加所有图片
    for (const imageInfo of imagesToDownload) {
        try {
            // 下载图片
            const imageData = await downloadAndSaveImage(imageInfo.url, imageInfo.name);
            
            // 压缩图片
            const compressedDataUrl = await compressImage(imageData.dataUrl);
            
            // 将图片添加到本地存储
            const addResult = await addImageToLocalStorage({
                name: imageInfo.name,
                category: imageInfo.category,
                dataUrl: compressedDataUrl,
                description: imageInfo.description
            });
            
            if (addResult) {
                console.log(`Successfully added ${imageInfo.name} to site`);
            }
        } catch (error) {
            console.error(`Failed to process image ${imageInfo.name}:`, error);
        }
    }
    
    console.log('Image download and processing completed');
    alert('Images have been successfully added to the site. Please refresh the admin page to see the new images.');
}

// 执行主函数
downloadImagesAndAddToSite().catch(error => {
    console.error('Error in main execution:', error);
    alert('An error occurred while downloading images. Please check the console for details.');
});