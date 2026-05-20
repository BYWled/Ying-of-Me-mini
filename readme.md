# 伴莺的小窝 - 小程序版

基于“前端分离”架构构建的 Hexo 博客微信小程序端。项目采用现代化的前端技术栈，通过调用 Hexo 生成的 JSON 接口渲染原生小程序组件，保留了原网页版标志性的设计与沉浸式体验。

## 🛠 技术栈

- **核心框架**：[uni-app](https://uniapp.dcloud.net.cn/) (Vue 3 Composition API + TypeScript)
- **构建工具**：Vite
- **CSS 引擎**：[UnoCSS](https://unocss.dev/) (配合 `@unocss/transformer-class` 处理小程序类名兼容)
- **富文本解析**：`mp-html` (用于将 Hexo 的 HTML 数据解析为小程序原生 WXML)
- **数据来源**：Hexo 静态博客生成的 JSON API (`hexo-generator-restful` 插件)

## ✨ 核心特性

1. **沉浸式毛玻璃 UI**：采用自定义导航栏，配合背景图与实现高斯模糊的卡片流式布局。
2. **完整的博客生态映射**：

- **主页**：Hero Banner + 最新文章流加载。
- **专题**：聚合网站 Header 页面。
- **分类**：支持标签云与分类树展示。
- **关于**：个人信息展示及统计数据。

1. **小程序深度优化**：背景图通过远程接口加载，减小主包体积；采用底部四大 TabBar 设计，扁平化页面层级。

## 📂 项目结构

```plaintext
├── src/
│   ├── api/
│   │   ├── config.ts             # 存放 Hexo JSON API 及远程背景图的 BaseURL
│   │   └── posts.ts              # 请求文章列表、详情及独立页面的方法
│   ├── components/               # 公共组件库
│   │   ├── GlassCard.vue         # 封装毛玻璃风格的容器组件
│   │   ├── ArticleItem.vue       # 列表中的单篇文章卡片
│   │   └── MpHtmlParser.vue      # 封装的 mp-html 富文本解析组件
│   ├── pages/                    # 页面层（四大 Tab + 详情内页）
│   │   ├── index/index.vue       # 【Tab 1】主页：Hero图 + 最新文章流
│   │   ├── hub/index.vue         # 【Tab 2】专题：页面入口网格
│   │   ├── category/index.vue    # 【Tab 3】探索：搜索框 + 标签云 + 分类树
│   │   ├── about/index.vue       # 【Tab 4】关于：个人名片、统计数据
│   │   └── article/detail.vue    # 【内页】文章/独立页面详情页
│   ├── static/                   # 存放本地静态资源（TabBar 图标等）
│   ├── styles/                   # 全局样式控制
│   ├── App.vue                   # 全局生命周期
│   ├── main.ts                   # Vue 实例挂载及 UnoCSS 引入
│   └── pages.json                # 页面路由与沉浸式全局配置
├── vite.config.ts                # Vite 与 UnoCSS 内联配置
└── package.json

```

## 🚀 快速开始

### 1. 安装依赖

推荐使用 `pnpm` 安装依赖：

```bash
pnpm install

```

### 2. 启动微信小程序编译

```bash
pnpm run dev:mp-weixin

```

编译完成后，使用微信开发者工具导入项目根目录下的 `dist/dev/mp-weixin` 即可预览。

### ⚠️ 环境配置避坑指南（重要）

本项目在 `vite.config.ts` 中采用了 **UnoCSS 配置内联** 的特殊处理方案。

- **原因**：在 Windows 系统下，如果项目缓存位于非系统盘（如 E 盘），Node.js 的 ESM 加载器在读取独立的 `uno.config.ts` 时会触发 `[ERR_UNSUPPORTED_ESM_URL_SCHEME]` 协议报错。
- **约束**：请勿在根目录重新创建 `uno.config.ts`。所有关于主题色（如薄荷绿 `#42b983`）、安全类名转换器（transformer）以及扫描规则的更改，请直接在 `vite.config.ts` 的 `UnoCSS()` 插件配置项中进行。
