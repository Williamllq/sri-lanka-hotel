/**
 * Admin Content Management
 * 处理管理员界面的内容管理功能（文章、视频、链接）
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Content Management loaded');
    
    // 初始化内容管理
    initContentManagement();
});

/**
 * 初始化内容管理功能
 */
function initContentManagement() {
    console.log('初始化内容管理');
    
    // 设置标签切换功能
    setupContentTabs();
    
    // 初始化各内容类型管理
    initArticleManagement();
    initVideoManagement();
    initLinkManagement();
}

/**
 * 设置内容管理标签切换功能
 */
function setupContentTabs() {
    const contentTabs = document.querySelectorAll('.admin-tab');
    if (contentTabs.length === 0) {
        console.error('Content tabs not found');
        return;
    }
    
    contentTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有标签的活动状态
            contentTabs.forEach(t => t.classList.remove('active'));
            
            // 设置当前标签为活动状态
            this.classList.add('active');
            
            // 获取目标内容ID
            const targetId = this.getAttribute('data-tab') + 'Content';
            
            // 隐藏所有内容
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // 显示目标内容
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

/**
 * 初始化文章管理功能
 */
function initArticleManagement() {
    // 加载和显示文章
    loadAndDisplayArticles();
    
    // 设置添加文章按钮
    const addArticleBtn = document.getElementById('addArticleBtn');
    if (addArticleBtn) {
        addArticleBtn.addEventListener('click', function() {
            // 重置表单
            const articleForm = document.getElementById('articleForm');
            if (articleForm) {
                articleForm.reset();
                
                // 清除隐藏ID字段
                const articleId = document.getElementById('articleId');
                if (articleId) {
                    articleId.value = '';
                }
                
                // 更新模态框标题
                const modalTitle = document.getElementById('articleModalTitle');
                if (modalTitle) {
                    modalTitle.textContent = 'Add New Article';
                }
                
                // 清除图片预览
                const imagePreview = document.getElementById('articleImagePreview');
                if (imagePreview) {
                    imagePreview.src = '';
                    imagePreview.style.display = 'none';
                }
            }
            
            // 打开模态框
            if (typeof openModal === 'function') {
                openModal('articleModal');
            } else {
                const modal = document.getElementById('articleModal');
                if (modal) {
                    modal.style.display = 'block';
                }
            }
        });
    }
    
    // 设置文章表单提交
    const articleForm = document.getElementById('articleForm');
    if (articleForm) {
        articleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 保存文章
            saveArticle();
        });
    }
    
    // 设置取消按钮
    const cancelArticleBtn = document.getElementById('cancelArticleBtn');
    if (cancelArticleBtn) {
        cancelArticleBtn.addEventListener('click', function() {
            if (typeof closeModal === 'function') {
                closeModal('articleModal');
            } else {
                const modal = document.getElementById('articleModal');
                if (modal) {
                    modal.style.display = 'none';
                }
            }
        });
    }
    
    // 设置文章图片上传预览
    const articleImage = document.getElementById('articleImage');
    const articleImagePreview = document.getElementById('articleImagePreview');
    if (articleImage && articleImagePreview) {
        articleImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    articleImagePreview.src = event.target.result;
                    articleImagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

/**
 * 加载并显示文章列表
 */
function loadAndDisplayArticles() {
    const articlesList = document.getElementById('articlesList');
    if (!articlesList) {
        console.error('Articles list container not found');
        return;
    }
    
    // 从localStorage获取文章
    const articlesStr = localStorage.getItem('adminArticles');
    const articles = articlesStr ? JSON.parse(articlesStr) : [];
    
    // 清空列表
    articlesList.innerHTML = '';
    
    // 如果没有文章，显示提示
    if (articles.length === 0) {
        articlesList.innerHTML = `
            <div class="no-content-message">
                <i class="fas fa-newspaper"></i>
                <p>No articles found. Click "Add New Article" to create some.</p>
            </div>
        `;
        return;
    }
    
    // 显示所有文章
    articles.forEach(article => {
        const articleItem = document.createElement('div');
        articleItem.className = 'content-item';
        
        articleItem.innerHTML = `
            <div class="content-image">
                ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}">` : '<div class="no-image"><i class="fas fa-image"></i></div>'}
            </div>
            <div class="content-info">
                <h3>${article.title}</h3>
                <p>${article.description}</p>
                <div class="content-meta">
                    <span class="content-date">${new Date(article.createdAt).toLocaleDateString()}</span>
                    ${article.externalLink ? `<a href="${article.externalLink}" target="_blank" class="content-link"><i class="fas fa-external-link-alt"></i> External Link</a>` : ''}
                </div>
            </div>
            <div class="content-actions">
                <button class="edit-article-btn" data-id="${article.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-article-btn" data-id="${article.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        articlesList.appendChild(articleItem);
    });
    
    // 添加编辑和删除事件处理
    setupArticleEventHandlers();
}

/**
 * 设置文章项的事件处理程序
 */
function setupArticleEventHandlers() {
    // 编辑按钮
    const editButtons = document.querySelectorAll('.edit-article-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const articleId = this.getAttribute('data-id');
            editArticle(articleId);
        });
    });
    
    // 删除按钮
    const deleteButtons = document.querySelectorAll('.delete-article-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const articleId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
                deleteArticle(articleId);
            }
        });
    });
}

/**
 * 保存文章
 */
function saveArticle() {
    // 获取表单数据
    const articleId = document.getElementById('articleId').value;
    const title = document.getElementById('articleTitle').value.trim();
    const description = document.getElementById('articleDescription').value.trim();
    const content = document.getElementById('articleContent').value.trim();
    const externalLink = document.getElementById('articleExternalLink').value.trim();
    
    // 验证必填字段
    if (!title) {
        alert('Please enter a title for the article');
        return;
    }
    
    if (!description) {
        alert('Please enter a description for the article');
        return;
    }
    
    // 创建文章对象
    const article = {
        id: articleId || 'article_' + Date.now(),
        title: title,
        description: description,
        content: content,
        externalLink: externalLink,
        createdAt: new Date().toISOString()
    };
    
    // 处理图片上传
    const imageInput = document.getElementById('articleImage');
    const imagePreview = document.getElementById('articleImagePreview');
    
    if (imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            article.imageUrl = e.target.result;
            saveArticleToStorage(article);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else if (imagePreview.src && imagePreview.style.display !== 'none') {
        // 保留现有图片
        article.imageUrl = imagePreview.src;
        saveArticleToStorage(article);
    } else {
        // 没有图片
        article.imageUrl = '';
        saveArticleToStorage(article);
    }
}

/**
 * 保存文章到localStorage
 * @param {Object} article - 文章对象
 */
function saveArticleToStorage(article) {
    try {
        // 从localStorage获取现有文章
        const articlesStr = localStorage.getItem('adminArticles');
        let articles = articlesStr ? JSON.parse(articlesStr) : [];
        
        // 确保是数组
        if (!Array.isArray(articles)) {
            articles = [];
        }
        
        // 检查是否存在具有相同ID的文章（编辑模式）
        const existingIndex = articles.findIndex(a => a.id === article.id);
        
        if (existingIndex !== -1) {
            // 更新现有文章
            articles[existingIndex] = article;
        } else {
            // 添加新文章
            articles.push(article);
        }
        
        // 保存回localStorage
        localStorage.setItem('adminArticles', JSON.stringify(articles));
        
        // 关闭模态框
        if (typeof closeModal === 'function') {
            closeModal('articleModal');
        } else {
            const modal = document.getElementById('articleModal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
        
        // 重新加载文章列表
        loadAndDisplayArticles();
        
        // 显示成功消息
        alert('Article saved successfully');
    } catch (e) {
        console.error('Error saving article:', e);
        alert('Failed to save article');
    }
}

/**
 * 编辑文章
 * @param {string} articleId - 文章ID
 */
function editArticle(articleId) {
    // 从localStorage获取文章
    const articlesStr = localStorage.getItem('adminArticles');
    const articles = articlesStr ? JSON.parse(articlesStr) : [];
    
    // 查找指定文章
    const article = articles.find(a => a.id === articleId);
    if (!article) {
        console.error('Article not found:', articleId);
        return;
    }
    
    // 填充表单
    document.getElementById('articleId').value = article.id;
    document.getElementById('articleTitle').value = article.title;
    document.getElementById('articleDescription').value = article.description;
    document.getElementById('articleContent').value = article.content || '';
    document.getElementById('articleExternalLink').value = article.externalLink || '';
    
    // 设置图片预览
    const imagePreview = document.getElementById('articleImagePreview');
    if (article.imageUrl) {
        imagePreview.src = article.imageUrl;
        imagePreview.style.display = 'block';
    } else {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
    }
    
    // 更新模态框标题
    const modalTitle = document.getElementById('articleModalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Edit Article';
    }
    
    // 打开模态框
    if (typeof openModal === 'function') {
        openModal('articleModal');
    } else {
        const modal = document.getElementById('articleModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
}

/**
 * 删除文章
 * @param {string} articleId - 文章ID
 */
function deleteArticle(articleId) {
    try {
        // 从localStorage获取文章
        const articlesStr = localStorage.getItem('adminArticles');
        let articles = articlesStr ? JSON.parse(articlesStr) : [];
        
        // 移除指定文章
        articles = articles.filter(article => article.id !== articleId);
        
        // 保存回localStorage
        localStorage.setItem('adminArticles', JSON.stringify(articles));
        
        // 重新加载文章列表
        loadAndDisplayArticles();
        
        // 显示成功消息
        alert('Article deleted successfully');
    } catch (e) {
        console.error('Error deleting article:', e);
        alert('Failed to delete article');
    }
}

/**
 * 初始化视频管理功能
 */
function initVideoManagement() {
    // 加载和显示视频
    loadAndDisplayVideos();
    
    // 设置添加视频按钮
    const addVideoBtn = document.getElementById('addVideoBtn');
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', function() {
            // 重置表单
            const videoForm = document.getElementById('videoForm');
            if (videoForm) {
                videoForm.reset();
                
                // 清除隐藏ID字段
                const videoId = document.getElementById('videoId');
                if (videoId) {
                    videoId.value = '';
                }
                
                // 更新模态框标题
                const modalTitle = document.getElementById('videoModalTitle');
                if (modalTitle) {
                    modalTitle.textContent = 'Add New Video';
                }
                
                // 清除图片预览
                const thumbnailPreview = document.getElementById('videoThumbnailPreview');
                if (thumbnailPreview) {
                    thumbnailPreview.src = '';
                    thumbnailPreview.style.display = 'none';
                }
            }
            
            // 打开模态框
            if (typeof openModal === 'function') {
                openModal('videoModal');
            } else {
                const modal = document.getElementById('videoModal');
                if (modal) {
                    modal.style.display = 'block';
                }
            }
        });
    }
    
    // 设置视频表单提交
    const videoForm = document.getElementById('videoForm');
    if (videoForm) {
        videoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveVideo();
        });
    }
    
    // 设置取消按钮
    const cancelVideoBtn = document.getElementById('cancelVideoBtn');
    if (cancelVideoBtn) {
        cancelVideoBtn.addEventListener('click', function() {
            if (typeof closeModal === 'function') {
                closeModal('videoModal');
            } else {
                const modal = document.getElementById('videoModal');
                if (modal) {
                    modal.style.display = 'none';
                }
            }
        });
    }
    
    // 设置缩略图上传预览
    const videoThumbnail = document.getElementById('videoThumbnail');
    const thumbnailPreview = document.getElementById('videoThumbnailPreview');
    if (videoThumbnail && thumbnailPreview) {
        videoThumbnail.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    thumbnailPreview.src = event.target.result;
                    thumbnailPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

/**
 * 加载并显示视频列表
 */
function loadAndDisplayVideos() {
    const videosList = document.getElementById('videosList');
    if (!videosList) {
        console.error('Videos list container not found');
        return;
    }
    
    // 从localStorage获取视频
    const videosStr = localStorage.getItem('adminVideos');
    const videos = videosStr ? JSON.parse(videosStr) : [];
    
    // 清空列表
    videosList.innerHTML = '';
    
    // 如果没有视频，显示提示
    if (videos.length === 0) {
        videosList.innerHTML = `
            <div class="no-content-message">
                <i class="fas fa-video"></i>
                <p>No videos found. Click "Add New Video" to create some.</p>
            </div>
        `;
        return;
    }
    
    // 显示所有视频
    videos.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.className = 'content-item';
        
        videoItem.innerHTML = `
            <div class="content-image">
                ${video.thumbnailUrl ? `<img src="${video.thumbnailUrl}" alt="${video.title}">` : '<div class="no-image"><i class="fas fa-video"></i></div>'}
            </div>
            <div class="content-info">
                <h3>${video.title}</h3>
                <p>${video.description}</p>
                <div class="content-meta">
                    <span class="content-date">${new Date(video.createdAt).toLocaleDateString()}</span>
                    <a href="${video.videoUrl}" target="_blank" class="content-link"><i class="fas fa-play-circle"></i> Watch Video</a>
                </div>
            </div>
            <div class="content-actions">
                <button class="edit-video-btn" data-id="${video.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-video-btn" data-id="${video.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        videosList.appendChild(videoItem);
    });
    
    // 添加编辑和删除事件处理
    setupVideoEventHandlers();
}

/**
 * 设置视频项的事件处理程序
 */
function setupVideoEventHandlers() {
    // 编辑按钮
    const editButtons = document.querySelectorAll('.edit-video-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const videoId = this.getAttribute('data-id');
            editVideo(videoId);
        });
    });
    
    // 删除按钮
    const deleteButtons = document.querySelectorAll('.delete-video-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const videoId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
                deleteVideo(videoId);
            }
        });
    });
}

/**
 * 保存视频
 */
function saveVideo() {
    // 获取表单数据
    const videoId = document.getElementById('videoId').value;
    const title = document.getElementById('videoTitle').value.trim();
    const description = document.getElementById('videoDescription').value.trim();
    const videoUrl = document.getElementById('videoUrl').value.trim();
    
    // 验证必填字段
    if (!title) {
        alert('Please enter a title for the video');
        return;
    }
    
    if (!description) {
        alert('Please enter a description for the video');
        return;
    }
    
    if (!videoUrl) {
        alert('Please enter a video URL');
        return;
    }
    
    // 创建视频对象
    const video = {
        id: videoId || 'video_' + Date.now(),
        title: title,
        description: description,
        videoUrl: videoUrl,
        createdAt: new Date().toISOString()
    };
    
    // 处理缩略图上传
    const thumbnailInput = document.getElementById('videoThumbnail');
    const thumbnailPreview = document.getElementById('videoThumbnailPreview');
    
    if (thumbnailInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            video.thumbnailUrl = e.target.result;
            saveVideoToStorage(video);
        };
        reader.readAsDataURL(thumbnailInput.files[0]);
    } else if (thumbnailPreview.src && thumbnailPreview.style.display !== 'none') {
        // 保留现有缩略图
        video.thumbnailUrl = thumbnailPreview.src;
        saveVideoToStorage(video);
    } else {
        // 没有缩略图，尝试自动从YouTube或Vimeo获取
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            const videoId = extractYouTubeVideoId(videoUrl);
            if (videoId) {
                video.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
            }
        }
        // 可以添加对其他视频平台的支持
        
        saveVideoToStorage(video);
    }
}

/**
 * 提取YouTube视频ID
 * @param {string} url - YouTube URL
 * @returns {string|null} - 视频ID或null
 */
function extractYouTubeVideoId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

/**
 * 保存视频到localStorage
 * @param {Object} video - 视频对象
 */
function saveVideoToStorage(video) {
    try {
        // 从localStorage获取现有视频
        const videosStr = localStorage.getItem('adminVideos');
        let videos = videosStr ? JSON.parse(videosStr) : [];
        
        // 确保是数组
        if (!Array.isArray(videos)) {
            videos = [];
        }
        
        // 检查是否存在具有相同ID的视频（编辑模式）
        const existingIndex = videos.findIndex(v => v.id === video.id);
        
        if (existingIndex !== -1) {
            // 更新现有视频
            videos[existingIndex] = video;
        } else {
            // 添加新视频
            videos.push(video);
        }
        
        // 保存回localStorage
        localStorage.setItem('adminVideos', JSON.stringify(videos));
        
        // 关闭模态框
        if (typeof closeModal === 'function') {
            closeModal('videoModal');
        } else {
            const modal = document.getElementById('videoModal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
        
        // 重新加载视频列表
        loadAndDisplayVideos();
        
        // 显示成功消息
        alert('Video saved successfully');
    } catch (e) {
        console.error('Error saving video:', e);
        alert('Failed to save video');
    }
}

/**
 * 编辑视频
 * @param {string} videoId - 视频ID
 */
function editVideo(videoId) {
    // 从localStorage获取视频
    const videosStr = localStorage.getItem('adminVideos');
    const videos = videosStr ? JSON.parse(videosStr) : [];
    
    // 查找指定视频
    const video = videos.find(v => v.id === videoId);
    if (!video) {
        console.error('Video not found:', videoId);
        return;
    }
    
    // 填充表单
    document.getElementById('videoId').value = video.id;
    document.getElementById('videoTitle').value = video.title;
    document.getElementById('videoDescription').value = video.description;
    document.getElementById('videoUrl').value = video.videoUrl;
    
    // 设置缩略图预览
    const thumbnailPreview = document.getElementById('videoThumbnailPreview');
    if (video.thumbnailUrl) {
        thumbnailPreview.src = video.thumbnailUrl;
        thumbnailPreview.style.display = 'block';
    } else {
        thumbnailPreview.src = '';
        thumbnailPreview.style.display = 'none';
    }
    
    // 更新模态框标题
    const modalTitle = document.getElementById('videoModalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Edit Video';
    }
    
    // 打开模态框
    if (typeof openModal === 'function') {
        openModal('videoModal');
    } else {
        const modal = document.getElementById('videoModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
}

/**
 * 删除视频
 * @param {string} videoId - 视频ID
 */
function deleteVideo(videoId) {
    try {
        // 从localStorage获取视频
        const videosStr = localStorage.getItem('adminVideos');
        let videos = videosStr ? JSON.parse(videosStr) : [];
        
        // 移除指定视频
        videos = videos.filter(video => video.id !== videoId);
        
        // 保存回localStorage
        localStorage.setItem('adminVideos', JSON.stringify(videos));
        
        // 重新加载视频列表
        loadAndDisplayVideos();
        
        // 显示成功消息
        alert('Video deleted successfully');
    } catch (e) {
        console.error('Error deleting video:', e);
        alert('Failed to delete video');
    }
}

/**
 * 初始化链接管理功能
 */
function initLinkManagement() {
    // 加载和显示链接
    loadAndDisplayLinks();
    
    // 设置添加链接按钮
    const addLinkBtn = document.getElementById('addLinkBtn');
    if (addLinkBtn) {
        addLinkBtn.addEventListener('click', function() {
            // 重置表单
            const linkForm = document.getElementById('linkForm');
            if (linkForm) {
                linkForm.reset();
                
                // 清除隐藏ID字段
                const linkId = document.getElementById('linkId');
                if (linkId) {
                    linkId.value = '';
                }
                
                // 更新模态框标题
                const modalTitle = document.getElementById('linkModalTitle');
                if (modalTitle) {
                    modalTitle.textContent = 'Add New Link';
                }
                
                // 设置默认图标
                const iconInput = document.getElementById('linkIcon');
                if (iconInput) {
                    iconInput.value = 'fas fa-globe';
                }
            }
            
            // 打开模态框
            if (typeof openModal === 'function') {
                openModal('linkModal');
            } else {
                const modal = document.getElementById('linkModal');
                if (modal) {
                    modal.style.display = 'block';
                }
            }
        });
    }
    
    // 设置链接表单提交
    const linkForm = document.getElementById('linkForm');
    if (linkForm) {
        linkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveLink();
        });
    }
    
    // 设置取消按钮
    const cancelLinkBtn = document.getElementById('cancelLinkBtn');
    if (cancelLinkBtn) {
        cancelLinkBtn.addEventListener('click', function() {
            if (typeof closeModal === 'function') {
                closeModal('linkModal');
            } else {
                const modal = document.getElementById('linkModal');
                if (modal) {
                    modal.style.display = 'none';
                }
            }
        });
    }
}

/**
 * 加载并显示链接列表
 */
function loadAndDisplayLinks() {
    const linksList = document.getElementById('linksList');
    if (!linksList) {
        console.error('Links list container not found');
        return;
    }
    
    // 从localStorage获取链接
    const linksStr = localStorage.getItem('adminLinks');
    const links = linksStr ? JSON.parse(linksStr) : [];
    
    // 清空列表
    linksList.innerHTML = '';
    
    // 如果没有链接，显示提示
    if (links.length === 0) {
        linksList.innerHTML = `
            <div class="no-content-message">
                <i class="fas fa-link"></i>
                <p>No links found. Click "Add New Link" to create some.</p>
            </div>
        `;
        return;
    }
    
    // 显示所有链接
    links.forEach(link => {
        const linkItem = document.createElement('div');
        linkItem.className = 'content-item';
        
        linkItem.innerHTML = `
            <div class="content-icon">
                <i class="${link.iconClass || 'fas fa-globe'}"></i>
            </div>
            <div class="content-info">
                <h3>${link.title}</h3>
                <p>${link.description}</p>
                <div class="content-meta">
                    <span class="content-date">${new Date(link.createdAt).toLocaleDateString()}</span>
                    <a href="${link.url}" target="_blank" class="content-link"><i class="fas fa-external-link-alt"></i> Visit Website</a>
                </div>
            </div>
            <div class="content-actions">
                <button class="edit-link-btn" data-id="${link.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-link-btn" data-id="${link.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        linksList.appendChild(linkItem);
    });
    
    // 添加编辑和删除事件处理
    setupLinkEventHandlers();
}

/**
 * 设置链接项的事件处理程序
 */
function setupLinkEventHandlers() {
    // 编辑按钮
    const editButtons = document.querySelectorAll('.edit-link-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const linkId = this.getAttribute('data-id');
            editLink(linkId);
        });
    });
    
    // 删除按钮
    const deleteButtons = document.querySelectorAll('.delete-link-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const linkId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
                deleteLink(linkId);
            }
        });
    });
}

/**
 * 保存链接
 */
function saveLink() {
    // 获取表单数据
    const linkId = document.getElementById('linkId').value;
    const title = document.getElementById('linkTitle').value.trim();
    const description = document.getElementById('linkDescription').value.trim();
    const url = document.getElementById('linkUrl').value.trim();
    const iconClass = document.getElementById('linkIcon').value.trim();
    
    // 验证必填字段
    if (!title) {
        alert('Please enter a title for the link');
        return;
    }
    
    if (!description) {
        alert('Please enter a description for the link');
        return;
    }
    
    if (!url) {
        alert('Please enter a website URL');
        return;
    }
    
    // 创建链接对象
    const link = {
        id: linkId || 'link_' + Date.now(),
        title: title,
        description: description,
        url: url,
        iconClass: iconClass || 'fas fa-globe',
        createdAt: new Date().toISOString()
    };
    
    // 保存到localStorage
    try {
        // 从localStorage获取现有链接
        const linksStr = localStorage.getItem('adminLinks');
        let links = linksStr ? JSON.parse(linksStr) : [];
        
        // 确保是数组
        if (!Array.isArray(links)) {
            links = [];
        }
        
        // 检查是否存在具有相同ID的链接（编辑模式）
        const existingIndex = links.findIndex(l => l.id === link.id);
        
        if (existingIndex !== -1) {
            // 更新现有链接
            links[existingIndex] = link;
        } else {
            // 添加新链接
            links.push(link);
        }
        
        // 保存回localStorage
        localStorage.setItem('adminLinks', JSON.stringify(links));
        
        // 关闭模态框
        if (typeof closeModal === 'function') {
            closeModal('linkModal');
        } else {
            const modal = document.getElementById('linkModal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
        
        // 重新加载链接列表
        loadAndDisplayLinks();
        
        // 显示成功消息
        alert('Link saved successfully');
    } catch (e) {
        console.error('Error saving link:', e);
        alert('Failed to save link');
    }
}

/**
 * 编辑链接
 * @param {string} linkId - 链接ID
 */
function editLink(linkId) {
    // 从localStorage获取链接
    const linksStr = localStorage.getItem('adminLinks');
    const links = linksStr ? JSON.parse(linksStr) : [];
    
    // 查找指定链接
    const link = links.find(l => l.id === linkId);
    if (!link) {
        console.error('Link not found:', linkId);
        return;
    }
    
    // 填充表单
    document.getElementById('linkId').value = link.id;
    document.getElementById('linkTitle').value = link.title;
    document.getElementById('linkDescription').value = link.description;
    document.getElementById('linkUrl').value = link.url;
    document.getElementById('linkIcon').value = link.iconClass || 'fas fa-globe';
    
    // 更新模态框标题
    const modalTitle = document.getElementById('linkModalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Edit Link';
    }
    
    // 打开模态框
    if (typeof openModal === 'function') {
        openModal('linkModal');
    } else {
        const modal = document.getElementById('linkModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
}

/**
 * 删除链接
 * @param {string} linkId - 链接ID
 */
function deleteLink(linkId) {
    try {
        // 从localStorage获取链接
        const linksStr = localStorage.getItem('adminLinks');
        let links = linksStr ? JSON.parse(linksStr) : [];
        
        // 移除指定链接
        links = links.filter(link => link.id !== linkId);
        
        // 保存回localStorage
        localStorage.setItem('adminLinks', JSON.stringify(links));
        
        // 重新加载链接列表
        loadAndDisplayLinks();
        
        // 显示成功消息
        alert('Link deleted successfully');
    } catch (e) {
        console.error('Error deleting link:', e);
        alert('Failed to delete link');
    }
} 