/* 
  Why this file exisis in this project 
  https://vitejs.dev/guide/static-deploy.html#github-pages
*/


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/SVG-2-PNG'
})
