// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    base: './',
    root: resolve(__dirname, 'src'),
    build: {
        outDir: '../dist',
        assetsDir: 'assets'
    },
    server: { port: 8080 },
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['import','mixed-decls','color-functions','global-builtin']
            }
        }
    }
})
