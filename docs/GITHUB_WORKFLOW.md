# Sri Lanka Stay & Explore 网站 GitHub 发布规则

## 仓库信息

- **GitHub 仓库**: https://github.com/Williamllq/sri-lanka-hotel
- **部署网站**: https://sri-lanka-stay-explore.netlify.app/

## 网站访问信息

- **用户界面网址**: https://sri-lanka-stay-explore.netlify.app/
- **管理员界面网址**: https://sri-lanka-stay-explore.netlify.app/admin-dashboard.html
- **管理员用户名**: admin
- **管理员密码**: rangabandara2024

## 分支管理

本项目使用以下分支策略：

- **master**: 生产环境分支，与部署的网站对应
- **main**: 开发分支，用于新功能开发

## 发布流程

1. **开发新功能**:
   - 确保您在 `main` 分支上进行开发
   - 完成代码更改后，使用以下命令提交更改:
   ```bash
   git add .
   git commit -m "描述性的提交信息"
   git push origin main
   ```

2. **创建 Pull Request**:
   - 提交到 `main` 分支后，GitHub上会提示创建一个Pull Request
   - 点击 "Compare & pull request" 按钮
   - 填写清晰的标题和描述
   - 创建Pull Request，将 `main` 分支合并到 `master` 分支

3. **合并更改**:
   - 在GitHub上检查并审核Pull Request
   - 点击 "Merge pull request" 按钮，将更改合并到 `master` 分支
   - 确认合并

4. **检查部署**:
   - Netlify会自动部署 `master` 分支的最新代码
   - 检查 https://sri-lanka-stay-explore.netlify.app/ 确认更改已成功部署

## 注意事项

- 避免直接在 `master` 分支上进行开发
- 确保每次提交都有清晰的提交信息
- 在合并前测试您的更改
- Pull Request应包含相关的功能说明或修复的问题
- **重要**: 请勿在公共场合分享管理员凭据，此信息仅供项目成员使用

## 本地开发设置

如果您在新的开发环境中设置仓库，请使用以下命令：

```bash
# 克隆仓库
git clone https://github.com/Williamllq/sri-lanka-hotel.git
cd sri-lanka-hotel

# 确保您在main分支上
git checkout main

# 在做更改前，先获取最新代码
git pull origin main
```

## 故障排除

如果您遇到以下问题：

1. **提交但未看到更新**:
   - 检查您是否在正确的分支上
   - 检查是否成功推送到远程仓库
   - 检查Pull Request是否已创建并合并

2. **合并冲突**:
   - 拉取最新的master代码
   - 解决冲突
   - 重新提交更改

## 联系方式

如有任何问题，请联系项目维护者。 