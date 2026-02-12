import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  assetsInclude: ['**/*.fbx'],
  server: {
    port: 3310,
  },
})
