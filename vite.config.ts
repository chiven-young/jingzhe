import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

let options = {
  base: '/apps/rainwater/',
  build: {
    outDir: 'rainwater',
  },
  server: {
    port: 3004,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
      '@com': path.resolve(__dirname, './src/components/'),
      // 为 worker-loader 设置别名
      'worker-loader': path.resolve(__dirname, 'worker-loader/dist/index.esm.js')
    },
  },
  plugins: [
    vue(),
  ],
  define: {
    global: {}
  },
  clearScreen: false, // 设置为 false 可以避免控制台输出日志
}

export default defineConfig(({ command, mode }) => {
  console.log(`========= mode ${mode} ========= 命令 ${command}=======`);
  if (mode === 'sit' || mode === 'production' || mode === 'development') {
    // options.base = '/apps/rainwater/';
    // options.build.outDir = 'rainwater';
    options.base = '/';
    options.build.outDir = 'dist';
    return options;
  } else {
    return options;
  }
});