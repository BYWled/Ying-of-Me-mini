/**
 * 站点基础元数据类型定义
 */
export interface SiteInfo {
  title: string;
  subtitle: string;
  description: string;
  author: string;
  language: string;
  timezone: string;
  url: string;
  theme_config: {
    info: {
      title: string;
      author: string;
      url: string;
    };
    defaults: {
      favicon: string;
      logo: string | null;
      avatar: string;
    };
    colors: {
      primary: string;
      secondary: string | null;
      default_mode: string;
    };
  };
}

/**
 * 分类/标签简要结构
 */
export interface TaxonomyMeta {
  name: string;
  path: string;
}

/**
 * 文章列表项数据结构（注：列表中 content 默认为 null，节约带宽）
 */
export interface PostListItem {
  title: string;
  slug: string;
  date: string;
  updated: string;
  comments: boolean;
  path: string;
  excerpt: string;
  keywords: string | null;
  cover: string | null;
  categories: TaxonomyMeta[];
  tags: TaxonomyMeta[];
}

/**
 * 分页文章列表返回接口
 */
export interface PostListResponse {
  total: number;
  pageSize: number;
  pageCount: number;
  data: PostListItem[];
}

/**
 * 文章及孤岛页面完整详情结构
 */
export interface ArticleDetail {
  title: string;
  slug: string;
  date: string;
  updated: string;
  comments: boolean;
  path: string;
  excerpt: string;
  content: string; // WXML/mp-html 渲染所需的核心 HTML 字符串
  cover?: string | null; // 【新增】修复封面属性报错
  more: string;
  categories: TaxonomyMeta[];
  tags: TaxonomyMeta[];
}
