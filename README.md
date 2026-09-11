# AI 提分叶路春｜个性化教育测评系统 (aitifen.cc)

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers_%26_Assets-orange?logo=cloudflare)](https://aitifen.cc)
[![Domain](https://img.shields.io/badge/Domain-aitifen.cc-blue)](https://aitifen.cc)
[![Google Indexing](https://img.shields.io/badge/Google-Indexed_%26_Sitemap_Submitted-brightgreen?logo=google)](https://search.google.com/search-console)
[![Baidu Indexing](https://img.shields.io/badge/Baidu-Verified_%26_API_Pushed-blue?logo=baidu)](https://ziyuan.baidu.com)

> **“让自主学习成为学霸标配，自主学习×AI成为学霸顶配。”**  
> 本项目为叶路春老师创办的 **MCA 学习力与自主学习多维诊断系统**，融合学生性格测评、内在驱动力诊断、认知加工通道与家庭教育协同策略，通过专属 AI 导师诊断学生底层逻辑，实现靶向精准提分。

---

## 🌐 线上服务矩阵与域名架构

- **核心主域名**：[`https://aitifen.cc`](https://aitifen.cc)
- **测评业务域名**：[`https://survey.aitifen.cc`](https://survey.aitifen.cc)
- **托管平台**：Cloudflare Workers + Assets（无服务器边缘网络，全站开启 CDN/WAF 保护与边缘加速）
- **数据存储**：Cloudflare D1 Database (`ai-tifen-yechun-survey` / ID: `6fbcd36d-7fc9-472c-98a3-8f41565256fb`)
- **技术栈**：React 19 + TypeScript + Vite 8 + Cloudflare Worker Native Handler

---

## 🔍 SEO 搜索引擎全栈配置与提交矩阵

本项目已完成 Google Search Console 与 百度搜索资源平台 的双端站点验证、Sitemap 提交、语义化结构优化与实时推送闭环。

### 1. 站点级 SEO 基础设施

| 模块 | 实施规范 | 访问路径 / 状态 |
| :--- | :--- | :--- |
| **标准站点地图** | XML 规范 Sitemap，包含核心页面路径与更新频率 | [`https://aitifen.cc/sitemap.xml`](https://aitifen.cc/sitemap.xml) |
| **爬虫抓取协议** | 允许主流搜索引擎全站索引并自动声明 Sitemap 地址 | [`https://aitifen.cc/robots.txt`](https://aitifen.cc/robots.txt) |
| **品牌图标 (Favicon)** | 专属矢量 SVG 标识，适配 Google 搜索结果图标展示 | [`https://aitifen.cc/favicon.svg`](https://aitifen.cc/favicon.svg) |
| **结构化数据** | 符合 Schema.org 规范的 `WebApplication` (Educational) JSON-LD | 嵌入 `index.html` 头部，助力搜索结果富文本卡片展示 |
| **社交卡片 (OG)** | OpenGraph 协议元标签（`og:title`, `og:description`, `og:image` 等） | 优化微信、飞书、社交媒体转发预览体验 |
| **爬虫预渲染降级** | 针对百度蜘蛛等非 JS 渲染爬虫内置语义化 HTML 降级大纲 | 解决 SPA 单页应用被判定为 `<div id="root"></div>` 空白页的痛点 |

---

### 2. Google Search Console (GSC) 收录凭证

- **资源类型**：网域级资源 (`sc-domain:aitifen.cc`)，全量覆盖所有前缀与二级子域名
- **所有权验证**：已通过 Cloudflare DNS 网域所有权验证
- **站点地图提交**：
  - 提交地址：`https://aitifen.cc/sitemap.xml`
  - 状态：**已成功提交并录入周期性处理队列**
- **URL 检查与优先索引**：
  - 首页 `https://aitifen.cc/` 已完成实时检测（**“网址可编入 Google 索引”**）
  - **已成功触发「请求编入索引」**，进入 Googlebot 优先爬取队列

---

### 3. 百度搜索资源平台 (Baidu) 收录凭证

- **站点主体**：`https://aitifen.cc`
- **归属验证**：
  - 验证方式：HTML 标签验证（`codeva-vw3OiUMPPN`）
  - 独立验证端点：`https://aitifen.cc/baidu_verify_codeva-vw3OiUMPPN.html`
  - 状态：**官方确认验证成功**
- **主动推送接口 (API)**：
  - 百度专属准入密钥 (Token)：`h2SgsuGqxPpXmlmp`
  - 调用接口：`http://data.zz.baidu.com/urls?site=https://aitifen.cc&token=h2SgsuGqxPpXmlmp`
  - 推送测试结果：`{"remain":8, "success":1}`（已成功推送入库）

---

## 🚀 运维与日常推送脚本

### 1. 向百度主动推送新页面 / 更新页面
当有新文章、新测评模块上线时，使用以下命令将 URL 秒级推送至百度索引库：

```bash
# 单条推送
curl -H 'Content-Type:text/plain' --data-binary "https://aitifen.cc/" "http://data.zz.baidu.com/urls?site=https://aitifen.cc&token=h2SgsuGqxPpXmlmp"

# 批量推送（在 urls.txt 中每行写入一个网址）
curl -H 'Content-Type:text/plain' --data-binary @urls.txt "http://data.zz.baidu.com/urls?site=https://aitifen.cc&token=h2SgsuGqxPpXmlmp"
```

### 2. 本地构建与发布工作流

```bash
# 1. 安装依赖
npm install

# 2. 编译打包 (包含类型检查、Vite 构建与静态资源处理)
npm run build

# 3. 部署到 Cloudflare Workers & Assets
npx wrangler deploy
```

---

## 📄 授权与归属

- **项目所有者**：叶路春 / AI 提分
- **代码仓库**：[kkjusdoit/survey.aitifen.cc](https://github.com/kkjusdoit/survey.aitifen.cc)
