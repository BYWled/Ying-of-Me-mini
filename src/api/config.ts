/**
 * 依据环境动态决定 BaseURL
 * * #ifdef H5
 * H5 环境：使用相对路径，完美触发 vite.config.ts 中的 server.proxy 解决浏览器跨域
 * #endif
 * * #ifdef MP-WEIXIN
 * 微信小程序环境：必须使用完整的 HTTPS 绝对路径直连。
 * 小程序在宿主环境下没有浏览器的 CORS 限制，但有安全域名白名单限制。
 * #endif
 */
export const BASE_URL = (() => {
  // #ifdef H5
  return "/api";
  // #endif

  // #ifdef MP-WEIXIN
  return "https://mirror-blog.wled.top/api";
  // #endif

  // 兜底默认值
  return "https://mirror-blog.wled.top/api";
})();

/**
 * 统一管理博客 API 终点映射 (遵循大写+下划线+_MAP 后缀规范)
 */
export const BLOG_API_ENDPOINTS_MAP = {
  SITE_INFO: "/site.json",
  POSTS_LIST: (page: number) => `/posts/${page}.json`,
  ARTICLE_DETAIL: (slug: string) => `/articles/${slug}.json`,
  ISOLATED_PAGE: (slug: string) => `/pages/${slug}.json`,

  // 新增：分类与标签列表
  CATEGORIES_LIST: "/categories.json",
  TAGS_LIST: "/tags.json",

  // 新增：获取特定分类/标签下的文章列表数据
  CATEGORY_DETAIL: (name: string) => `/categories/${name}.json`,
  TAG_DETAIL: (name: string) => `/tags/${name}.json`,

  // 预留：全局搜索索引（需博客生成器配合生成 search.json）
  SEARCH_INDEX: "/search.json",
} as const;
