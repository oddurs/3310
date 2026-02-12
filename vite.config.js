import { defineConfig } from 'vite'

export default defineConfig({
  base: '/3310/',
  assetsInclude: ['**/*.fbx'],
  server: {
    port: 3310,
  },
})
