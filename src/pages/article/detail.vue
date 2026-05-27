<template>
    <!-- 修复点：彻底改用内联 :style 注入动态色彩，完美避开 UnoCSS 引擎在小程序端的按需编译漏洞 -->
    <view class="relative min-h-screen transition-colors duration-500 overflow-x-hidden max-w-[100vw]"
        :style="{ backgroundColor: isDark ? '#121212' : '#f0f2f5' }">

        <!-- 顶部浮顶 Header (吸顶 + 进度条) -->
        <view class="fixed top-0 left-0 w-full z-50 pointer-events-none" :style="{ paddingTop: statusBarHeight + 'px' }"
            v-if="!hideHeader">

            <view class="absolute inset-0 transition-opacity duration-300"
                :class="isScrolled ? 'backdrop-blur-md shadow-md opacity-100' : 'opacity-0'"
                :style="{ backgroundColor: isScrolled ? (isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)') : 'transparent' }">
            </view>

            <view
                class="relative h-[44px] flex items-center px-[32rpx] max-w-[75%] pointer-events-auto box-border w-full">
                <view v-if="!isEmbedMode"
                    class="p-[12rpx] -ml-[12rpx] active:scale-90 transition-all duration-300 rounded-full flex items-center justify-center"
                    :style="{ backgroundColor: !isScrolled ? 'rgba(0,0,0,0.3)' : 'transparent', backdropFilter: !isScrolled ? 'blur(4px)' : 'none' }"
                    @click="goBack">
                    <image src="/static/article/back.png" class="w-[36rpx] h-[36rpx] transition-all duration-300"
                        :class="[!isScrolled || isDark ? 'invert opacity-90' : 'opacity-70']" mode="aspectFit" />
                </view>
                <text
                    class="text-[30rpx] font-bold ml-[20rpx] flex-1 mb-[8rpx] truncate transition-opacity duration-300"
                    :class="isScrolled ? 'opacity-100' : 'opacity-0'"
                    :style="{ color: isDark ? '#e5e7eb' : '#1f2937' }">
                    {{ article?.title || '加载中...' }}
                </text>
            </view>

            <view class="absolute bottom-0 left-0 h-[4rpx] bg-[#42b983] transition-all duration-300 ease-out"
                :class="isScrolled ? 'opacity-100' : 'opacity-0'" :style="{ width: readProgress + '%' }"></view>
        </view>

        <!-- 加载骨架屏 -->
        <view v-if="isLoading" class="w-full h-screen flex flex-col pt-[30vh] items-center box-border">
            <view
                class="w-[80rpx] h-[80rpx] border-4 border-[#42b983] border-t-transparent rounded-full animate-spin mb-4">
            </view>
            <text class="text-[26rpx]" :style="{ color: isDark ? '#6b7280' : '#9ca3af' }">正在从时间裂缝中抽取文章...</text>
        </view>

        <!-- 正式内容区 -->
        <block v-else-if="article">
            <image class="absolute top-0 left-0 w-full h-[45vh] object-cover z-0" :src="coverUrl" mode="aspectFill" />
            <view class="absolute top-0 left-0 w-full h-[45vh] z-0"
                :style="{ background: isDark ? 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6), #121212)' : 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.1), #f0f2f5)' }">
            </view>

            <view class="article-container relative z-10 pt-[28vh] pb-[15rpx]">

                <!-- 文章标题与元数据卡片 -->
                <view
                    class="backdrop-blur-xl rounded-[32rpx] m-[32rpx] p-[40rpx] shadow-sm transition-colors duration-500 box-border border"
                    :style="{ backgroundColor: isDark ? 'rgba(30,30,30,0.85)' : 'rgba(255,255,255,0.85)', borderColor: isDark ? '#333333' : 'rgba(255,255,255,0.6)' }">
                    <text class="text-[44rpx] font-bold leading-snug block mb-[24rpx]"
                        :style="{ color: isDark ? '#f3f4f6' : '#1f2937' }">
                        {{ article.title }}
                    </text>

                    <view class="flex items-center flex-wrap gap-y-[16rpx]">
                        <view class="flex items-center mr-[32rpx]" v-if="article.date">
                            <image src="/static/home/calendar.png" class="w-[28rpx] h-[28rpx] mr-[12rpx] opacity-60"
                                :class="isDark ? 'invert' : ''" mode="aspectFit" />
                            <text class="text-[24rpx] font-medium" :style="{ color: isDark ? '#9ca3af' : '#6b7280' }">{{
                                formatDate(article.date)
                                }}</text>
                        </view>
                        <view v-if="article.categories && article.categories.length"
                            class="flex items-center mr-[24rpx]">
                            <view class="px-[16rpx] py-[4rpx] rounded-full border border-[#42b983]/30"
                                :style="{ backgroundColor: isDark ? 'rgba(66,185,131,0.2)' : 'rgba(66,185,131,0.1)' }">
                                <text class="text-[22rpx] line-clamp-1 text-[#42b983] font-bold">{{
                                    article.categories[0].name
                                }}</text>
                            </view>
                        </view>
                        <view class="flex items-center gap-[12rpx]">
                            <view v-for="(tag, index) in article.tags" :key="index"
                                class="px-[12rpx] py-[2rpx] rounded-[8rpx]"
                                :style="{ backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6' }">
                                <text class="text-[22rpx] line-clamp-1 text-gray-400"># {{ tag.name }}</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 富文本正文卡片 -->
                <view
                    class="rounded-[32rpx] p-[32rpx] pt-[12rpx] shadow-sm transition-colors duration-500 overflow-hidden box-border w-full border"
                    :style="{ backgroundColor: isDark ? '#1e1e1e' : 'rgba(255,255,255,0.95)', borderColor: isDark ? '#333333' : 'rgba(255,255,255,0.6)' }">
                    <mp-html ref="articleHtml" :key="isDark ? 'dark' : 'light'" :content="processedContent"
                        :tag-style="isDark ? markdownStylesDark : markdownStyles" domain="https://www.wled.top"
                        :selectable="true" :lazy-load="true" :use-anchor="navBarHeight" @linktap="handleLinkTap"
                        @ready="handleHtmlReady" />
                </view>
            </view>

            <!-- 悬浮操作按钮组 (绑定手势事件，并使用动态 left 计算实现左右平滑停靠) -->
            <view class="fixed bottom-[72rpx] flex flex-col items-center z-40"
                :style="{ left: isFabOnLeft ? '32rpx' : 'calc(100vw - 88rpx - 32rpx)', transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }"
                @touchstart="onFabTouchStart" @touchend="onFabTouchEnd">

                <!-- 展开的工具列表 (使用缩放、透明度和位移构成优雅弹出动画) -->
                <view
                    class="absolute bottom-full mb-[24rpx] flex flex-col gap-[24rpx] transition-all duration-300 origin-bottom"
                    :class="isFabExpanded ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-75 translate-y-[40rpx] pointer-events-none'">
                    <view class="tool-btn"
                        :style="{ backgroundColor: isDark ? '#2a2a2a' : 'rgba(255,255,255,0.9)', borderColor: isDark ? '#444444' : '#f3f4f6' }"
                        @click="handleFabAction(toggleTheme)">
                        <image :src="isDark ? '/static/article/theme-dark.png' : '/static/article/theme-light.png'"
                            class="w-[46rpx] h-[46rpx] opacity-80" mode="aspectFit" />
                    </view>
                    <view class="tool-btn"
                        :style="{ backgroundColor: isDark ? '#2a2a2a' : 'rgba(255,255,255,0.9)', borderColor: isDark ? '#444444' : '#f3f4f6' }"
                        @click="handleFabAction(() => showToc = true)" v-if="tocList.length > 0">
                        <image src="/static/article/toc.png" class="w-[46rpx] h-[46rpx] opacity-80"
                            :class="isDark ? 'invert' : ''" mode="aspectFit" />
                    </view>
                    <view class="tool-btn"
                        :style="{ backgroundColor: isDark ? '#2a2a2a' : 'rgba(255,255,255,0.9)', borderColor: isDark ? '#444444' : '#f3f4f6' }"
                        @click="handleFabAction(scrollToTop)">
                        <image src="/static/article/top.png" class="w-[46rpx] h-[46rpx] opacity-80"
                            :class="isDark ? 'invert' : ''" mode="aspectFit" />
                    </view>
                </view>

                <!-- 主控制按钮 (Setting / Close) -->
                <view class="tool-btn shadow-md"
                    :style="{ backgroundColor: isDark ? '#2a2a2a' : 'rgba(255,255,255,0.95)', borderColor: isDark ? '#444444' : '#e5e7eb' }"
                    @click="isFabExpanded = !isFabExpanded">
                    <image :src="isFabExpanded ? '/static/article/close.png' : '/static/article/setting.png'"
                        class="w-[46rpx] h-[46rpx] transition-transform duration-300"
                        :class="[isFabExpanded ? 'rotate-90' : 'rotate-0']" mode="aspectFit" />
                </view>
            </view>

            <!-- 文章目录 (TOC) 抽屉 -->
            <view class="fixed inset-0 z-50 transition-all duration-300"
                :class="showToc ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'">
                <view class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showToc = false"></view>
                <view
                    class="absolute bottom-0 left-0 w-full rounded-t-[40rpx] p-[40rpx] flex flex-col transition-transform duration-300 box-border"
                    :class="showToc ? 'translate-y-0' : 'translate-y-full'"
                    :style="{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', maxHeight: '75vh' }">
                    <view class="flex justify-between items-center mb-[24rpx]">
                        <text class="text-[36rpx] font-bold"
                            :style="{ color: isDark ? '#f3f4f6' : '#1f2937' }">文章大纲</text>
                        <view class="p-[10rpx] active:opacity-50" @click="showToc = false">
                            <text class="text-[28rpx] text-[#42b983]">关闭</text>
                        </view>
                    </view>
                    <scroll-view scroll-y="true" style="height: 55vh;" class="w-full">
                        <view v-for="(item, index) in tocList" :key="index"
                            class="py-[24rpx] border-b active:opacity-50 transition-opacity"
                            :style="{ paddingLeft: `${(item.level - 1) * 32}rpx`, borderColor: isDark ? '#333333' : '#f3f4f6' }"
                            @click="jumpToAnchor(item.id)">
                            <text class="text-[28rpx] line-clamp-1"
                                :style="{ color: isDark ? '#d1d5db' : '#4b5563' }">{{ item.text }}</text>
                        </view>
                        <view class="h-[40rpx]"></view>
                    </scroll-view>
                </view>
            </view>
        </block>
    </view>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad, onPageScroll } from '@dcloudio/uni-app'
import mpHtml from 'mp-html/dist/uni-app/components/mp-html/mp-html.vue'
import { blogApi } from '@/api/posts'
import type { ArticleDetail } from '@/api/types'

const props = defineProps({
    isEmbed: {
        type: Boolean,
        default: false
    },
    slug: {
        type: String,
        default: ''
    },
    isPageType: {
        type: Boolean,
        default: false
    },
    hideHeader: {
        type: Boolean,
        default: false
    }
})

// --- 状态与环境变量 ---
const article = ref<ArticleDetail | null>(null)
const isLoading = ref(true)
const isDark = ref(false)
const showToc = ref(false)
const tocList = ref<{ level: number, id: string, text: string }[]>([])
const processedContent = ref('')

const scrollTop = ref(0)
const readProgress = ref(0)
const contentHeight = ref(0)

const systemInfo = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync()
const statusBarHeight = ref(systemInfo.statusBarHeight || 20)
const navBarHeight = computed(() => statusBarHeight.value + 44)
const isScrolled = computed(() => scrollTop.value > 250)
const articleHtml = ref()

const isEmbedMode = computed(() => props.isEmbed)

// --- 悬浮按钮手势与折叠状态相关 ---
const isFabOnLeft = ref(false)
const isFabExpanded = ref(false) // 控制悬浮菜单展开收起
let fabTouchStartX = 0

// 处理悬浮菜单动作并自动收起
const handleFabAction = (action: Function) => {
    action()
    isFabExpanded.value = false
}

// 记录触摸起始位置
const onFabTouchStart = (e: any) => {
    if (e.changedTouches && e.changedTouches.length > 0) {
        fabTouchStartX = e.changedTouches[0].clientX
    }
}

// 触摸结束时判断偏移量
const onFabTouchEnd = (e: any) => {
    if (e.changedTouches && e.changedTouches.length > 0) {
        const touchEndX = e.changedTouches[0].clientX
        const diffX = touchEndX - fabTouchStartX

        // 设定触发滑动的阈值，防止误触 (40px)
        if (diffX > 40) {
            // 向右滑动，回到右侧停靠
            isFabOnLeft.value = false
            isFabExpanded.value = false // 滑动时同时收起菜单
        } else if (diffX < -40) {
            // 向左滑动，停靠在左侧
            isFabOnLeft.value = true
            isFabExpanded.value = false // 滑动时同时收起菜单
        }
    }
}

const pageMap: Record<string, string> = {
    'about': 'about-----',
    'sale': '----steam--------',
    'dozer-esports': '----dozer-esports--',
    'novel': '-----------',
    'ying-of-mc': 'ying-of-mc',
    'tags': 'tags',
    'categories': 'categories'
};

const sanitizeId = (id: string) => {
    let decoded = id;
    try { decoded = decodeURIComponent(id); } catch (e) { }
    return decoded.replace(/[^a-zA-Z0-9\-_]/g, '_');
}

// 提取代码高亮的核心 CSS
const getHighlightCss = (isDark: boolean) => `
<style>
  figure.highlight { display: none; } 
  .keyword, .built_in, .type, .literal, .meta { color: ${isDark ? '#c678dd' : '#d73a49'}; font-weight: bold; }
  .string, .symbol, .bullet, .addition { color: ${isDark ? '#98c379' : '#032f62'}; }
  .title, .section, .name, .function { color: ${isDark ? '#61afef' : '#6f42c1'}; font-weight: bold; }
  .comment, .quote { color: ${isDark ? '#5c6370' : '#6a737d'}; font-style: italic; }
  .number { color: ${isDark ? '#d19a66' : '#005cc5'}; }
  .attribute, .attr, .variable, .template-variable { color: ${isDark ? '#e5c07b' : '#22863a'}; }
</style>
`;

const getThemeColors = (cls: string, isDark: boolean) => {
    if (cls.includes('blue') || cls.includes('info')) return { hex: '#409eff', rgb: '64,158,255', text: '#409eff' };
    if (cls.includes('red') || cls.includes('danger') || cls.includes('error')) return { hex: '#f56c6c', rgb: '245,108,108', text: '#f56c6c' };
    if (cls.includes('yellow') || cls.includes('warning')) return { hex: '#e6a23c', rgb: '230,162,60', text: '#e6a23c' };
    if (cls.includes('green') || cls.includes('success')) return { hex: '#67c23a', rgb: '103,194,58', text: '#67c23a' };
    return { hex: '#42b983', rgb: '66,185,131', text: isDark ? '#42b983' : '#42b983' };
}

const processHexoContent = (html: string, isDark: boolean) => {
    if (!html) return '';
    let res = html;

    res = res.replace(/<h([1-6])([^>]*)id="([^"]+)"/ig, (match, level, attrs, id) => {
        return `<h${level}${attrs}id="anchor-${sanitizeId(id)}"`;
    });

    const tabMap: Record<string, string> = {};
    res = res.replace(/<button[^>]*data-tab="([^"]+)"[^>]*>([\s\S]*?)<\/button>/ig, (match, tabId, tabName) => {
        tabMap[tabId] = tabName.replace(/<[^>]+>/g, '').trim();
        return '';
    });
    res = res.replace(/<div([^>]*)class="([^"]*tab-pane[^"]*)"([^>]*)>/ig, (match, p1, p2, p3) => {
        let idMatch = match.match(/id="([^"]+)"/i);
        let id = idMatch ? idMatch[1] : null;
        let cleanTag = match.replace(/\bhidden(?:="[^"]*")?\b/gi, '');

        let titleStyle = `font-size: 30rpx; font-weight: bold; color: ${isDark ? '#e5e7eb' : '#374151'}; margin: 40rpx 0 16rpx 0; padding-bottom: 12rpx; border-bottom: 2rpx solid rgba(66,185,131,${isDark ? '0.1' : '0.2'}); display: flex; align-items: center;`;
        let indicatorStyle = `width: 8rpx; height: 28rpx; background: #42b983; border-radius: 4rpx; margin-right: 16rpx; display: inline-block;`;

        let title = (id && tabMap[id]) ? `<div style="${titleStyle}"><span style="${indicatorStyle}"></span>${tabMap[id]}</div>` : '';
        return cleanTag + title;
    });

    res = res.replace(/<details([^>]*)>(\s*)<summary[^>]*>([\s\S]*?)<\/summary>/ig, (m, attrs, space, summaryContent) => {
        let clsMatch = attrs.match(/class="([^"]*)"/i);
        let theme = getThemeColors(clsMatch ? clsMatch[1] : '', isDark);
        let cleanAttrs = attrs.replace(/class="[^"]*"/i, '');
        let cleanSummary = summaryContent.replace(/<i[^>]*>.*?<\/i>/ig, '').trim();

        let detailsStyle = `border-radius: 16rpx; margin: 32rpx 0;padding: 16rpx; overflow: hidden; display: block; border: 1px solid rgba(${theme.rgb},${isDark ? '0.15' : '0.2'}); background: rgba(${theme.rgb},${isDark ? '0.05' : '0.02'});`;
        let summaryStyle = `font-weight: 700; color: ${theme.text}; padding: 12rpx; display: block; cursor: pointer; background: rgba(${theme.rgb},${isDark ? '0.1' : '0'}); border-bottom: 1px solid rgba(${theme.rgb}, 0.1); font-size: 30rpx;`;

        return `<details style="${detailsStyle}" ${cleanAttrs}>${space}<summary style="${summaryStyle}">${cleanSummary}</summary>`;
    });

    res = res.replace(/<div([^>]*)class="([^"]*)(note|tip|info|warning|danger|error|success|blue|red|yellow|green)([^"]*)"([^>]*)>/ig, (m, p1, c1, type, c2, p5) => {
        let theme = getThemeColors(c1 + type + c2, isDark);
        let hintStyle = `padding: 24rpx 32rpx; margin: 32rpx 0; border-radius: 12rpx; border-left: 8rpx solid ${theme.hex}; background: rgba(${theme.rgb},${isDark ? '0.08' : '0.05'}); display: block; font-size: 28rpx; color: ${isDark ? '#e5e7eb' : '#374151'};`;
        return `<div${p1} style="${hintStyle}"${p5}>`;
    });

    res = res.replace(/<figure[^>]*class="[^"]*highlight[^"]*"[^>]*>([\s\S]*?)<\/figure>/ig, (match, innerHtml) => {
        let newInner = innerHtml.replace(/<td[^>]*class="[^"]*gutter[^"]*"[^>]*>[\s\S]*?<\/td>/ig, '');
        newInner = newInner.replace(/<td[^>]*class="[^"]*code[^"]*"[^>]*>/ig, '<td style="padding: 24rpx; border: none; width: 100%; box-sizing: border-box;">');
        newInner = newInner.replace(/<table[^>]*>/ig, '<table style="width: 100%; min-width: 100%; border-collapse: collapse; border: none; margin: 0; box-sizing: border-box;">');

        let blockStyle = `overflow-x: auto; max-width: 100%; margin: 32rpx 0; border-radius: 16rpx; background-color: ${isDark ? '#282c34' : '#f6f8fa'}; color: ${isDark ? '#abb2bf' : '#24292e'}; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.06); -webkit-overflow-scrolling: touch; box-sizing: border-box;`;
        return `<div style="${blockStyle}">${newInner}</div>`;
    });

    // --- 修复重点：强制剥离懒加载防线，还原真实图片 URL (补充 TS 类型定义) ---
    res = res.replace(/<img([^>]*)>/ig, (match: string, attrs: string) => {
        let newAttrs = attrs;

        // 查找隐藏在自定义属性中的真实图片路径 (Hexo 常用懒加载插件特性)
        const dataSrcMatch = newAttrs.match(/data-(?:lazy-)?src="([^"]+)"/i) || newAttrs.match(/data-original="([^"]+)"/i);
        let realSrc = '';

        if (dataSrcMatch) {
            realSrc = dataSrcMatch[1];
        } else {
            const srcMatch = newAttrs.match(/src="([^"]+)"/i);
            if (srcMatch) realSrc = srcMatch[1];
        }

        if (realSrc) {
            // 如果是绝对域名，原样保留；如果是相对路径，强行绑定主域名
            if (realSrc.startsWith('/')) {
                realSrc = 'https://www.wled.top' + realSrc;
            }

            // 覆盖替换原本可能有问题的 src 属性
            if (/src="[^"]*"/i.test(newAttrs)) {
                newAttrs = newAttrs.replace(/src="[^"]*"/i, `src="${realSrc}"`);
            } else {
                newAttrs += ` src="${realSrc}"`;
            }
        }

        // 抹除 lazyload class 防止与 mp-html 的加载机制产生冲突 (补充 TS 类型定义)
        newAttrs = newAttrs.replace(/class="([^"]*)"/i, (m: string, cls: string) => {
            return `class="${cls.replace(/lazyload/ig, '').trim()}"`;
        });

        return `<img${newAttrs}>`;
    });

    return res;
}

const markdownStyles = {
    h1: 'font-size: 42rpx; font-weight: 800; margin: 50rpx 0 24rpx 0; color: #1f2937;',
    h2: 'font-size: 38rpx; font-weight: 700; margin: 48rpx 0 24rpx 0; color: #1f2937; padding-bottom: 16rpx; border-bottom: 1px solid #f3f4f6;',
    h3: 'font-size: 34rpx; font-weight: 700; margin: 36rpx 0 20rpx 0; color: #374151;',
    h4: 'font-size: 32rpx; font-weight: 700; margin: 32rpx 0 16rpx 0; color: #374151;',
    h5: 'font-size: 30rpx; font-weight: 700; margin: 28rpx 0 12rpx 0; color: #374151;',
    p: 'font-size: 30rpx; line-height: 1.8; color: #4b5563; margin-bottom: 32rpx; word-wrap: break-word;',
    blockquote: 'border-left: 8rpx solid #42b983; padding: 24rpx 32rpx; color: #6b7280; background-color: rgba(66, 185, 131, 0.05); border-radius: 8rpx; margin: 32rpx 0; font-size: 28rpx;',
    ul: 'padding-left: 40rpx; margin-bottom: 32rpx; color: #4b5563; font-size: 30rpx; line-height: 1.8;',
    ol: 'padding-left: 40rpx; margin-bottom: 32rpx; color: #4b5563; font-size: 30rpx; line-height: 1.8;',
    li: 'margin-bottom: 12rpx;',
    code: 'background-color: #f3f4f6; padding: 4rpx 12rpx; border-radius: 6rpx; color: #e96900; font-family: Consolas, Monaco, monospace; font-size: 26rpx; word-break: break-all;',
    a: 'color: #42b983; text-decoration: none; border-bottom: 1px dashed rgba(66, 185, 131, 0.5); padding-bottom: 2rpx;',
    img: 'max-width: 100%; border-radius: 16rpx; margin: 16rpx 0; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08); display: block;',
    table: 'width: 100%; overflow-x: auto; display: block; border-collapse: collapse; margin: 32rpx 0; white-space: nowrap;',
    th: 'border: 1px solid #e5e7eb; padding: 16rpx 24rpx; background-color: #f9fafb; font-weight: 600; color: #374151;',
    td: 'border: 1px solid #e5e7eb; padding: 16rpx 24rpx; color: #4b5563;'
}

const markdownStylesDark = {
    h1: 'font-size: 42rpx; font-weight: 800; margin: 50rpx 0 24rpx 0; color: #f3f4f6;',
    h2: 'font-size: 38rpx; font-weight: 700; margin: 48rpx 0 24rpx 0; color: #f3f4f6; padding-bottom: 16rpx; border-bottom: 1px solid #333;',
    h3: 'font-size: 34rpx; font-weight: 700; margin: 36rpx 0 20rpx 0; color: #e5e7eb;',
    h4: 'font-size: 32rpx; font-weight: 700; margin: 32rpx 0 16rpx 0; color: #e5e7eb;',
    h5: 'font-size: 30rpx; font-weight: 700; margin: 28rpx 0 12rpx 0; color: #e5e7eb;',
    p: 'font-size: 30rpx; line-height: 1.8; color: #9ca3af; margin-bottom: 32rpx; word-wrap: break-word;',
    blockquote: 'border-left: 8rpx solid #42b983; padding: 24rpx 32rpx; color: #9ca3af; background-color: rgba(66, 185, 131, 0.1); border-radius: 8rpx; margin: 32rpx 0; font-size: 28rpx;',
    ul: 'padding-left: 40rpx; margin-bottom: 32rpx; color: #9ca3af; font-size: 30rpx; line-height: 1.8;',
    ol: 'padding-left: 40rpx; margin-bottom: 32rpx; color: #9ca3af; font-size: 30rpx; line-height: 1.8;',
    li: 'margin-bottom: 12rpx;',
    code: 'background-color: #2a2a2a; padding: 4rpx 12rpx; border-radius: 6rpx; color: #f59e0b; font-family: Consolas, Monaco, monospace; font-size: 26rpx; word-break: break-all;',
    a: 'color: #42b983; text-decoration: none; border-bottom: 1px dashed rgba(66, 185, 131, 0.5); padding-bottom: 2rpx;',
    img: 'max-width: 100%; border-radius: 16rpx; margin: 16rpx 0; opacity: 0.9; display: block;',
    table: 'width: 100%; overflow-x: auto; display: block; border-collapse: collapse; margin: 32rpx 0; white-space: nowrap;',
    th: 'border: 1px solid #333; padding: 16rpx 24rpx; background-color: #2a2a2a; font-weight: 600; color: #e5e7eb;',
    td: 'border: 1px solid #333; padding: 16rpx 24rpx; color: #9ca3af;'
}

// --- 逻辑与生命周期 ---
const loadArticle = async (slug: string, isPage: boolean) => {
    if (!slug) {
        isLoading.value = false
        return
    }
    isLoading.value = true
    try {
        const res = isPage
            ? await blogApi.getIsolatedPageDetail(slug)
            : await blogApi.getArticleDetail(slug)

        article.value = res
        const cleanContent = processHexoContent(res.content, isDark.value)
        processedContent.value = getHighlightCss(isDark.value) + cleanContent
        extractTOC(cleanContent)
    } catch (error) {
        console.error('获取详情失败:', error)
    } finally {
        isLoading.value = false
    }
}

onLoad((options) => {
    if (props.isEmbed) return
    const slug = options?.slug as string
    const isPage = options?.type === 'page'
    if (slug) {
        loadArticle(slug, isPage)
    } else {
        isLoading.value = false
    }
})

onMounted(() => {
    if (!props.isEmbed) return
    const targetSlug = pageMap[props.slug] || props.slug
    const isPage = props.isPageType
    if (!article.value) {
        loadArticle(targetSlug, isPage)
    }
})

onPageScroll((e) => {
    scrollTop.value = e.scrollTop
    if (contentHeight.value > 0) {
        const maxScroll = contentHeight.value - systemInfo.windowHeight
        if (maxScroll > 0) {
            let progress = (e.scrollTop / maxScroll) * 100
            readProgress.value = Math.min(Math.max(progress, 0), 100)
        }
    }
})

const handleHtmlReady = () => {
    uni.createSelectorQuery().select('.article-container').boundingClientRect((rect: any) => {
        if (rect) {
            const data = Array.isArray(rect) ? rect[0] : rect
            contentHeight.value = data?.height || 0
        }
    }).exec()
}

// --- 工具函数与交互逻辑 ---
const coverUrl = computed(() => {
    if (article.value?.cover) {
        const cv = article.value.cover
        return cv.startsWith('http') ? cv : `https://www.wled.top${cv}`
    }
    return 'https://www.wled.top/images/wallhaven-wqery6-light.webp'
})

const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const toggleTheme = () => {
    isDark.value = !isDark.value
    if (article.value) {
        const cleanContent = processHexoContent(article.value.content, isDark.value)
        processedContent.value = getHighlightCss(isDark.value) + cleanContent
    }

    // 附加优化：动态修改微信小程序的原生页面背景色
    const bgColor = isDark.value ? '#121212' : '#f0f2f5'

    // 增加跨端兼容性判断：只有在当前环境支持该 API（如微信小程序）时才调用，H5 环境下安全忽略
    if (typeof uni.setBackgroundColor === 'function') {
        uni.setBackgroundColor({
            backgroundColor: bgColor,
            backgroundColorBottom: bgColor,
            backgroundColorTop: bgColor
        }).catch(() => { }) // 捕获个别低版本基础库可能发生的 Promise 异常
    }
}

const scrollToTop = () => uni.pageScrollTo({ scrollTop: 0, duration: 300 })

const goBack = () => {
    const pages = getCurrentPages()
    if (pages.length === 1) {
        uni.switchTab({ url: '/pages/index/index' })
    } else {
        uni.navigateBack()
    }
}

const extractTOC = (html: string) => {
    const regex = /<h([1-6])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h\1>/g
    let match
    const list = []
    while ((match = regex.exec(html)) !== null) {
        const text = match[3].replace(/<[^>]+>/g, '').trim()
        list.push({ level: parseInt(match[1], 10), id: match[2], text })
    }
    tocList.value = list
}

const jumpToAnchor = (id: string) => {
    showToc.value = false
    if (articleHtml.value) {
        articleHtml.value.navigateTo(id, -navBarHeight.value - 12)
    }
}

// --- 修复重点：重写网络路由拦截系统 ---
const handleLinkTap = (e: any) => {
    let href = e.href
    if (!href) return

    if (href.startsWith('#')) {
        let rawId = href.substring(1)
        if (rawId.startsWith('anchor-')) {
            rawId = rawId.substring(7)
        }
        let safeId = 'anchor-' + sanitizeId(rawId)
        jumpToAnchor(safeId)
        return
    }

    // 1. 路径预处理：如果是相对路径或包含 ..，先进行简单清洗
    if (href.startsWith('./')) href = href.substring(2);
    if (href.startsWith('../')) {
        // 简单处理跨级路径，如果是纯相对的，直接移除 .. 以确保解析不出错
        href = href.replace(/\.\.\//g, '');
    }

    // 2. 格式化并保证能正常解析 URL
    let urlStr = href;
    if (urlStr.startsWith('//')) {
        urlStr = 'https:' + urlStr;
    } else if (urlStr.startsWith('www.') || urlStr.startsWith('mirror.')) {
        urlStr = 'https://' + urlStr;
    } else if (urlStr.startsWith('/')) {
        urlStr = 'https://www.wled.top' + urlStr;
    } else if (!urlStr.startsWith('http')) {
        urlStr = 'https://www.wled.top/' + urlStr;
    }

    // 3. 安全解析
    let urlObj;
    try {
        urlObj = new URL(urlStr);
    } catch (err) {
        // 如果依然失败，尝试作为相对路径进行降级处理
        console.error('URL解析失败，尝试降级:', urlStr);
        // 这里手动将无效的 urlStr 强制拆解，避免小程序 URL 构造器崩溃
        const pathOnly = urlStr.replace('https://www.wled.top', '').replace('https://mirror.wled.top', '');
        handleInternalPath(pathOnly);
        return;
    }

    const isInternal = urlObj.hostname === 'www.wled.top' || urlObj.hostname === 'mirror.wled.top';
    if (!isInternal) {
        uni.setClipboardData({
            data: href,
            success: () => uni.showToast({ title: '外链已复制', icon: 'none' })
        })
        return;
    }

    handleInternalPath(urlObj.pathname);
}

// 提取内部路由处理逻辑，统一逻辑入口
const handleInternalPath = (pathname: string) => {
    // 核心修复：彻底剔除降级传入的 hash（#）和 query（?），防止污染 slug 导致 API 请求截断 404
    pathname = pathname.split('#')[0].split('?')[0];

    if (pathname === '/' || pathname === '') {
        uni.switchTab({ url: '/pages/index/index' });
        return;
    }

    const parts = pathname.split('/').filter(Boolean);


    const firstPath = parts[0]?.toLowerCase();
    let slug = parts[parts.length - 1]?.toLowerCase() || '';
    slug = slug.replace(/\.html$/, '');

    if (pageMap[firstPath]) {
        uni.navigateTo({ url: `/pages/article/detail?type=page&slug=${pageMap[firstPath]}` });
    } else if (pageMap[slug]) {
        uni.navigateTo({ url: `/pages/article/detail?type=page&slug=${pageMap[slug]}` });
    } else {
        const originalSlug = parts[parts.length - 1]?.replace(/\.html$/, '') || '';
        if (originalSlug) {
            uni.navigateTo({ url: `/pages/article/detail?slug=${originalSlug}` });
        }
    }
}
</script>

<style scoped>
::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
}

.tool-btn {
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    backdrop-filter: blur(12px);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
    border-width: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.tool-btn:active {
    transform: scale(0.9);
}
</style>