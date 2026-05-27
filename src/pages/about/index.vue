<template>
  <view class="about-page">
    <!-- 关于页自主托管并渲染的头部，与分类、中心等 Tab 页面保持设计高度统一 -->
    <view class="header">
      <view class="title">关于</view>
    </view>

    <!-- 嵌入文章详情组件：隐藏内置 header 避免重复，同时开启嵌入模式以适配底部 TabBar -->
    <ArticleDetail :is-embed="true" slug="about" :is-page-type="true" :hide-header="true" />
  </view>
</template>

<script setup>
import ArticleDetail from '../article/detail.vue';
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: calc(100rpx + var(--status-bar-height));
  box-sizing: border-box;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  padding-top: var(--status-bar-height);
  background-color: #fff;
  display: flex;
  align-items: center;
  padding-left: 30rpx;
  z-index: 99;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);

}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
</style>