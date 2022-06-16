import {defineConfig} from 'vite'
import {resolve} from 'path'
export default defineConfig({
    test:{},
    build: {
        outDir: resolve(__dirname,'extension'),
        emptyOutDir: true,
        terserOptions: {
          mangle: false,
        },
        rollupOptions: {
          input: {
            background: resolve(__dirname,'src/background/index.ts'),
            options: resolve(__dirname,'src/options/index.html'),
            optionsJs: resolve(__dirname,'src/options/index.ts'),
            contentJs: resolve(__dirname,'src/content/index.ts'),
          },
          output: {
            entryFileNames:(chunk) => {
                return `js/${chunk.name}.js`
            }
          },
        },
    },
})
