import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-16x16.svg', 'favicon-32x32.svg', 'icon-128x128.svg', 'icon-256x256.svg', 'logo.svg'],
      manifest: {
        name: 'ふらのみ - 近くのお店の空き状況を確認',
        short_name: 'ふらのみ',
        description: '居酒屋・カフェ・レストランの空き状況をリアルタイムで確認できます',
        theme_color: '#3B82F6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        start_url: '/user',
        scope: '/',
        icons: [
          {
            src: '/icon-128x128.svg',
            sizes: '128x128',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/icon-256x256.svg',
            sizes: '256x256',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: '店舗検索',
            short_name: '検索',
            description: '近くのお店を検索',
            url: '/user',
            icons: [
              {
                src: '/icon-128x128.svg',
                sizes: '128x128'
              }
            ]
          },
          {
            name: '店舗管理',
            short_name: '管理',
            description: '店舗管理画面',
            url: '/shop-manager',
            icons: [
              {
                src: '/icon-128x128.svg',
                sizes: '128x128'
              }
            ]
          }
        ],
        categories: ['food', 'lifestyle', 'utilities']
      },
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        // プッシュ通知機能に焦点を当てるため、プリキャッシュは最小限に
        // アイコンなどの静的アセットのみプリキャッシュ
        globPatterns: ['**/*.{ico,png,svg,jpg,jpeg,webp}'],
        // JS/CSS/HTMLファイルはプリキャッシュから除外（常にネットワークから取得）
        globIgnores: ['**/*.{js,css,html,woff,woff2}'],
      },
      // 開発環境でもService Workerを有効化
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        // manualChunksを無効化して、Viteのデフォルトのチャンク分割を使用
        // これにより、React依存の問題を回避
        // manualChunks: undefined,
      },
    },
    assetsDir: 'assets',
    copyPublicDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        // React error #300デバッグのため、一時的にconsole.logを残す
        drop_console: false,
        drop_debugger: true,
      },
    },
  },
  server: {
    fs: {
      strict: false,
    },
  },
  publicDir: 'public',
})
