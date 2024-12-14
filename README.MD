# 笔记应用

## 项目简介

这是一个轻量级的个人笔记应用，旨在帮助用户快速记录灵感并支持离线访问。本项目采用 PWA 技术实现，支持多端同步和自部署。

## 功能特性

- **离线访问**：通过 Service Worker 提供完整的离线功能。
- **快速笔记**：优化的用户界面，可快速创建、编辑和删除笔记。
- **多端同步**：支持 WebDAV 协议，用户可选择同步到自己的服务器。
- **主题切换**：提供浅色和深色两种主题。
- **数据安全**：本地加密存储数据，支持软删除和恢复功能。

## 技术栈

- **前端技术**：HTML5, CSS3, JavaScript
- **数据库**：Dexie.js (基于 IndexedDB)
- **打包与发布**：PWA, TWA

## 项目结构

```
notes-app/
├── public/               # 静态资源
│   ├── index.html        # 应用主入口
│   ├── manifest.json     # PWA 配置文件
│   └── service-worker.js # Service Worker 脚本
├── src/                  # 源代码
│   ├── modules/          # 核心模块
│   ├── pages/            # 页面组件
│   ├── styles/           # 样式文件
│   └── app.js            # 应用主逻辑
├── docs/                 # 文档
└── scripts/              # 构建脚本
```

