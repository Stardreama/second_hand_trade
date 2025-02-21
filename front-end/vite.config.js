import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: 'localhost',
    port: 5173, // 可以根据需要修改端口
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 后端服务地址
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src' // 设置路径别名，方便导入组件和资源
    }
  },
  build: {
    outDir: 'dist', // 指定构建输出目录
    sourcemap: true, // 生成 source map 方便调试
  }
});
