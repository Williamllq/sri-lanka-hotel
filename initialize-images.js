/**
 * initialize-images.js
 * 
 * 将下载的图片添加到网站管理界面
 * 注意：此文件应在前端环境中运行，通过在浏览器控制台执行或添加到HTML页面中
 */

// 初始化图片到localStorage
async function initializeImagesToLocalStorage() {
    console.log('开始初始化图片到网站管理界面...');
    
    try {
        // 加载图片注册表
        const response = await fetch('images/image-registry.json');
        if (!response.ok) {
            throw new Error('无法加载图片注册表。请确保已运行下载脚本。');
        }
        
        const registry = await response.json();
        console.log(`找到 ${registry.images.length} 张图片需要初始化`);
        
        // 获取现有的图片数据
        let existingPictures = [];
        const storedPictures = localStorage.getItem('sitePictures');
        if (storedPictures) {
            try {
                existingPictures = JSON.parse(storedPictures);
                console.log(`存在 ${existingPictures.length} 张已存储的图片`);
            } catch (err) {
                console.error('解析现有图片数据时出错:', err);
                existingPictures = [];
            }
        }
        
        // 准备新图片数组
        const newPictures = [];
        
        // 为每张图片生成新条目
        for (const image of registry.images) {
            try {
                // 检查图片是否已存在（基于文件名）
                const imageExists = existingPictures.some(p => 
                    p.name === image.name || p.url.includes(image.filename)
                );
                
                if (imageExists) {
                    console.log(`图片已存在，跳过: ${image.name}`);
                    continue;
                }
                
                // 加载图片并转换为data URL
                const imgResponse = await fetch(`images/${image.filename}`);
                if (!imgResponse.ok) {
                    throw new Error(`无法加载图片: ${image.filename}`);
                }
                
                const blob = await imgResponse.blob();
                const dataUrl = await blobToDataURL(blob);
                
                // 压缩图片
                const compressedDataUrl = await compressImage(dataUrl);
                
                // 创建新图片对象
                const newPicture = {
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    name: image.name,
                    category: image.category,
                    url: compressedDataUrl,
                    description: image.description || '',
                    dateAdded: new Date().toISOString()
                };
                
                newPictures.push(newPicture);
                console.log(`已处理图片: ${image.name}`);
            } catch (error) {
                console.error(`处理图片时出错 ${image.filename}:`, error);
            }
        }
        
        // 如果有新图片，添加到现有图片并保存
        if (newPictures.length > 0) {
            const combinedPictures = [...existingPictures, ...newPictures];
            
            // 保存到localStorage
            try {
                const jsonString = JSON.stringify(combinedPictures);
                localStorage.setItem('sitePictures', jsonString);
                console.log(`成功添加了 ${newPictures.length} 张新图片到管理界面`);
                
                // 添加一些图片到轮播图
                await addImagesToCarousel(newPictures);
                
                return {
                    success: true,
                    message: `成功初始化 ${newPictures.length} 张图片到管理界面。请刷新页面查看图片`
                };
            } catch (error) {
                console.error('保存到localStorage时出错:', error);
                return {
                    success: false,
                    message: `保存图片数据时出错: ${error.message}`
                };
            }
        } else {
            console.log('没有新图片需要添加');
            return {
                success: true,
                message: '没有新图片需要添加。所有图片已存在于管理界面中'
            };
        }
    } catch (error) {
        console.error('初始化图片时出错:', error);
        return {
            success: false,
            message: `初始化图片时出错: ${error.message}`
        };
    }
}

// 将Blob转换为DataURL
function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('将图片转换为数据URL时出错'));
        reader.readAsDataURL(blob);
    });
}

// 压缩图片
function compressImage(dataURL, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
        console.log("开始图片压缩...");
        const img = new Image();
        img.onload = function() {
            // 计算新尺寸
            let width = img.width;
            let height = img.height;
            
            console.log("原始图片尺寸:", width, "x", height);
            
            if (width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height = height * ratio;
                console.log("调整尺寸为:", width, "x", height);
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
            console.log("压缩完成. 原始大小:", Math.round(dataURL.length / 1024), "KB, 新大小:", Math.round(compressedDataURL.length / 1024), "KB");
            resolve(compressedDataURL);
        };
        img.onerror = function(err) {
            console.error("加载图片进行压缩时失败:", err);
            reject(new Error('加载图片进行压缩时失败'));
        };
        img.src = dataURL;
    });
}

// 添加图片到轮播图
async function addImagesToCarousel(pictures) {
    // 获取现有的轮播图图片
    let carouselImages = [];
    const storedCarouselImages = localStorage.getItem('siteCarouselImages');
    if (storedCarouselImages) {
        try {
            carouselImages = JSON.parse(storedCarouselImages);
        } catch (err) {
            console.error('解析轮播图数据时出错:', err);
            carouselImages = [];
        }
    }
    
    // 选择一些图片添加到轮播图（最多5张）
    const picturesToAdd = pictures.slice(0, 5);
    
    // 添加到轮播图
    if (picturesToAdd.length > 0) {
        const updatedCarousel = [...carouselImages, ...picturesToAdd];
        
        // 保存到localStorage
        try {
            localStorage.setItem('siteCarouselImages', JSON.stringify(updatedCarousel));
            console.log(`已添加 ${picturesToAdd.length} 张图片到轮播图`);
            return true;
        } catch (error) {
            console.error('保存轮播图数据时出错:', error);
            return false;
        }
    }
    
    return true;
}

// 页面加载时自动初始化
window.addEventListener('DOMContentLoaded', async () => {
    // 检查是否在管理界面
    const isAdminPage = document.querySelector('.admin-dashboard') !== null;
    
    if (isAdminPage) {
        console.log('检测到管理界面，准备初始化图片...');
        
        // 延迟执行以确保页面完全加载
        setTimeout(async () => {
            const result = await initializeImagesToLocalStorage();
            
            if (result.success) {
                // 创建成功消息
                const successMessage = document.createElement('div');
                successMessage.className = 'admin-notification success';
                successMessage.innerHTML = `
                    <div class="notification-content">
                        <i class="fas fa-check-circle"></i>
                        <span>${result.message}</span>
                    </div>
                `;
                document.body.appendChild(successMessage);
                
                // 5秒后自动移除消息
                setTimeout(() => {
                    successMessage.style.opacity = '0';
                    setTimeout(() => {
                        document.body.removeChild(successMessage);
                    }, 500);
                }, 5000);
            }
        }, 1000);
    } else {
        console.log('不在管理界面，跳过图片初始化');
    }
});

// 为了手动在控制台调用
window.initializeImages = initializeImagesToLocalStorage;