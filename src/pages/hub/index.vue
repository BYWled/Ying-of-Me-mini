<template>
  <view class="min-h-screen bg-[#f0f2f5] p-[40rpx] pt-[12vh] relative box-border">
    <view class="absolute top-0 left-0 w-full h-[35vh] bg-gradient-to-b from-[#e6f2f0] to-transparent z-0"></view>

    <view class="relative z-10">
      <text class="text-[48rpx] font-bold text-gray-800 block mb-2">探索</text>
      <text class="text-[28rpx] text-gray-500 block mb-8">散落的不成文碎片与专题汇总</text>

      <view class="grid grid-cols-2 gap-[32rpx]">

        <view
          class="bg-white/60 backdrop-blur-lg rounded-[32rpx] p-[32rpx] shadow-sm border border-white flex flex-col active:scale-95 transition-all"
          @click="navigateToPage('projects')">
          <view class="w-[88rpx] h-[88rpx] rounded-full bg-[#42b983]/10 flex items-center justify-center mb-4">
            <text class="text-[44rpx]">💡</text>
          </view>
          <text class="text-[32rpx] font-bold text-gray-800 mb-1">实验室</text>
          <text class="text-[22rpx] text-gray-500 line-clamp-2 leading-relaxed">一些有趣的前端轮子与实践记录</text>
        </view>

        <view
          class="bg-white/60 backdrop-blur-lg rounded-[32rpx] p-[32rpx] shadow-sm border border-white flex flex-col active:scale-95 transition-all"
          @click="navigateToPage('friends')">
          <view class="w-[88rpx] h-[88rpx] rounded-full bg-[#42b983]/10 flex items-center justify-center mb-4">
            <text class="text-[44rpx]">🤝</text>
          </view>
          <text class="text-[32rpx] font-bold text-gray-800 mb-1">友链</text>
          <text class="text-[22rpx] text-gray-500 line-clamp-2 leading-relaxed">那些在网络上相遇的有趣灵魂</text>
        </view>

        <view
          class="bg-white/60 backdrop-blur-lg rounded-[32rpx] p-[32rpx] shadow-sm border border-white flex flex-col active:scale-95 transition-all col-span-2"
          @click="navigateToPage('timeline')">
          <view class="flex items-center mb-2">
            <view class="w-[64rpx] h-[64rpx] rounded-full bg-[#42b983]/10 flex items-center justify-center mr-3">
              <text class="text-[32rpx]">⏳</text>
            </view>
            <text class="text-[32rpx] font-bold text-gray-800">时光机</text>
          </view>
          <text class="text-[22rpx] text-gray-500 leading-relaxed">博客建站以来的所有归档与里程碑记录</text>
        </view>

      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 路由跳转方法预留
const navigateToPage = (slug: string) => {
  // 这里的跳转逻辑取决于你如何处理孤岛页面的详情
  console.log(`准备跳转到孤岛页面: ${slug}`)

  // 示例跳转路径：
  // uni.navigateTo({
  //   url: `/pages/article/detail?type=page&slug=${slug}`
  // })
}
</script>