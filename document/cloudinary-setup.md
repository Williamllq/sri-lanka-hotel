# Cloudinary 云存储设置指南

## 🌟 为什么需要 Cloudinary？

当网站部署在 Netlify（或其他静态网站托管服务）上时，图片上传功能无法正常工作，因为：
- 没有后端服务器来处理图片上传
- 本地存储（LocalStorage/IndexedDB）有容量限制
- 图片数据无法在不同设备间共享

**Cloudinary 解决方案**：
- ✅ 免费账户提供 25GB 存储空间
- ✅ 自动图片优化和 CDN 加速
- ✅ 无需后端服务器
- ✅ 图片在所有设备上都可访问

## 📋 设置步骤

### 步骤 1：创建 Cloudinary 账户

1. 访问 [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. 填写注册表单：
   - Email 地址
   - 密码
   - 公司名（可选）
3. 验证邮箱地址
4. 登录到 Cloudinary Dashboard

### 步骤 2：获取您的 Cloud Name

1. 登录后，在 Dashboard 顶部可以看到您的 **Cloud Name**
2. 复制这个名称（例如：`dxyz123abc`）
3. 保存备用

![Cloud Name Location](https://res.cloudinary.com/demo/image/upload/v1234567890/cloud-name-location.png)

### 步骤 3：创建 Upload Preset（上传预设）

Upload Preset 允许从浏览器直接上传图片，无需服务器端认证。

1. 在左侧菜单中，点击 **Settings** → **Upload**
2. 滚动到 **Upload presets** 部分
3. 点击 **Add upload preset**
4. 配置以下设置：

   **基本设置**：
   - **Preset name**: `sri-lanka-tourism`（或您喜欢的名称）
   - **Signing Mode**: 选择 **Unsigned**（重要！）
   - **Folder**: `sri-lanka-tourism`（可选，用于组织图片）

   **上传控制**（可选但推荐）：
   - **Max file size**: `10485760`（10MB）
   - **Allowed formats**: `jpg, jpeg, png, gif, webp`

5. 点击 **Save** 保存预设

### 步骤 4：更新网站配置

1. 在您的项目中，打开文件：`js/cloudinary-integration.js`

2. 找到配置部分（大约第 13-15 行）：
   ```javascript
   const CLOUDINARY_CONFIG = {
       cloudName: 'YOUR_CLOUD_NAME', // 替换这里
       uploadPreset: 'YOUR_UPLOAD_PRESET', // 替换这里
   ```

3. 替换为您的实际值：
   ```javascript
   const CLOUDINARY_CONFIG = {
       cloudName: 'dxyz123abc', // 您的 Cloud Name
       uploadPreset: 'sri-lanka-tourism', // 您的 Upload Preset
   ```

4. 保存文件

### 步骤 5：部署更新

如果您使用 Git 和 Netlify：

```bash
git add .
git commit -m "Configure Cloudinary for image uploads"
git push origin main
```

Netlify 会自动部署更新。

### 步骤 6：测试图片上传

1. 访问您的网站管理后台：`https://your-site.netlify.app/admin-dashboard.html`
2. 登录（默认：admin/admin）
3. 导航到 **Manage Pictures**
4. 点击 **Upload Picture**
5. 选择一张图片并上传
6. 如果成功，您会看到 "Cloud Storage Active" 状态

## 🔧 故障排除

### 问题：上传失败，显示 "Invalid upload preset"
**解决**：
- 确认 Upload Preset 名称正确
- 确认 Preset 设置为 "Unsigned"
- 检查拼写错误

### 问题：上传失败，显示 "Cloud name not found"
**解决**：
- 确认 Cloud Name 正确
- 不要包含 cloudinary.com 域名，只需要 cloud name 部分

### 问题：图片上传后不显示
**解决**：
- 检查浏览器控制台是否有错误
- 确认 Cloudinary 配置正确
- 刷新页面重试

## 🎯 高级配置（可选）

### 自动图片优化
Cloudinary 自动应用以下优化：
- **缩略图**: 400x300px，自动裁剪
- **中等尺寸**: 800x600px，保持比例
- **大尺寸**: 最大 1200x900px

### 图片组织
所有图片会自动组织到文件夹：
- `sri-lanka-tourism/scenery/` - 风景图片
- `sri-lanka-tourism/wildlife/` - 野生动物
- `sri-lanka-tourism/culture/` - 文化图片
- `sri-lanka-tourism/food/` - 美食图片
- `sri-lanka-tourism/beach/` - 海滩图片

### 安全建议
1. **不要** 在前端代码中包含 API Secret
2. 定期检查 Cloudinary 使用情况
3. 考虑设置上传限制以防止滥用

## 📊 Cloudinary 免费计划限制

- **存储空间**: 25 GB
- **带宽**: 25 GB/月
- **转换**: 25,000 次/月
- **完全足够** 中小型旅游网站使用

## 🆘 需要帮助？

如果您在设置过程中遇到问题：

1. 查看 [Cloudinary 官方文档](https://cloudinary.com/documentation)
2. 检查浏览器控制台的错误信息
3. 确认所有配置值都正确无误
4. 尝试使用不同的浏览器

## ✅ 配置完成检查清单

- [ ] 创建了 Cloudinary 账户
- [ ] 获取了 Cloud Name
- [ ] 创建了 Unsigned Upload Preset
- [ ] 更新了 `cloudinary-integration.js` 配置
- [ ] 部署了更新到 Netlify
- [ ] 成功测试了图片上传
- [ ] 看到 "Cloud Storage Active" 状态

恭喜！您的网站现在可以使用云存储上传图片了！ 🎉 