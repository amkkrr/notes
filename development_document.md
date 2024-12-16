# 笔记应用开发文档

## 1. 项目概述

### 1.1 功能定位
- 一款简洁易用的个人笔记应用，专注于离线使用和快速记录灵感
- 支持自部署和多端同步
- 轻量级设计，启动加载时间不超过1秒
- 功能实现全部用前端实现，涉及后端服务

### 1.2 技术选型
- 前端框架：HTML5 + CSS3 + JavaScript
- 数据库：Dexie.js (IndexedDB 封装)
- 打包方案：PWA + TWA
- 开发工具：VS Code、Android Studio
- 同步方案：数据存储在服务器端，而不是存储在本地, 并使用vite部署服务端读取api信息，保证url敏感信息不泄露
- 目标平台：Web App + 安卓原生应用

## 2. 项目架构

### 2.1 架构设计原则

1. **模块化设计**
   - 每个功能模块独立封装
   - 模块间通过接口通信
   - 采用依赖注入
   - 模块可独立测试和部署

2. **数据流设计**
   - 采用单向数据流
   - 状态管理与UI分离
   - 使用发布订阅模式实现模块间通信
   - 避免模块间直接数据传递



### 2.2 目录结构

```
notes-app/
├── src/
│   ├── assets/          # 静态资源
│   ├── components/      # 通用组件
│   │   ├── Editor/      # 编辑器组件
│   │   ├── NoteList/    # 笔记列表组件
│   │   └── Category/    # 分类管理组件
│   ├── modules/         # 核心模块
│   │   ├── editor/      # 编辑器模块
│   │   ├── storage/     # 存储模块
│   │   ├── notes/       # 笔记管理模块
│   │   └── sync/        # 同步模块
|   ├── pages/          # 页面级UI组件
│   │   ├── Home/       # 首页
│   │   ├── Editor/     # 编辑页面
│   │   └── Settings/   # 设置页面
│   ├── services/        # 服务层
│   ├── utils/           # 工具函数
│   ├── styles/          # 全局样式文件
│   │   ├── themes/     # 主题相关样式
│   │   ├── variables/  # 样式变量
│   │   └── common/     # 通用样式
│   └── app.js           # 应用入口
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── service-worker.js
├── scripts/            # 构建脚本
└── docs/              # 项目文档
```

## 3. 核心模块设计

### 3.1 编辑器模块 (src/modules/editor)

```
editor/
├── components/           # 编辑器相关组件
│   ├── MarkdownEditor/   # Markdown编辑器组件
│   ├── Toolbar/         # 工具栏组件
│   └── Preview/         # 预览组件
├── services/            # 编辑器服务
│   ├── parser.js        # Markdown解析服务
│   ├── formatter.js     # 格式化服务
│   └── highlighter.js   # 代码高亮服务
└── utils/              # 工具函数
    ├── shortcuts.js     # 快捷键处理
    └── paste.js         # 粘贴处理
```

功能特性：
- Markdown文本解析和渲染
- 所见即所得编辑
- Markdown语法快捷输入
- 代码块语法高亮
- 智能粘贴处理

### 3.2 存储模块 (src/modules/storage)

```
storage/
├── services/           # 存储服务
│   ├── db.js          # Dexie数据库服务
│   ├── sync.js        # 同步接口适配层
│   └── version.js     # 版本控制服务
├── models/            # 数据模型
│   ├── note.js       # 笔记模型
│   ├── category.js   # 分类模型
│   └── syncInfo.js   # 同步信息模型
├── utils/            # 工具函数
│   ├── migration.js  # 数据迁移工具
│   └── validator.js  # 数据验证工具
└── exporters/        # 导出工具
    ├── markdown.js   # Markdown导出器
    └── html.js       # HTML导出器
```

数据模型设计：
```javascript
// models/note.js
{
  id: string,          // 唯一标识
  title: string,       // 标题
  content: string,     // 内容
  categoryId: string,  // 分类ID
  tags: array,         // 标签
  version: number,     // 版本号
  syncId: string,      // 同步ID
  lastSynced: number,  // 最后同步时间
  lastModified: number,// 最后修改时间
  created: number,     // 创建时间
  isFavorite: boolean, // 是否收藏
  isArchived: boolean, // 是否归档
  deleted: boolean,    // 软删除标记
  conflicts: array     // 冲突版本
}

// models/category.js
{
  id: string,         // 唯一标识
  name: string,       // 分类名称
  color: string,      // 分类颜色
  version: number,    // 版本号
  lastModified: number// 最后修改时间
}

// models/syncInfo.js
{
  lastSyncTime: number,   // 最后同步时间
  syncStatus: string,     // 同步状态
  deviceId: string,       // 设备标识
  pendingChanges: array   // 待同步变更
}
```

### 3.3 笔记管理模块 (src/modules/notes)

```
notes/
├── components/         # 笔记管理组件
│   ├── NoteList/      # 笔记列表组件
│   ├── CategoryList/  # 分类列表组件
│   ├── TagManager/    # 标签管理组件
│   └── Trash/         # 回收站组件
├── services/          # 笔记管理服务
│   ├── noteService.js # 笔记服务
│   ├── categoryService.js # 分类服务
│   └── tagService.js  # 标签服务
└── utils/            # 工具函数
    ├── filter.js     # 笔记过滤工具
    └── sort.js       # 笔记排序工具
```

### 3.4 同步模块 (src/modules/sync)

```
sync/
├── adapters/           # 同步适配器
│   ├── base.js        # 基础适配器接口
│   ├── webdav.js      # WebDAV适配器
│   └── custom.js      # 自定义协议适配器
├── services/          # 同步服务
│   ├── syncService.js # 同步核心服务
│   ├── conflict.js    # 冲突处理服务
│   └── queue.js       # 同步队列服务
├── strategies/        # 同步策略
│   ├── full.js        # 全量同步策略
│   └── incremental.js # 增量同步策略
└── utils/            # 工具函数
    ├── diff.js       # 数据对比工具
    └── merge.js      # 数据合并工具
```

同步接口设计：
```javascript
// sync/adapters/base.js
class BaseSyncAdapter {
  // 基础同步接口
  async initialize() {}
  async push(changes) {}
  async pull() {}
  async resolveConflict(conflict) {}
  
  // 扩展接口
  async getCapabilities() {}
  async test() {}
}

// sync/services/syncService.js
const SyncStatus = {
  IDLE: 'idle',           // 空闲状态
  SYNCING: 'syncing',     // 同步中
  ERROR: 'error',         // 同步错误
  CONFLICT: 'conflict'    // 存在冲突
}

// sync/services/conflict.js
const ConflictStrategies = {
  KEEP_LOCAL: 'keepLocal',      // 保留本地版本
  KEEP_REMOTE: 'keepRemote',    // 保留远程版本
  MERGE: 'merge',               // 合并版本
  MANUAL: 'manual'              // 手动解决
}
```

## 4. 数据库设计

### 4.1 数据表结构

```javascript
// db.js
const db = new Dexie('NotesDB');
db.version(1).stores({
  notes: '++id, title, categoryId, syncId, lastModified, deleted',
  categories: '++id, name',
  syncInfo: 'id, lastSyncTime',
  changes: '++id, type, targetId, timestamp'
});
```

### 4.2 索引设计
- 笔记表：标题、分类、同步状态的复合索引
- 变更记录表：时间戳索引用于增量同步
- 版本控制：每个实体包含版本号用于冲突检测

## 5. 交互设计规范

[原有交互设计规范部分保持不变，此处省略]

## 6. 开发规范

### 6.1 代码规范
- 使用ESLint进行代码检查
- 遵循Git提交规范
- 编写单元测试
- 代码注释使用中文撰写

### 6.2 文档规范
- 及时更新API文档
- 编写代码注释
- 记录重要决策
- 文件命名使用英文，避免使用无意义命名

### 6.3 Git提交规范
```
<类型>(<模块>): <描述>

<详细说明>

<footer>
```

类型说明：
- feat：新功能
- fix：修复
- docs：文档
- style：格式
- refactor：重构
- test：测试
- chore：其他

## 7. 部署和发布

### 7.1 Web端部署
- 静态资源CDN部署
- Service Worker注册
- HTTPS配置
- 缓存策略设置

### 7.2 Android端打包
- TWA配置
- 数字资产链接验证
- 应用签名
- 应用商店发布

## 8. 测试策略

### 8.1 单元测试
- Jest作为测试框架
- 测试覆盖率要求80%以上
- 重点测试数据处理和同步逻辑
- 自动化测试集成到CI流程

### 8.2 集成测试
- 端到端测试覆盖核心功能
- 同步功能的多设备测试
- 性能和稳定性测试
- 兼容性测试

## 9. 性能优化

### 9.1 加载优化
- 路由懒加载
- 资源预加载
- 代码分割
- 图片优化

### 9.2 运行时优化
- 虚拟列表
- 防抖和节流
- IndexedDB性能优化
- 后台同步优化

## 10. 安全考虑

### 10.1 数据安全
- 本地数据加密存储
- 同步传输加密
- 敏感信息保护
- 数据备份机制

### 10.2 应用安全
- XSS防护
- CSRF防护
- 输入验证
- 错误处理

## 11. 监控和日志

### 11.1 性能监控
- 页面加载性能
- 操作响应时间
- 资源占用情况
- 同步性能指标

### 11.2 错误监控
- JS错误捕获
- Promise异常处理
- 同步错误记录
- 用户反馈收集

## 12. 维护和更新

### 12.1 版本更新
- 语义化版本控制
- 更新日志维护
- 变更通知机制
- 平滑升级策略

### 12.2 数据迁移
- 数据库架构升级
- 数据格式转换
- 兼容性保证
- 回滚机制

## 附录：常见问题解决方案

### A1. 同步冲突处理
1. 版本号比对
2. 差异计算
3. 三向合并
4. 用户确认

### A2. 离线支持
1. Service Worker策略
2. 离线数据处理
3. 同步队列管理
4. 状态恢复

### A3. 性能优化
1. 大量数据处理
2. 渲染性能
3. 同步性能
4. 存储优化