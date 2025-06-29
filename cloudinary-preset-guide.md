# Cloudinary 上传预设创建指南

## 问题说明
您遇到的 "Cloud upload failed. Falling back to local storage" 错误是因为系统尝试使用一个不存在的上传预设 `sri_lanka_unsigned`。

## 临时解决方案（已实施）
系统现在已自动切换到使用 Cloudinary 的默认预设 `ml_default`，图片上传应该可以正常工作了。

## 创建专属上传预设（推荐）

### 步骤 1：登录 Cloudinary
1. 访问 https://console.cloudinary.com/
2. 使用您的账户登录（Cloud Name: dmpfjul1j）

### 步骤 2：创建无签名上传预设
1. 在控制台中，点击左侧菜单的 **Settings** 图标（齿轮图标）
2. 选择 **Upload** 标签
3. 向下滚动到 **Upload presets** 部分
4. 点击 **Add upload preset** 按钮

### 步骤 3：配置预设
在创建预设页面中，设置以下选项：

1. **Preset name**: `sri_lanka_unsigned`
2. **Signing Mode**: 选择 **Unsigned** （重要！）
3. **Folder**: `sri-lanka` （可选，用于组织图片）

#### 可选但推荐的设置：
- **Allowed formats**: jpg, png, gif, webp
- **Max file size**: 10485760 (10MB)
- **Unique filename**: ✓ 勾选
- **Use filename**: ✓ 勾选
- **Overwrite**: ✗ 不勾选

### 步骤 4：保存预设
点击页面底部的 **Save** 按钮

### 步骤 5：更新代码（可选）
创建预设后，您可以更新 `js/cloud-storage.js` 文件：

```javascript
// 将这行：
uploadPreset: 'ml_default',

// 改为：
uploadPreset: 'sri_lanka_unsigned',
```

## 测试上传
1. 访问管理员页面：https://sri-lanka-explore.netlify.app/admin-dashboard.html
2. 登录后进入 Pictures 部分
3. 点击 "Upload New Picture"
4. 选择图片并上传
5. 确认没有错误提示

## 故障排除

### 如果仍然失败：
1. **检查预设名称**：确保预设名称完全匹配（包括大小写）
2. **检查签名模式**：必须是 "Unsigned" 模式
3. **清除浏览器缓存**：Ctrl+F5 强制刷新页面
4. **检查控制台错误**：F12 打开开发者工具查看具体错误

### 常见错误及解决方案：
- **"Upload preset not found"**：预设名称错误或未创建
- **"Invalid Signature"**：预设设置为了 Signed 模式
- **CORS 错误**：通常是网络问题，稍后重试

## 验证工具
使用我创建的调试工具测试：
1. 打开 `test-upload-debug.html`
2. 运行各项测试
3. 查看详细的错误信息

## 联系支持
如果问题持续存在，请提供：
- 浏览器控制台的错误截图
- 使用的预设名称
- Cloudinary 账户的 Cloud Name 