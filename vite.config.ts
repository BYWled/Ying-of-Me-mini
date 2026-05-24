import { defineConfig } from "vite";
import uniPlugin from "@dcloudio/vite-plugin-uni";
import UnoCSS from "unocss/vite";

// 引入 UnoCSS 相关的预设和转换器
import presetWeapp from "unocss-preset-weapp";
import { transformerClass } from "unocss-preset-weapp/transformer";

// 兼容 CommonJS 和 ES 模块的导入方式
const uni = (uniPlugin as any).default || uniPlugin;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
    UnoCSS({
      // 强制管道扫描 .vue 文件
      content: {
        pipeline: {
          include: [/\.([jt]sx|vue|html)($|\?)/],
        },
      },
      presets: [
        // 使用小程序专用的预设
        presetWeapp(),
      ],
      transformers: [
        // 转换类名，将 w-1/2 转换为 w-1_2，避免小程序报错
        transformerClass(),
      ],
      theme: {
        colors: {
          primary: "#42b983", // 博客主题色（薄荷绿）
          glass: "rgba(255, 255, 255, 0.6)", // 预设毛玻璃背景色
        },
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "https://www.wled.top", // 后端 API 地址
        changeOrigin: true,
      },
    },
  },
});
