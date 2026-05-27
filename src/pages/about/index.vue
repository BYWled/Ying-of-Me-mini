<script setup>
import { ref } from 'vue'
import ArticleDetail from '../article/detail.vue'

// 动态获取当前设备的状态栏高度，适配刘海屏和灵动岛
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(systemInfo.statusBarHeight || 0)
</script>

<template>
  <!-- 页面容器：防溢出、全屏宽度 -->
  <view class="box-border w-screen overflow-x-hidden">

    <!-- 自定义托管的头部：使用 UnoCSS 实现毛玻璃、暗黑模式适配 (dark:) 与过渡动画 -->
    <view
      class="fixed top-0 inset-x-0 z-[99] bg-white/15 backdrop-blur-[12px] border-b-[1rpx] border-solid border-black/5 transition-colors duration-300 ease-in-out dark:bg-[#1e1e1e]/85 dark:border-white/5"
      :style="{ paddingTop: statusBarHeight + 'px' }">
      <!-- 内容区：微信标准 44px 胶囊栏高度对齐 -->
      <view class="h-[44px] flex items-center px-[32rpx]">
        <text class="text-[32rpx] font-bold text-[#1a1a1a] transition-colors duration-300 dark:text-[#f5f5f5]">
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