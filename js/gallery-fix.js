// 修复图片显示问题的脚本
document.addEventListener('DOMContentLoaded', function() {
    // 等待原始脚本加载完成
    setTimeout(function() {
        // 1. 修复图片显示方式
        const featuredImages = document.querySelectorAll('.featured-image img');
        featuredImages.forEach(img => {
            img.style.objectFit = 'cover';
            img.style.width = '100%';
            img.style.height = '100%';
        });
        
        // 2. 修复缩略图显示
        const thumbnailImages = document.querySelectorAll('.gallery-thumbnail img');
        thumbnailImages.forEach(img => {
            img.style.objectFit = 'cover';
        });
        
        // 3. 修复"No images found"问题
        const featuredTitle = document.querySelector('.featured-title');
        const featuredDesc = document.querySelector('.featured-desc');
        const featuredImage = document.querySelector('.featured-image');
        const thumbnails = document.querySelectorAll('.gallery-thumbnail');
        
        // 如果有"No images found"文本但实际上有缩略图
        if (featuredTitle && featuredTitle.textContent === 'No images found' && thumbnails.length > 0) {
            // 使用第一个缩略图作为主图
            const firstThumb = thumbnails[0];
            const img = firstThumb.querySelector('img');
            
            if (img && featuredImage) {
                // 清空并设置新图片
                featuredImage.innerHTML = '';
                const newImg = document.createElement('img');
                newImg.src = img.src;
                newImg.alt = img.alt || 'Gallery image';
                newImg.style.width = '100%';
                newImg.style.height = '100%';
                newImg.style.objectFit = 'cover';
                featuredImage.appendChild(newImg);
                
                // 更新标题和描述
                const currentCategory = document.querySelector('.current-category');
                const categoryName = currentCategory ? currentCategory.textContent : 'Scenery';
                
                featuredTitle.textContent = categoryName + ' of Sri Lanka';
                featuredDesc.textContent = 'Explore beautiful ' + categoryName.toLowerCase() + ' scenes of Sri Lanka';
            }
        }
        
        console.log('Gallery display fixes applied');
    }, 500); // 给原始脚本一些加载时间
}); 