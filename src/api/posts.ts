import { BASE_URL, BLOG_API_ENDPOINTS_MAP } from "./config";
import type { SiteInfo, PostListResponse, ArticleDetail } from "./types";

/**
 * 核心泛型基础请求方法
 */
function request<T>(url: string, method: "GET" | "POST" = "GET"): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      header: {
        "Content-Type": "application/json",
      },
      success: (res) => {
        // 静态 JSON 文件部署请求成功通常返回 200
        if (res.statusCode === 200) {
          resolve(res.data as T);
        } else {
          uni.showToast({
            title: `获取数据失败 (${res.statusCode})`,
            icon: "none",
          });
          reject(res);
        }
      },
      fail: (err) => {
        uni.showToast({
          title: "网络连接异常",
          icon: "none",
        });
        reject(err);
      },
    });
  });
}

/**
 * 博客数据模块 API 服务
 */
export const blogApi = {
  /**
   * 获取站点全局配置（基础元数据、头像、主色调等）
   */
  getSiteInfo: () => {
    return request<SiteInfo>(BLOG_API_ENDPOINTS_MAP.SITE_INFO);
  },

  /**
   * 按页码获取文章列表
   * @param page 页码，从 1 开始
   */
  getPostsList: (page: number) => {
    return request<PostListResponse>(BLOG_API_ENDPOINTS_MAP.POSTS_LIST(page));
  },

  /**
   * 获取文章正文详情
   * @param slug 文章标识符 (如: 'hello-world')
   */
  getArticleDetail: (slug: string) => {
    return request<ArticleDetail>(BLOG_API_ENDPOINTS_MAP.ARTICLE_DETAIL(slug));
  },

  /**
   * 获取独立孤岛专题页正文（如友链、关于等）
   * @param slug 孤岛页面标识符
   */
  getIsolatedPageDetail: (slug: string) => {
    return request<ArticleDetail>(BLOG_API_ENDPOINTS_MAP.ISOLATED_PAGE(slug));
  },
  /**
   * 获取所有分类列表
   */
  getCategoriesList: () => {
    return request<any[]>(BLOG_API_ENDPOINTS_MAP.CATEGORIES_LIST);
  },

  /**
   * 获取所有标签列表
   */
  getTagsList: () => {
    return request<any[]>(BLOG_API_ENDPOINTS_MAP.TAGS_LIST);
  },

  /**
   * 获取指定分类详情及文章列表
   * @param name 分类名称
   */
  getCategoryDetail: (name: string) => {
    return request<any>(BLOG_API_ENDPOINTS_MAP.CATEGORY_DETAIL(name));
  },

  /**
   * 获取指定标签详情及文章列表
   * @param name 标签名称
   */
  getTagDetail: (name: string) => {
    return request<any>(BLOG_API_ENDPOINTS_MAP.TAG_DETAIL(name));
  },

  /**
   * 获取全局搜索数据（用于纯前端搜索）
   */
  getSearchIndex: () => {
    return request<any[]>(BLOG_API_ENDPOINTS_MAP.SEARCH_INDEX);
  },
};
