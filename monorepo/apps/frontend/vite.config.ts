import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons-ng'
import { visualizer } from 'rollup-plugin-visualizer'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(mode => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    root: dirname,

    publicDir: 'public',

    plugins: [
      vue({}),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src')],
        symbolId: 'icon-[name]',
        inject: 'body-last',
      }),
      // visualizer({ open: true, filename: 'dist/stats.html' }),
    ].filter(Boolean),

    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },

    server: { port: Number(env.VITE_FRONTEND_DEV_PORT) || 9000, open: false },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
        },
        treeshake: true,

        assetFileNames: (assetInfo: { name: any }) => {
          const { name } = assetInfo
          const ext = name.split('.').pop()

          const typeMap = {
            // Шрифты
            woff: 'fonts/[name][extname]',
            woff2: 'fonts/[name][extname]',
            ttf: 'fonts/[name][extname]',
            otf: 'fonts/[name][extname]',
            eot: 'fonts/[name][extname]',

            // Изображения
            png: 'img/[name].[hash:8][extname]',
            jpg: 'img/[name].[hash:8][extname]',
            jpeg: 'img/[name].[hash:8][extname]',
            gif: 'img/[name].[hash:8][extname]',
            svg: 'img/[name].[hash:8][extname]',
            webp: 'img/[name].[hash:8][extname]',

            // Медиа
            mp4: 'media/[name].[hash:8][extname]',
            webm: 'media/[name].[hash:8][extname]',
            mp3: 'media/[name].[hash:8][extname]',

            // Стили
            css: 'css/[name].[hash:8][extname]',
          }

          return typeMap[ext] || 'assets/[name].[hash:8][extname]'
        },
      },
      chunkSizeWarningLimit: 1024,
    },
    css: { devSourcemap: true },
    logLevel: 'info',
  }
})
