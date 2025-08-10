// 创建一个简单的脚本，将已有的图片添加到localStorage
document.addEventListener('DOMContentLoaded', function() {
    // 已有的图片数据
    const imageData = [
        {
            filename: 'Scenery in Sir Lanka 1.jpg',
            name: 'Sri Lanka Scenery 1',
            category: 'scenery',
            description: 'Beautiful landscape in Sri Lanka'
        },
        {
            filename: 'Scenery in Sir Lanka 2.jpg',
            name: 'Sri Lanka Scenery 2',
            category: 'scenery',
            description: 'Amazing views of Sri Lanka countryside'
        },
        {
            filename: 'Scenery in Sir Lanka elephant 1.jpg',
            name: 'Sri Lankan Elephant',
            category: 'wildlife',
            description: 'Wild elephant in its natural habitat'
        },
        {
            filename: 'Scenery in Sir Lanka monkey.jpg',
            name: 'Sri Lankan Monkey',
            category: 'wildlife',
            description: 'Monkeys in Sri Lanka forests'
        },
        {
            filename: 'Tea factory 1.jpg',
            name: 'Tea Plantation',
            category: 'culture',
            description: 'Famous Sri Lankan tea plantations'
        },
        {
            filename: 'Car1.jpg',
            name: 'Transport in Sri Lanka',
            category: 'transport',
            description: 'Local transportation options'
        }
    ];

    // 添加图片到localStorage
    function addImagesToLocalStorage() {
        // 获取现有图片数据
        let sitePictures = localStorage.getItem('sitePictures');
        let pictures = sitePictures ? JSON.parse(sitePictures) : [];
        
        // 标记是否有新图片添加
        let addedImages = false;
        
        // 检查每个图片是否已存在
        imageData.forEach(image => {
            // 检查图片是否已存在
            const imageExists = pictures.some(p => 
                p.name === image.name || (p.url && p.url.includes(image.filename))
            );
            
            if (!imageExists) {
                // 创建新图片对象
                const newPicture = {
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    name: image.name,
                    category: image.category,
                    url: 'images/' + image.filename,
                    description: image.description || '',
                    dateAdded: new Date().toISOString()
                };
                
                // 添加到数组
                pictures.push(newPicture);
                addedImages = true;
                console.log(`已添加图片: ${image.name}`);
            } else {
                console.log(`图片已存在，跳过: ${image.name}`);
            }
        });
        
        // 只有在添加了新图片时才保存
        if (addedImages) {
            localStorage.setItem('sitePictures', JSON.stringify(pictures));
            console.log('已成功将图片添加到localStorage');
            return true;
        } else {
            console.log('没有新图片需要添加');
            return false;
        }
    }

    // 添加一些图片到轮播图
    function addImagesToCarousel() {
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
        
        // 获取当前图片库
        let sitePictures = localStorage.getItem('sitePictures');
        if (!sitePictures) return false;
        
        const pictures = JSON.parse(sitePictures);
        
        // 选择前3张图片添加到轮播图（如果尚未添加）
        const picturesToAdd = [];
        pictures.slice(0, 3).forEach(picture => {
            // 检查是否已存在于轮播图中
            const alreadyInCarousel = carouselImages.some(img => img.id === picture.id);
            if (!alreadyInCarousel) {
                picturesToAdd.push(picture);
            }
        });
        
        // 如果有新图片要添加到轮播图
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

    // 执行添加图片和添加轮播图的操作
    const addImagesButton = document.getElementById('addImagesButton');
    if (addImagesButton) {
        addImagesButton.addEventListener('click', function() {
            const added = addImagesToLocalStorage();
            if (added) {
                addImagesToCarousel();
                alert('已成功添加图片到管理界面和轮播图！请刷新管理页面查看。');
            } else {
                alert('所有图片已存在于管理界面中。');
            }
        });
    } else {
        // 如果不是在专门的页面，而是直接在console运行
        addImagesToLocalStorage();
        addImagesToCarousel();
    }
});

// 为了在控制台中可以直接调用
window.addImagesToSystem = function() {
    // 触发自定义事件，让上面的代码执行
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
    
    return "图片添加过程已启动，请查看控制台输出。";
};