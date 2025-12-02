import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
    plugins: [react()],
    // IMPORTANT: Replace 'ui-to-prd' with your actual GitHub repository name
    // If your repo is named 'my-tool', this should be '/my-tool/'
    base: '/ui-to-prd/', 
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
  }
})