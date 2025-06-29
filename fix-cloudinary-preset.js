/**
 * 临时修复 Cloudinary 上传预设问题
 * 使用 Cloudinary 的默认无签名预设 'ml_default'
 */

// 修改云存储配置使用默认预设
if (window.cloudStorage && window.cloudStorage.config) {
    console.log('修复 Cloudinary 上传预设...');
    
    // 使用 Cloudinary 的默认无签名预设
    window.cloudStorage.config.uploadPreset = 'ml_default';
    
    console.log('已将上传预设更改为 ml_default');
    console.log('当前配置:', window.cloudStorage.config);
}

// 修改上传函数以确保使用正确的预设
const originalUploadImage = window.cloudStorage ? window.cloudStorage.uploadImage : null;
if (originalUploadImage) {
    window.cloudStorage.uploadImage = async function(imageData, options = {}) {
        // 确保使用 ml_default 预设
        const formData = new FormData();
        
        // 处理不同类型的图片数据
        if (imageData instanceof File) {
            formData.append('file', imageData);
        } else if (typeof imageData === 'string') {
            formData.append('file', imageData);
        } else if (imageData instanceof Blob) {
            formData.append('file', imageData, 'image.jpg');
        }
        
        // 使用 ml_default 预设
        formData.append('upload_preset', 'ml_default');
        
        // 添加其他选项
        if (options.folder) {
            formData.append('folder', options.folder);
        }
        if (options.tags) {
            formData.append('tags', options.tags.join(','));
        }
        
        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${window.cloudStorage.config.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );
            
            const data = await response.json();
            
            if (response.ok && data.secure_url) {
                return {
                    success: true,
                    data: {
                        secure_url: data.secure_url,
                        public_id: data.public_id,
                        format: data.format,
                        width: data.width,
                        height: data.height,
                        bytes: data.bytes,
                        urls: {
                            original: data.secure_url,
                            thumbnail: data.secure_url.replace('/upload/', '/upload/w_300,h_300,c_fill/'),
                            medium: data.secure_url.replace('/upload/', '/upload/w_800,h_600,c_limit/'),
                            large: data.secure_url.replace('/upload/', '/upload/w_1200,h_900,c_limit/')
                        }
                    }
                };
            } else {
                console.error('上传失败:', data);
                return {
                    success: false,
                    error: data.error?.message || '上传失败'
                };
            }
        } catch (error) {
            console.error('网络错误:', error);
            return {
                success: false,
                error: error.message
            };
        }
    };
    
    console.log('云存储上传函数已修复');
}

console.log('Cloudinary 预设修复完成'); 