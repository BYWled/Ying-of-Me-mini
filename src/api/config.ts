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
  return "https://www.wled.top/api";
  // #endif

  // 兜底默认值
  return "https://www.wled.top/api";
})();

/**
 * 统一管理博客 API 终点映射 (遵循大写+下划线+_MAP 后缀规范)
 */
export const BLOG_API_ENDPOINTS_MAP = {
  SITE_INFO: "/site.json",
  POSTS_LIST: (page: number) => `/posts/${page}.json`,
  ARTICLE_DETAIL: (slug: string) => `/articles/${slug}.json`,
  ISOLATED_PAGE: (slug: string) => `/pages/${slug}.json`,
  CATEGORIES_LIST: "/categories.json",
  TAGS_LIST: "/tags.json",
} as const;
