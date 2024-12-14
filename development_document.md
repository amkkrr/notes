# 笔记应用开发文档

## 项目概述

本项目是一个基于 Web 技术开发的笔记应用，使用 Dexie.js 作为本地数据库，并通过 PWA + TWA 技术封装为安卓原生应用。

## 技术栈

- 前端框架：HTML5 + CSS3 + JavaScript
- 数据库：Dexie.js (IndexedDB 封装)
- 打包方案：PWA + TWA
- 开发工具：VS Code、Android Studio
- 目标平台：Android

## 数据库设计

### 数据库初始化

```javascript
const db = new Dexie('NotesApp');

db.version(1).stores({
    notes: '++id, title, content, created, modified, categoryId, *tags, isFavorite, isArchived',
    categories: '++id, name, color'
});
```

### 数据表结构

#### notes 表
- id: 自增主键
- title: 笔记标题
- content: 笔记内容
- created: 创建时间
- modified: 最后修改时间
- categoryId: 分类ID
- tags: 标签数组
- isFavorite: 是否收藏
- isArchived: 是否归档

#### categories 表
- id: 自增主键
- name: 分类名称
- color: 分类颜色

### 核心数据操作 API

```javascript
// 添加笔记
async function addNote(noteData) {
    return await db.notes.add({
        title: noteData.title,
        content: noteData.content,
        created: new Date(),
        modified: new Date(),
        categoryId: noteData.categoryId,
        tags: noteData.tags || [],
        isFavorite: false,
        isArchived: false
    });
}

// 更新笔记
async function updateNote(id, noteData) {
    await db.notes.update(id, {
        ...noteData,
        modified: new Date()
    });
}

// 删除笔记
async function deleteNote(id) {
    await db.notes.delete(id);
}

// 按分类获取笔记
async function getNotesByCategory(categoryId) {
    return await db.notes
        .where('categoryId')
        .equals(categoryId)
        .toArray();
}
```

## PWA 配置

### manifest.json 配置

```json
{
    "name": "笔记应用",
    "short_name": "笔记",
    "description": "一个简单的笔记应用",
    "start_url": "/index.html",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#2196f3",
    "icons": [
        {
            "src": "icons/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "icons/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
```

### Service Worker 配置

```javascript
// service-worker.js
const CACHE_NAME = 'notes-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json'
];

// 安装 Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// 激活 Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName !== CACHE_NAME;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

// 处理离线缓存
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
```

## TWA 配置

### Android 项目配置

1. 在 Android Studio 中创建新项目，选择 "TWA" 模板

2. 修改 build.gradle

```gradle
dependencies {
    implementation 'com.google.androidbrowser:customtabs:2.0.0'
    implementation 'androidx.browser:browser:1.4.0'
}
```

3. 配置 Digital Asset Links

```json
// .well-known/assetlinks.json
[{
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
        "namespace": "android_app",
        "package_name": "com.example.notes",
        "sha256_cert_fingerprints": [
            "YOUR:APP:FINGERPRINT"
        ]
    }
}]
```

### 清单文件配置

```xml
<!-- AndroidManifest.xml -->
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.notes">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.AppCompat.NoActionBar">

        <meta-data
            android:name="asset_statements"
            android:resource="@string/asset_statements" />

        <activity
            android:name="android.support.customtabs.trusted.LauncherActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

## 部署步骤

1. 前端打包
```bash
# 构建前端资源
npm run build

# 生成 Service Worker
workbox generateSW workbox-config.js
```

2. PWA 验证
- 使用 Lighthouse 检查 PWA 评分
- 测试离线功能
- 验证安装横幅

3. TWA 打包
```bash
# 在 Android Studio 中
# 1. 生成签名密钥
# 2. 配置 build.gradle
# 3. 执行打包
./gradlew assembleRelease
```

## 调试指南

1. 前端调试
- 使用 Chrome DevTools 的 Application 面板调试 IndexedDB
- 使用 Network 面板检查资源加载
- 使用 Console 面板查看日志

2. PWA 调试
- 使用 Lighthouse 检查 PWA 相关问题
- 使用 Chrome DevTools 的 Application 面板调试 Service Worker

3. TWA 调试
- 使用 Chrome 远程调试
- 使用 Android Studio 的日志工具
- 使用 adb logcat 查看系统日志

## 注意事项

1. 数据库
- 定期备份数据
- 处理并发访问
- 注意数据迁移

2. PWA
- 确保 HTTPS 配置
- 处理离线状态
- 注意缓存策略

3. TWA
- 验证数字资产链接
- 处理深层链接
- 注意应用签名

## 性能优化

1. 资源优化
- 使用 WebP 图片格式
- 启用 GZIP 压缩
- 实现资源预加载

2. 数据库优化
- 使用适当的索引
- 批量操作优化
- 大文本分片存储

3. 离线优化
- 实现渐进式加载
- 优化缓存策略
- 预缓存关键资源

## 开发规范

1. 代码规范
- 使用 ESLint 进行代码检查
- 遵循 Git 提交规范
- 编写单元测试

2. 文档规范
- 及时更新 API 文档
- 编写代码注释
- 记录重要决策

3. 版本控制
- 遵循语义化版本
- 维护更新日志
- 做好分支管理