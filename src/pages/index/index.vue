<template>
  <view class="relative w-full min-h-screen bg-[#e6f2f0] flex flex-col items-center pt-[15vh]">
    
    <!-- 背景图片铺满全屏 -->
    <image
      class="absolute top-0 left-0 z-0 w-full h-full object-cover"
      src="https://www.wled.top/images/wallhaven-wqery6-light.webp"
      mode="aspectFill"
    />

    <view class="relative z-10 w-[85%] p-[40rpx] rounded-[32rpx] shadow-xl bg-white/40 backdrop-blur-md border border-white/60 flex flex-col items-center">
      
      <view class="w-[140rpx] h-[140rpx] rounded-full bg-gray-100 mb-4 border-[6rpx] border-[#42b983] overflow-hidden flex justify-center items-center shadow-sm">
         <text class="text-[22rpx] text-gray-500 text-center leading-tight">这是头像<br/>Avatar</text>
      </view>

      <text class="text-[36rpx] font-bold text-gray-800 mb-2">伴莺的小窝</text>
      <text class="text-[26rpx] text-gray-600 mb-6 text-center">
        UnoCSS 编译测试成功！当前为毛玻璃响应式卡片。
      </text>

      <view class="flex w-full justify-around mt-2 border-t border-white/50 pt-4">
        <view class="flex flex-col items-center">
          <text class="text-[32rpx] font-bold text-[#42b983]">9</text>
          <text class="text-[22rpx] text-gray-500">团队成员</text>
        </view>
        <view class="flex flex-col items-center">
          <text class="text-[32rpx] font-bold text-[#42b983]">22%</text>
          <text class="text-[22rpx] text-gray-500">前端热爱</text>
        </view>
      </view>

      <button class="mt-8 w-[80%] bg-[#42b983] text-white rounded-full py-[16rpx] text-[28rpx] font-medium active:scale-95 transition-all">
        开始探索
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
// 逻辑层暂不添加复杂逻辑，仅测试视图渲染
</script>

<style >
/* 注意：由于开启了 UnoCSS，这里不需要写任何 custom style。
  全局的 page 背景色在 pages.json 中控制即可。
*/
</style>