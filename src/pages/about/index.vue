<template>
  <!-- 页面容器：防溢出、全屏宽度 -->
  <view class="box-border w-screen overflow-x-hidden">

    <!-- 自定义托管的头部：使用 UnoCSS 实现毛玻璃、暗黑模式适配 (dark:) 与过渡动画 -->
    <view
      class="fixed top-0 inset-x-0 z-[99] backdrop-blur-[12px] border-b-[1rpx] border-solid transition-colors duration-300 ease-in-out"
      :style="{ paddingTop: statusBarHeight + 'px', backgroundColor: isDark ? 'rgba(30,30,30,0.85)' : 'rgba(255,255,255,0.15)', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }">
      <view class="h-[44px] flex items-center px-[32rpx]">
        <text class="text-[32rpx] font-bold transition-colors duration-300"
          :style="{ color: isDark ? '#f5f5f5' : '#1a1a1a' }">
          About | 关于
        </text>
      </view>
    </view>

    <!-- 顶部占位区：确保底部的文章详情顺延在导航栏下方 -->
    <view class="w-full" :style="{ height: `calc(${statusBarHeight}px + 44px)` }"></view>

    <!-- 嵌入文章详情组件 -->
    <ArticleDetail :is-embed="true" slug="about" :is-page-type="true" :hide-header="true" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import ArticleDetail from '../article/detail.vue'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()

const systemInfo = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync()
const statusBarHeight = ref(systemInfo.statusBarHeight || 0)
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