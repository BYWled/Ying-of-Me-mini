<template>
  <view
    class="relative w-full min-h-screen overflow-hidden bg-[#e6f2f0] dark:bg-[#121212] transition-colors duration-700">
    <!-- 固定视差背景 -->
    <image class="fixed top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-700 ease-in-out"
      :src="isDarkMode ? 'https://www.wled.top/images/wallhaven-wqery6-dark.webp' : 'https://www.wled.top/images/wallhaven-wqery6-light.webp'"
      mode="aspectFill" />

    <!-- 自定义沉浸式导航栏 -->
    <view class="fixed top-0 left-0 w-full z-50 flex items-end pb-[20rpx] px-[40rpx] transition-all duration-500"
      :style="{ height: navBarHeight + 'px' }">
      <text class="text-[36rpx] font-bold text-gray-800 dark:text-gray-100 tracking-wider">
        探索频道
      </text>
    </view>

    <!-- 主体内容区 -->
    <scroll-view scroll-y class="relative z-10 w-full h-screen box-border"
      :style="{ paddingTop: (navBarHeight + 20) + 'px' }">
      <view class="px-[40rpx] pb-[60rpx]">
        <!-- 页面前导语 -->
        <view class="mb-[40rpx]">
          <text class="text-[26rpx] text-gray-500 dark:text-gray-400 block leading-relaxed">
            除了专题与技术文章，这里还记录了战队荣耀、游戏生活与方块世界的奇遇......
          </text>
        </view>

        <!-- 专题网格列表 -->
        <view class="grid grid-cols-2 gap-[30rpx]">
          <view v-for="(item, index) in hubItems" :key="index"
            class="relative overflow-hidden backdrop-blur-lg rounded-[32rpx] hover:shadow-md p-[32rpx] border border-white/50 dark:border-white/10 flex flex-col active:scale-[0.99] transition-transform duration-300 shadow-sm"
            :class="item.isLarge ? 'col-span-2' : 'col-span-1'" @click="navigateToDetail(item.slug)">
            <!-- 图标容器 (支持加载本地图标与优雅降级) -->
            <view
              class="w-[88rpx] h-[88rpx] rounded-[24rpx] mb-[24rpx] flex items-center justify-center shadow-sm overflow-hidden"
              :class="item.bgColorClass">
              <image v-if="!item.iconError" :src="item.icon" class="w-[50rpx] h-[50rpx] opacity-90" mode="aspectFit"
                @error="handleIconError(index)" />
              <!-- 图标缺失时的降级方案：显示首字母 -->
              <text v-else class="text-[36rpx] font-bold text-white/90">
                {{ item.title.charAt(0).toUpperCase() }}
              </text>
            </view>

            <!-- 文本信息 -->
            <text class="text-[30rpx] font-bold text-gray-800 dark:text-gray-100 mb-[10rpx] truncate">
              {{ item.title }}
            </text>
            <text class="text-[22rpx] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {{ item.desc }}
            </text>

            <!-- 装饰性光晕效果 -->
            <view
              class="absolute -right-[20%] -bottom-[20%] w-[120rpx] h-[120rpx] rounded-full blur-[40px] opacity-30 pointer-events-none"
              :class="item.bgColorClass"></view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// ========== 系统与主题状态 ==========
const isDarkMode = ref(false);
const navBarHeight = ref(80);

// ========== 数据配置层 ==========
interface HubItem {
  title: string;
  desc: string;
  slug: string;
  icon: string;
  bgColorClass: string;
  isLarge?: boolean;
  iconError?: boolean;
}

const hubItems = ref<HubItem[]>([
  {
    title: 'Dozer Esports',
    desc: '战队风采、荣耀记录与成员风云榜。',
    slug: '----dozer-esports--',
    icon: '/static/hub/esports.png',
    bgColorClass: 'bg-gradient-to-br from-blue-400 to-indigo-500',
    isLarge: true
  },
  {
    title: 'Ying of MC',
    desc: '方块世界的故事、服务器动态与奇遇记录。',
    slug: 'ying-of-mc',
    icon: '/static/hub/mc.png',
    bgColorClass: 'bg-gradient-to-br from-green-400 to-emerald-600'
  },
  {
    title: 'Steam 促销',
    desc: '游戏库存、评测与数字世界的第九艺术。',
    slug: '----steam--------',
    icon: '/static/hub/steam.png',
    bgColorClass: 'bg-gradient-to-br from-gray-600 to-gray-800'
  },
  {
    title: '小说 - 死神日记',
    desc: '不知何处寻来的故事碎片，等待拼凑成完整的世界观。',
    slug: '-----------',
    icon: '/static/hub/archive.png',
    bgColorClass: 'bg-gradient-to-br from-purple-400 to-fuchsia-500',
    isLarge: true
  }
]);

// ========== 生命周期与初始化 ==========
onMounted(() => {
  initSystemInfo();
});

/**
 * 安全获取系统信息，避免微信小程序 wx.getSystemInfoSync 废弃警告
 */
const initSystemInfo = () => {
  let statusBarHeight = 20;
  let theme = 'light';

  // 1. 获取状态栏高度 (优先使用最新分立式接口 uni.getWindowInfo)
  if (typeof uni.getWindowInfo === 'function') {
    try {
      statusBarHeight = uni.getWindowInfo().statusBarHeight || 20;
    } catch (e) {
      statusBarHeight = fallbackGetStatusBarHeight();
    }
  } else {
    statusBarHeight = fallbackGetStatusBarHeight();
  }

  // 2. 获取当前系统主题色 (优先使用最新分立式接口 uni.getAppBaseInfo)
  if (typeof uni.getAppBaseInfo === 'function') {
    try {
      theme = uni.getAppBaseInfo().theme || 'light';
    } catch (e) {
      theme = fallbackGetTheme();
    }
  } else {
    theme = fallbackGetTheme();
  }

  // 监听主题发生变化
  isDarkMode.value = theme === 'dark';
  uni.onThemeChange((res) => {
    isDarkMode.value = res.theme === 'dark';
  });

  // 3. 针对微信小程序获取胶囊位置以防遮挡
  // #ifdef MP-WEIXIN
  try {
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
    navBarHeight.value = menuButtonInfo.bottom + 8; // 胶囊底部 + 内边距 padding
  } catch (e) {
    navBarHeight.value = statusBarHeight + 44;
  }
  // #endif

  // #ifndef MP-WEIXIN
  navBarHeight.value = statusBarHeight + 44;
  // #endif
};

// 状态栏高度安全降级方法
const fallbackGetStatusBarHeight = (): number => {
  try {
    return uni.getSystemInfoSync().statusBarHeight || 20;
  } catch (e) {
    return 20;
  }
};

// 主题安全降级方法
const fallbackGetTheme = (): string => {
  try {
    return uni.getSystemInfoSync().theme || 'light';
  } catch (e) {
    return 'light';
  }
};

// ========== 交互与事件 ==========
const handleIconError = (index: number) => {
  hubItems.value[index].iconError = true;
};

const navigateToDetail = (slug: string) => {
  uni.navigateTo({
    url: `/pages/article/detail?type=page&slug=${slug}`
  });
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