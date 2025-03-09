import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import jsconfigPaths from "vite-jsconfig-paths";
import path from "path";



// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
    jsconfigPaths()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },    
})
