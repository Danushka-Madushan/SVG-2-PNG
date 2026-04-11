/* 
  Why this file exisis in this project 
  https://vitejs.dev/guide/static-deploy.html#github-pages
*/


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
 plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/SVG-2-PNG'
})
