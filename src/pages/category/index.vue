<template>
  <view class="h-screen flex flex-col bg-[#f5f6f8]">

    <!-- 1. 全屏静止背景 (解决背景填充不全问题，利用 fixed 保证滚动时完全拉伸遮罩) -->
    <view class="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
      <image class="w-full h-full object-cover transition-all duration-700"
        src="https://www.wled.top/images/wallhaven-wqery6-light.webp" mode="aspectFill" />
      <!-- 视差暗光遮罩 -->
      <view class="absolute inset-0 transition-all duration-500" />
    </view>

    <!-- 顶部占位区：确保底部的文章详情顺延在导航栏下方 -->
    <view class="w-full shrink-0"
      :style="{ height: `calc(${statusBarHeight}px + ${(currentSelection.type === 'category' && currentSubCategories.length > 0) || (currentSelection.type === 'search' && searchResultCategories.length > 1) ? '140' : '88'}rpx)` }">
    </view>

    <!-- ================= 概览视图 ================= -->
    <template v-if="!currentSelection.type">
      <!-- 顶部自定义搜索栏 (适配状态栏) -->
      <view
        class="fixed top-0 inset-x-0 z-[99] bg-white/15 w-full backdrop-blur-[24rpx] border-b-[1rpx] border-solid border-black/5 transition-colors duration-300 ease-in-out dark:bg-[#1e1e1e]/85 dark:border-white/5"
        :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="px-[28rpx] py-[9rpx] h-[66rpx] max-w-[65vw] flex items-center justify-center">
          <view
            class="bg-gray-100/80 rounded-full px-[28rpx] py-[12rpx] flex items-center flex-1 transition-all focus-within:ring-2 ring-[#42b983]/30 focus-within:bg-white">
            <image src="/static/category/search.png" class="w-[28rpx] h-[28rpx] mr-[12rpx] opacity-40"
              mode="aspectFit" />
            <input class="flex-1 text-[24rpx] text-gray-700 bg-transparent h-full placeholder-gray-400" type="text"
              v-model="searchKeyword" placeholder="搜索文章 / 标签 / 分类" @confirm="handleSearch" />
          </view>
        </view>
      </view>

      <scroll-view scroll-y class="flex-1 overflow-y-auto relative">
        <!-- 增加包裹层，设置最小高度 > 100% 从而强制允许滚动 -->
        <view class="min-h-[100rpx] px-[32rpx] pt-[32rpx] pb-[80rpx] box-border">
          <!-- 分类区 (仅一级分类) -->
          <view class="mb-[64rpx] mt-[32rpx]">
            <view class="flex items-center justify-between mb-[32rpx] px-[8rpx]">
              <view class="text-[32rpx] font-bold text-gray-800 flex items-center">
                <view class="w-[12rpx] h-[32rpx] bg-[#42b983] rounded-full mr-[16rpx]"></view>
                全部分类
              </view>
            </view>

            <view class="grid grid-cols-2 gap-[24rpx]">
              <view v-for="item in rootCategories" :key="item.name"
                class="p-[32rpx] rounded-[24rpx] shadow-sm border border-white/50 backdrop-blur-lg hover:shadow-md flex flex-col relative overflow-hidden active:scale-99 transition-transform"
                @click="loadDetail('category', item.name)">
                <text class="text-[30rpx] font-bold text-gray-800 mb-[8rpx] z-10">{{ item.name }}</text>
                <text class="text-[24rpx] text-gray-400 z-10">{{ item.count }} 篇文章</text>
                <!-- 装饰背景字母蒙版 -->
                <view
                  class="absolute -right-[24rpx] -bottom-[24rpx] text-[80rpx] opacity-[0.03] text-[#42b983] font-black z-0 pointer-events-none">
                  C
                </view>
              </view>
            </view>
          </view>

          <!-- 标签区 -->
          <view class="mb-[48rpx]">
            <view class="flex items-center justify-between mb-[32rpx] px-[8rpx]">
              <view class="text-[32rpx] font-bold text-gray-800 flex items-center">
                <view class="w-[12rpx] h-[32rpx] bg-indigo-400 rounded-full mr-[16rpx]"></view>
                热门标签
              </view>
            </view>

            <view class="flex flex-wrap gap-[24rpx]">
              <view
                class="flex items-center px-[28rpx] py-[12rpx] rounded-full text-[26rpx] bg-white/80 backdrop-blur-sm border border-white shadow-sm text-gray-600 active:bg-gray-50 active:scale-95 transition-all"
                v-for="item in tags" :key="item.name" @click="loadDetail('tag', item.name)">
                <text class="text-indigo-400 mr-[8rpx] font-bold text-[24rpx]">#</text>
                <text class="mr-[12rpx]">{{ item.name }}</text>
                <text class="text-[22rpx] text-gray-400">({{ item.count }})</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </template>

    <!-- ================= 列表/搜索视图 ================= -->
    <template v-else>
      <!-- 规范化 Header -->
      <view
        class="fixed top-0 inset-x-0 z-[99] bg-white/15 backdrop-blur-[24rpx] border-b-[1rpx] border-solid border-black/5 transition-colors duration-300 ease-in-out dark:bg-[#1e1e1e]/85 dark:border-white/5"
        :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="flex items-center px-[16rpx] h-[88rpx]">
          <!-- 左侧返回热区 -->
          <view class="pl-[12rpx] h-full flex items-center justify-center active:opacity-50 transition-opacity"
            @click="resetView">
            <image src="/static/public/back.png" class="w-[36rpx] h-[36rpx]" mode="aspectFit" />
          </view>
          <!-- 居中标题：根据状态动态显示 -->
          <view class="text-[32rpx] font-bold text-gray-800 flex-1 text-center truncate px-[16rpx]">
            {{
              currentSelection.type === 'category' ? currentSelection.parentName :
                currentSelection.type === 'search' ? '搜索：' + searchKeyword :
                  '#' + currentSelection.name
            }}
          </view>
          <!-- 右侧占位以保证标题绝对居中 -->
          <view class="pl-[12rpx] w-[36rpx] h-full"></view>
        </view>

        <!-- 横向选项卡蒙版 (包含二级分类 或 搜索结果多分类) -->
        <scroll-view
          v-if="(currentSelection.type === 'category' && currentSubCategories.length > 0) || (currentSelection.type === 'search' && searchResultCategories.length > 1)"
          scroll-x class="w-full whitespace-nowrap px-[16rpx] pb-[16rpx] pt-[8rpx]" :show-scrollbar="false">
          <view class="flex items-center">

            <!-- 分类模式下的二级分类 Tabs -->
            <template v-if="currentSelection.type === 'category'">
              <view class="inline-block px-[32rpx] py-[8rpx] mx-[12rpx] rounded-full text-[26rpx] transition-all border"
                :class="activeTab === currentSelection.parentName ? 'bg-[#42b983] text-white border-[#42b983] shadow-sm shadow-[#42b983]/20' : 'bg-gray-100/80 text-gray-600 border-transparent active:bg-gray-200'"
                @click="switchTab(currentSelection.parentName!)">
                全部
              </view>
              <view v-for="sub in currentSubCategories" :key="sub.name"
                class="inline-block px-[32rpx] py-[8rpx] mx-[12rpx] rounded-full text-[26rpx] transition-all border"
                :class="activeTab === sub.name ? 'bg-[#42b983] text-white border-[#42b983] shadow-sm shadow-[#42b983]/20' : 'bg-gray-100/80 text-gray-600 border-transparent active:bg-gray-200'"
                @click="switchTab(sub.name)">
                {{ sub.displayName }}
              </view>
            </template>

            <!-- 搜索模式下的提取一级分类 Tabs -->
            <template v-else-if="currentSelection.type === 'search'">
              <view class="inline-block px-[32rpx] py-[8rpx] mx-[12rpx] rounded-full text-[26rpx] transition-all border"
                :class="activeTab === '全部' ? 'bg-[#42b983] text-white border-[#42b983] shadow-sm shadow-[#42b983]/20' : 'bg-gray-100/80 text-gray-600 border-transparent active:bg-gray-200'"
                @click="switchSearchTab('全部')">
                全部
              </view>
              <view v-for="cat in searchResultCategories" :key="cat.name"
                class="inline-block px-[32rpx] py-[8rpx] mx-[12rpx] rounded-full text-[26rpx] transition-all border"
                :class="activeTab === cat.name ? 'bg-[#42b983] text-white border-[#42b983] shadow-sm shadow-[#42b983]/20' : 'bg-gray-100/80 text-gray-600 border-transparent active:bg-gray-200'"
                @click="switchSearchTab(cat.name)">
                {{ cat.displayName }}
              </view>
            </template>

          </view>
        </scroll-view>
      </view>

      <!-- 文章/搜索列表蒙版内容 -->
      <scroll-view scroll-y class="flex-1 overflow-y-auto relative"
        :style="{ paddingTop: (currentSelection.type === 'category' && currentSubCategories.length > 0) || (currentSelection.type === 'search' && searchResultCategories.length > 1) ? '32rpx' : '0' }">
        <view class="min-h-[calc(100%+2rpx)] px-[32rpx] pt-[32rpx] pb-[80rpx] box-border">
          <view
            class="bg-white/80 backdrop-blur-[24rpx] border border-white p-[32rpx] rounded-[24rpx] mb-[24rpx] shadow-sm flex flex-col active:scale-[0.98] transition-transform"
            v-for="post in currentArticleList" :key="post.slug" @click="goToArticle(post.slug)">
            <text class="text-[32rpx] text-gray-800 font-bold mb-[16rpx] leading-snug line-clamp-2">
              {{ post.title }}
            </text>
            <view class="flex items-center justify-between text-[24rpx] text-gray-400 mt-[8rpx]">
              <view class="flex items-center">
                <text>{{ formatDate(post.date) }}</text>
              </view>
              <text v-if="post.categories && post.categories.length"
                class="text-[#42b983] bg-[#42b983]/10 px-[16rpx] py-[4rpx] rounded-[12rpx]">
                {{ post.categories[post.categories.length - 1].name.split('/').pop() }}
              </text>
            </view>
          </view>

          <!-- 列表空状态 -->
          <view v-if="currentArticleList.length === 0"
            class="flex flex-col items-center justify-center py-[160rpx] text-gray-400">
            <image src="/static/category/empty.png" class="w-[256rpx] h-[256rpx] mb-[32rpx] opacity-70"
              mode="aspectFit" />
            <text class="text-[28rpx]">{{ currentSelection.type === 'search' ? '未找到包含该关键字的文章' : '此分类/标签下暂无文章' }}</text>
          </view>
        </view>
      </scroll-view>
    </template>

  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { blogApi } from '@/api/posts';
import { BASE_URL } from '@/api/config';

// --- 系统信息适配 ---
const sysInfo = uni.getSystemInfoSync();
const statusBarHeight = ref(sysInfo.statusBarHeight || 20);

// --- 基础数据 ---
const categories = ref<any[]>([]);
const tags = ref<any[]>([]);
const searchKeyword = ref('');
// 搜索索引本地缓存，避免重复拉取大文件
const searchIndexCache = ref<any[]>([]);
// 存储当前搜索全部匹配结果（方便在二级分类 Tab 中切换时本地过滤，不丢失数据）
const currentSearchRawResults = ref<any[]>([]);

// --- 衍生状态计算 ---
// 提取一级分类
const rootCategories = computed(() => {
  return categories.value.filter(c => !c.name.includes('/'));
});

// 获取当前选中分类的子分类
const currentSubCategories = computed(() => {
  if (currentSelection.value.type !== 'category' || !currentSelection.value.parentName) return [];
  const pName = currentSelection.value.parentName;
  return categories.value
    .filter(c => c.name.startsWith(pName + '/') && c.name !== pName)
    .map(c => ({
      ...c,
      displayName: c.name.replace(pName + '/', '')
    }));
});

// 提取当前搜索结果中所包含的所有“一级分类”
const searchResultCategories = computed(() => {
  if (currentSelection.value.type !== 'search') return [];

  const cats = new Set<string>();
  currentSearchRawResults.value.forEach(post => {
    if (post.categories && post.categories.length > 0) {
      post.categories.forEach((c: any) => {
        const topCat = c.name.split('/')[0]; // 提取一级分类
        cats.add(topCat);
      });
    }
  });
  return Array.from(cats).map(name => ({ name, displayName: name }));
});

// --- 视图与列表状态 ---
const currentSelection = ref<{
  type: 'category' | 'tag' | 'search' | '';
  name: string;
  parentName?: string;
}>({ type: '', name: '' });

const activeTab = ref('');
const currentArticleList = ref<any[]>([]);

onMounted(async () => {
  await fetchMetaData();
});

const fetchMetaData = async () => {
  uni.showLoading({ title: '加载中...', mask: true });
  try {
    const [catRes, tagRes] = await Promise.all([
      blogApi.getCategoriesList(),
      blogApi.getTagsList()
    ]);
    categories.value = catRes || [];
    tags.value = tagRes || [];
  } catch (error) {
    uni.showToast({ title: '数据加载失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
};

/**
 * 载入分类或标签详情 (初始化进入列表视图)
 */
const loadDetail = (type: 'category' | 'tag', name: string) => {
  currentSelection.value = {
    type,
    name,
    parentName: type === 'category' ? name.split('/')[0] : name
  };
  switchTab(name);
};

/**
 * 切换子分类 Tab 获取文章数据
 */
const switchTab = async (targetName: string) => {
  activeTab.value = targetName;
  currentArticleList.value = [];

  uni.showLoading({ title: '加载中...' });
  try {
    let res;
    if (currentSelection.value.type === 'category') {
      res = await blogApi.getCategoryDetail(targetName);
    } else {
      res = await blogApi.getTagDetail(targetName);
    }
    currentArticleList.value = Array.isArray(res) ? res : (res.postlist || res.posts || res.data || []);
  } catch (error) {
    console.error(error);
  } finally {
    uni.hideLoading();
  }
};

/**
 * 切换搜索结果中提纯的分类 Tab（纯本地过滤）
 */
const switchSearchTab = (catName: string) => {
  activeTab.value = catName;
  if (catName === '全部') {
    currentArticleList.value = currentSearchRawResults.value;
  } else {
    currentArticleList.value = currentSearchRawResults.value.filter(post => {
      if (!post.categories || post.categories.length === 0) return false;
      // 判断该文章所属的分类列表中，是否存在该一级分类
      return post.categories.some((c: any) => c.name.split('/')[0] === catName);
    });
  }
};

/**
 * 重置视图回到概览
 */
const resetView = () => {
  currentSelection.value = { type: '', name: '' };
  activeTab.value = '';
  currentArticleList.value = [];
  currentSearchRawResults.value = []; // 清空搜索备份
  searchKeyword.value = ''; // 退出时清空搜索栏
};

/**
 * 搜索功能核心逻辑
 */
const handleSearch = async () => {
  const kw = searchKeyword.value.trim();
  if (!kw) {
    // 若清空关键字并回车，回到概览
    if (currentSelection.value.type === 'search') resetView();
    return;
  }

  // 1. 如果尚未缓存全局搜索索引，我们需要把分页的 posts 全部拉取下来，才能保证纯本地静态搜索的 100% 准确度
  if (searchIndexCache.value.length === 0) {
    uni.showLoading({ title: '构建全站索引...' });
    try {
      const rawData: any = await new Promise((resolve, reject) => {
        uni.request({
          url: `${BASE_URL}/posts.json`,
          success: (res) => {
            if (res.statusCode === 200) resolve(res.data);
            else reject(res);
          },
          fail: reject
        });
      });

      let allPosts = Array.isArray(rawData) ? rawData : (rawData.data || rawData.posts || []);

      // 核心修复点：如果有分页，并发请求后续分页的数据合并进内存索引，防止“只搜出第一页数据”
      if (rawData && rawData.pageCount && rawData.pageCount > 1) {
        const promises = [];
        for (let i = 2; i <= rawData.pageCount; i++) {
          promises.push(blogApi.getPostsList(i).catch(() => null));
        }
        const restPages = await Promise.all(promises);
        restPages.forEach((pageData: any) => {
          if (pageData) {
            const items = Array.isArray(pageData) ? pageData : (pageData.data || pageData.posts || []);
            allPosts = allPosts.concat(items);
          }
        });
      }

      searchIndexCache.value = allPosts;
    } catch (error) {
      console.error('搜索数据拉取失败：', error);
      uni.showToast({ title: '无法获取完整文章数据', icon: 'none' });
      uni.hideLoading();
      return;
    }
    uni.hideLoading();
  }

  // 2. 解析搜索关键字（按空格切分）
  const tokens = kw.split(/\s+/);
  const textTokens: string[] = [];
  const tagTokens: string[] = [];

  for (const token of tokens) {
    if (token.startsWith('#') && token.length > 1) {
      tagTokens.push(token.substring(1).toLowerCase());
    } else if (token !== '#') {
      textTokens.push(token.toLowerCase());
    }
  }

  // 3. 纯本地精准过滤逻辑 (同时支持标题匹配与标签匹配，AND逻辑)
  const matchedArticles = searchIndexCache.value.filter(post => {
    // A. 标题必须包含所有的文本关键字 (区分是否为空)
    const titleLower = (post.title || '').toLowerCase();
    const matchesText = textTokens.length === 0 || textTokens.every(t => titleLower.includes(t));

    // B. 文章的 tags 必须包含所有的标签关键字
    const postTagsLower = (post.tags || []).map((tag: any) => (tag.name || '').toLowerCase());
    const matchesTags = tagTokens.length === 0 || tagTokens.every(tt => postTagsLower.includes(tt));

    return matchesText && matchesTags;
  });

  // 4. 渲染搜索列表视图，并备份到 currentSearchRawResults 供内部 Tab 使用
  currentSearchRawResults.value = matchedArticles;
  activeTab.value = '全部';
  currentSelection.value = {
    type: 'search',
    name: kw,
    parentName: `搜索: ${kw}`
  };
  currentArticleList.value = matchedArticles;
};

const goToArticle = (slug: string) => {
  uni.navigateTo({
    url: `/pages/article/detail?slug=${slug}`
  });
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
</script>

<style>
/* 隐藏滚动条 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 适配微信小程序的滚动条隐藏 */
/* #ifdef MP-WEIXIN */
scroll-view {
  -webkit-overflow-scrolling: touch;
}

/* #endif */
</style>