<template>
  <!-- 主容器：支持日夜模式平滑过渡 -->
  <view class="min-h-screen pb-[60rpx] transition-colors duration-500 relative box-border overflow-x-hidden"
    :class="isDark ? 'bg-[#121214] text-gray-100' : 'bg-[#f4f7f6] text-gray-800'">
    <!-- 1. 全屏静止背景 (解决背景填充不全问题，利用 fixed 保证滚动时完全拉伸遮罩) -->
    <view class="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
      <image class="w-full h-full object-cover transition-all duration-700" :src="heroBgUrl" mode="aspectFill" />
      <!-- 视差暗光遮罩 (兼容性修复：使用严格的 rgba) -->
      <view class="absolute inset-0 transition-all duration-500"
        :class="isDark ? 'bg-[rgba(0,0,0,0.45)]' : 'bg-[rgba(0,0,0,0.15)]'" />
    </view>

    <!-- 2. 自定义动态渐变导航栏 (向下滚动后显示高透毛玻璃) -->
    <view class="fixed top-0 left-0 w-full z-50 transition-all duration-500 flex items-center px-4 overflow-visible"
      :class="isScrolled ? (isDark ? 'bg-[rgba(0,0,0,0.55)] backdrop-blur-md border-b border-[rgba(255,255,255,0.05)]' : 'bg-[rgba(255,255,255,0.55)] backdrop-blur-md border-b border-[rgba(255,255,255,0.4)]') : 'bg-transparent'"
      :style="{ height: navBarHeight + 'px', paddingTop: statusBarHeight + 'px' }">
      <view class="flex items-center justify-between w-full overflow-visible">
        <!-- 页面标题，滚动后才淡入显示 -->
        <text class="text-[34rpx] font-bold transition-all duration-500" :class="[
          isScrolled ? 'opacity-100' : 'opacity-0 translate-y-[-20rpx]',
          isDark ? 'text-white' : 'text-gray-800'
        ]">
          {{ siteInfo?.title || '伴莺的小窝' }}
        </text>

        <!-- 主题切换精致按钮 (跟随首屏滚动动态平移动画，非 scrolled 时隐藏半边身位) -->
        <view
          class="w-[72rpx] h-[72rpx] rounded-full flex items-center justify-center active:scale-90 transition-all duration-500 ease-out cursor-pointer translate-y-3"
          :class="[
            isScrolled
              ? (isDark ? 'bg-[rgba(255,255,255,0.1)] translate-x-0' : 'bg-[rgba(0,0,0,0.05)] translate-x-0')
              : 'bg-[rgba(255,255,255,0.2)] backdrop-blur-md border border-[rgba(255,255,255,0.2)] translate-x-[48rpx] opacity-75'
          ]" @click="toggleTheme">
          <!-- 优先加载本地图片 -->
          <image class="w-[38rpx] h-[38rpx]"
            :src="isDark ? '/static/home/theme-dark.png' : '/static/home/theme-light.png'" />
        </view>
      </view>
    </view>

    <!-- 3. 【首屏留白区 (Splash Landing Page)】- 100vh 高度设计 -->
    <view class="w-full h-screen relative z-10 flex flex-col justify-center items-center px-6 box-border">
      <view class="text-center translate-y-[-5vh]">
        <!-- 博客主标题 -->
        <text class="text-[64rpx] font-extrabold text-white tracking-widest block drop-shadow-lg mb-4 animate-fade-in">
          {{ siteInfo?.title || '伴莺的小窝' }}
        </text>
        <!-- 博客副标题/简介 (网页版留白风) -->
        <view class="h-[2rpx] w-[120rpx] bg-[rgba(255,255,255,0.6)] mx-auto my-4 rounded-full" />
        <text class="text-[26rpx] text-[rgba(255,255,255,0.8)] font-light tracking-wide block drop-shadow-md px-4">
          {{ siteInfo?.subtitle || '伴莺の小破站' }}
        </text>
      </view>

      <!-- 引导向下滑动指示器 (离线图片箭头) -->
      <view class="absolute bottom-[8vh] flex flex-col items-center animate-bounce cursor-pointer"
        @click="scrollToContent">
        <text class="text-[20rpx] text-[rgba(255,255,255,0.6)] tracking-widest mb-2.5 font-light">SCROLL DOWN</text>
        <!-- 向下箭头图 -->
        <image class="w-[32rpx] h-[32rpx] opacity-75" src="/static/home/arrow-down.png" mode="aspectFit" />
      </view>
    </view>

    <!-- 4. 内容主体层 (从 100vh 以下开始视差滚动叠加) -->
    <view id="content-anchor" class="relative z-10 px-[32rpx] pb-[60rpx] box-border">

      <!-- 4.1 悬浮个人信息玻璃卡片 (网页版左边栏精粹) -->
      <view
        class="w-full rounded-[40rpx] p-[30rpx] box-border shadow-xl border backdrop-blur-xl transition-all duration-500 mb-8"
        :class="isDark ? 'bg-[rgba(0,0,0,0.4)] border-[rgba(255,255,255,0.1)]' : 'bg-[rgba(255,255,255,0.65)] border-[rgba(255,255,255,0.6)]'">
        <view class="flex items-center">
          <!-- 头像 -->
          <view
            class="w-[122rpx] h-[122rpx] rounded-full overflow-hidden border-[4rpx] border-[#42b983] mr-4 flex-shrink-0 shadow-md">
            <image class="w-full h-full" :src="resolvedAvatar" mode="aspectFill" />
          </view>
          <!-- 站长简介 -->
          <view class="flex-1 overflow-hidden">
            <text class="text-[38rpx] font-bold block mb-1" :class="isDark ? 'text-white' : 'text-gray-800'">
              {{ siteInfo?.author || 'BY·Wled' }}
            </text>
            <text class="text-[24rpx] block line-clamp-2 leading-relaxed"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'">
              {{ siteInfo?.description || 'wled\'s home' }}
            </text>
          </view>
        </view>

        <!-- 站点快速统计项 -->
        <view class="grid grid-cols-3 pt-5 border-t mt-4"
          :class="isDark ? 'border-[rgba(255,255,255,0.1)]' : 'border-[rgba(229,231,235,0.5)]'">
          <view class="flex flex-col items-center">
            <!-- 统计文章图标 -->
            <image class="w-[38rpx] h-[38rpx] mb-1.5" src="/static/home/posts.png" mode="aspectFit" />
            <text class="text-[32rpx] font-bold text-[#42b983]">13</text>
            <text class="text-[20rpx]" :class="isDark ? 'text-gray-400' : 'text-gray-500'">文章</text>
          </view>

          <view class="flex flex-col items-center border-x"
            :class="isDark ? 'border-[rgba(255,255,255,0.1)]' : 'border-[rgba(229,231,235,0.5)]'">
            <!-- 分类图标 -->
            <image class="w-[38rpx] h-[38rpx] mb-1.5" src="/static/home/categories.png" mode="aspectFit" />
            <text class="text-[32rpx] font-bold text-[#42b983]">4</text>
            <text class="text-[20rpx]" :class="isDark ? 'text-gray-400' : 'text-gray-500'">分类</text>
          </view>

          <view class="flex flex-col items-center">
            <!-- 标签图标 -->
            <image class="w-[38rpx] h-[38rpx] mb-1.5" src="/static/home/tags.png" mode="aspectFit" />
            <text class="text-[32rpx] font-bold text-[#42b983]">3</text>
            <text class="text-[20rpx]" :class="isDark ? 'text-gray-400' : 'text-gray-500'">标签</text>
          </view>
        </view>
      </view>

      <!-- 4.2 最新文章标题 -->
      <view class="flex items-center justify-between mb-5 px-1">
        <view class="flex items-center">
          <view class="w-[8rpx] h-[32rpx] bg-[#42b983] rounded-full mr-2"></view>
          <text class="text-[32rpx] font-bold" :class="isDark ? 'text-white' : 'text-gray-800'">最新发布</text>
        </view>
      </view>

      <!-- 4.3 优雅紧凑的文章列表流 (左文右图设计) -->
      <view class="flex flex-col gap-[28rpx]">
        <view v-for="(item, index) in postList" :key="item.slug"
          class="w-full rounded-[28rpx] overflow-hidden border backdrop-blur-lg shadow-sm hover:shadow-md p-[28rpx] box-border transition-all duration-300 active:scale-[0.99] flex items-center gap-[24rpx]"
          :class="isDark ? 'bg-[rgba(24,24,27,0.5)] border-[rgba(255,255,255,0.05)]' : 'bg-[rgba(255,255,255,0.75)] border-[rgba(255,255,255,0.5)]'"
          @click="goToDetail(item.slug)">

          <!-- 左侧：主要内容区域 (自适应分配空间) -->
          <view class="flex-1 flex flex-col justify-between min-h-[150rpx] overflow-hidden">
            <view class="flex flex-col">
              <!-- 分类徽章 -->
              <view v-if="item.categories && item.categories.length > 0" class="mb-1.5 flex">
                <text class="px-2 py-[2rpx] rounded-[6rpx] text-[18rpx] font-semibold tracking-wide uppercase border"
                  :class="isDark ? 'bg-[rgba(66,185,131,0.05)] border-[rgba(66,185,131,0.2)] text-[#42b983]' : 'bg-[rgba(66,185,131,0.1)] border-[rgba(66,185,131,0.15)] text-[#309b6c]'">
                  {{ item.categories[0].name }}
                </text>
              </view>

              <!-- 文章标题 -->
              <text class="text-[28rpx] font-bold leading-snug line-clamp-2 transition-colors mb-1"
                :class="isDark ? 'text-white' : 'text-gray-800'">
                {{ item.title }}
              </text>

              <!-- 精确1行文章摘要 -->
              <text class="text-[23rpx] line-clamp-1 leading-relaxed mb-2"
                :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                {{ item.excerpt || '点击进入阅读详情，查看关于本篇更新日志、代码实践和详细教程。' }}
              </text>
            </view>

            <!-- 底部元数据信息 -->
            <view class="flex items-center justify-between pt-2 border-t"
              :class="isDark ? 'border-[rgba(255,255,255,0.05)]' : 'border-[rgba(243,244,246,0.8)]'">
              <!-- 日期显示 -->
              <view class="flex items-center text-gray-400 flex-shrink-0">
                <image class="w-[24rpx] h-[24rpx] mr-1" src="/static/home/calendar.png" mode="aspectFit" />
                <text class="text-[19rpx] font-medium" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                  {{ formatDate(item.date) }}
                </text>
              </view>

              <!-- 标签流 -->
              <view v-if="item.tags && item.tags.length > 0"
                class="flex gap-1.5 overflow-hidden justify-end flex-1 pl-3">
                <text v-for="tag in item.tags.slice(0, 2)" :key="tag.name"
                  class="px-2 py-[2rpx] rounded-[6rpx] text-[17rpx] font-semibold transition-all duration-300" :class="isDark
                    ? 'bg-[rgba(66,185,131,0.1)] text-[#42b983] border border-[rgba(66,185,131,0.2)]'
                    : 'bg-[rgba(66,185,131,0.05)] text-[#309b6c] border border-[rgba(66,185,131,0.1)]'">
                  # {{ tag.name }}
                </text>
              </view>
            </view>
          </view>

          <!-- 右侧：精美小巧的封面大图 -->
          <view class="w-[200rpx] h-[150rpx] rounded-[18rpx] overflow-hidden flex-shrink-0 shadow-sm relative">
            <image class="w-full h-full object-cover" :src="resolveMediaUrl(item.cover)" mode="aspectFill" />
            <view class="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.1)] to-transparent" />
          </view>
        </view>
      </view>

      <!-- 5. 底部状态加载器 -->
      <view class="py-12 flex justify-center items-center">
        <view v-if="isLoading" class="flex items-center gap-2">
          <view class="w-4 h-4 rounded-full border-2 border-[#42b983] border-t-transparent animate-spin"></view>
          <text class="text-[24rpx]" :class="isDark ? 'text-gray-400' : 'text-gray-500'">正在读取服务器碎片...</text>
        </view>
        <text v-else-if="currentPage >= totalPage" class="text-[22rpx]"
          :class="isDark ? 'text-gray-500' : 'text-gray-400'">
          文章已加载完毕 · 伴莺的小窝 @ wled.top
        </text>
        <text v-else class="text-[22rpx]" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
          上拉探索更多篇章
        </text>
      </view>

    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom, onPageScroll } from '@dcloudio/uni-app';
import { blogApi } from '@/api/posts';
import type { SiteInfo, PostListItem } from '@/api/types';

// 1. 系统适配相关
const statusBarHeight = ref(20);
const navBarHeight = ref(64);

// 2. 页面滑动控制 (控制沉浸式留白和导航栏过渡效果)
const scrollTop = ref(0);
const isScrolled = computed(() => scrollTop.value > 120);

// 3. 主题管理
const isDark = ref(false);

const heroBgUrl = computed(() => {
  return isDark.value
    ? 'https://www.wled.top/images/wallhaven-wqery6-dark.webp'
    : 'https://www.wled.top/images/wallhaven-wqery6-light.webp';
});

// 4. 博客核心数据流
const siteInfo = ref<SiteInfo | null>(null);
const postList = ref<PostListItem[]>([]);
const currentPage = ref(1);
const totalPage = ref(1);
const isLoading = ref(false);

// 5. 辅助方法：多媒体绝对路径补全
const resolveMediaUrl = (path: string | null | undefined) => {
  if (!path) {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `https://www.wled.top${path.startsWith('/') ? '' : '/'}${path}`;
};

const resolvedAvatar = computed(() => {
  return resolveMediaUrl(siteInfo.value?.theme_config?.defaults?.avatar || '/images/Oz-Vessalius-avatar.svg');
});

// 格式化日期格式
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 6. 页面滚动引导
const scrollToContent = () => {
  const query = uni.createSelectorQuery();
  query.select('#content-anchor').boundingClientRect((data) => {
    // 兼容可能返回 of NodeInfo 或 NodeInfo[] 类型
    const rect = Array.isArray(data) ? data[0] : data;
    if (rect && typeof rect.top === 'number') {
      uni.pageScrollTo({
        scrollTop: scrollTop.value + rect.top - navBarHeight.value - statusBarHeight.value - 20,
        duration: 500
      });
    }
  }).exec();
};

// 7. 数据请求逻辑
const fetchSiteMeta = async () => {
  try {
    const res = await blogApi.getSiteInfo();
    siteInfo.value = res;
  } catch (err) {
    console.error('获取站点配置失败:', err);
  }
};

const fetchArticlesList = async (page: number, append = false) => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const res = await blogApi.getPostsList(page);
    if (append) {
      postList.value = [...postList.value, ...res.data];
    } else {
      postList.value = res.data;
    }
    currentPage.value = page;
    totalPage.value = res.pageCount || 1;
  } catch (err) {
    console.error(`请求第 ${page} 页文章流出错:`, err);
  } finally {
    isLoading.value = false;
  }
};

// 8. 生命周期钩子
onLoad(() => {
  // --- 微信端兼容性修复：使用 getWindowInfo 替代 getSystemInfoSync ---
  // #ifdef MP-WEIXIN
  const windowInfo = uni.getWindowInfo();
  statusBarHeight.value = windowInfo.statusBarHeight || 20;
  const menuButton = uni.getMenuButtonBoundingClientRect();
  navBarHeight.value = (menuButton.bottom + menuButton.top) - statusBarHeight.value;
  // #endif

  // --- 非微信端兜底逻辑 ---
  // #ifndef MP-WEIXIN
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 20;
  navBarHeight.value = statusBarHeight.value + 44;
  // #endif

  // 渲染基础数据
  fetchSiteMeta();
  fetchArticlesList(1);
});

// 9. 用户动作监听
onPageScroll((e) => {
  scrollTop.value = e.scrollTop;
});

onPullDownRefresh(async () => {
  await fetchSiteMeta();
  await fetchArticlesList(1, false);
  uni.stopPullDownRefresh();
});

onReachBottom(() => {
  if (currentPage.value < totalPage.value && !isLoading.value) {
    fetchArticlesList(currentPage.value + 1, true);
  }
});

// 10. 交互方法
const toggleTheme = () => {
  isDark.value = !isDark.value;
  uni.vibrateShort({}); // 触觉反馈
};

const goToDetail = (slug: string) => {
  uni.navigateTo({
    url: `/pages/article/detail?slug=${slug}`
  });
};
</script>

<style>
page {
  background-color: transparent;
}

/* 微信小程序多端 WebKit 模糊补丁 */
.backdrop-blur-md {
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
}

.backdrop-blur-xl {
  -webkit-backdrop-filter: blur(28px);
  backdrop-filter: blur(28px);
}

/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>