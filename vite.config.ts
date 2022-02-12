import { resolve } from "path"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { chromeExtension } from "vite-plugin-chrome-extension"
import pug from "vite-plugin-pug"
import zip from 'rollup-plugin-zip'

import Components from "unplugin-vue-components/vite"
import {
  AntDesignVueResolver,
  ElementPlusResolver,
  NaiveUiResolver,
} from "unplugin-vue-components/resolvers"

export default defineConfig({
    build: {
        rollupOptions: {
            input: "src/manifest.json"
        }
    },
    plugins: [
        pug(),
        vue(),
        Components({
            dirs: ['./', './components','src/components'],
            directoryAsNamespace: true,
            resolvers: [
              AntDesignVueResolver({
                resolveIcons: true,
              }),
              ElementPlusResolver({
                importStyle: "css",
              }),
              NaiveUiResolver()
            ]
          }),
        chromeExtension(),
        zip({dir: 'releases'})
    ],
    css: {
      preprocessorOptions: {
        sass: {
          charset: false,
          additionalData: `@import @/assets/global.sass\n`
        }
      }
    },
    resolve: {
        alias: [
            {
                find: "@",
                replacement: resolve(__dirname, "src"),
            }
        ]
    },
})