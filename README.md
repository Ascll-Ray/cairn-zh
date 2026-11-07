# Cairn 2e 中文官方规则参考 (Cairn 2e Chinese SRD)

《石冢》（Cairn 2e）中文规则参考与官方第一方模组 CAS-1《双湖纷扰》。

本项目基于 [Astro 5](https://astro.build) 与 [Starlight](https://starlight.astro.build) 构建，采用冷峻纯暗色设计风格，提供完整的移动端适配与 Pagefind 中文即时检索。

## 本地开发与构建

### 环境要求
- Node.js 20+
- npm 10+

### 本地运行
```bash
# 安装依赖
npm install

# 启动本地开发服务 (默认 http://localhost:4321)
npm run dev

# 静态生产构建与检索索引生成
npm run build

# 本地静态产物预览
npm run preview
```

## 自动化部署

仓库配置了原生 GitHub Actions 自动化工作流（`.github/workflows/deploy.yml`）。每次推送到 `main` 分支时将自动触发静态构建并部署至 GitHub Pages。

## 鸣谢与版权

- **原著作者**：Yochai Gal（[cairnrpg.com](https://cairnrpg.com)）
- **官方实体店**：[store.cairnrpg.com](https://store.cairnrpg.com)
- **中文维护与站点构建**：[Ascll-Ray](https://github.com/Ascll-Ray)
- **授权协议**：本作品文本内容采用 [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 许可协议授权。
