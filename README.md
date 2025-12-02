# UI 转 PRD 生成器

## 🚨 部署失败 (404) 修复指南

如果您在 GitHub Actions 中看到 `Error: Failed to create deployment (status: 404)`，这是因为 **GitHub Pages 未启用**。

### ✅ 请按以下步骤修复：

1. 进入您的 GitHub 仓库页面。
2. 点击顶部的 **Settings (设置)** 选项卡。
3. 在左侧菜单栏中找到并点击 **Pages**。
4. 在 **Build and deployment** > **Source** 下拉菜单中，**必须**选择 **GitHub Actions**。
5. 设置完成后，返回 **Actions** 页面，重新运行失败的 Workflow (Re-run jobs)，或者提交任意代码更新即可成功部署。

## 本地开发

1. 安装依赖: `npm install`
2. 启动服务: `npm run dev`
