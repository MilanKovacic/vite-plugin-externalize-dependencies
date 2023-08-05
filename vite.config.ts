import { resolve } from 'path'
import { defineConfig } from 'vite'
import externalize from './src/index'
import dts from 'vite-plugin-dts'

const disablePlugin = process.env.DISABLE_PLUGIN === 'true';

export default defineConfig({
    plugins: disablePlugin ? [] : [
        externalize({ externals: ["customLogger"] }), dts()
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['es', 'cjs'],
            fileName: "index"
        }
    },
})