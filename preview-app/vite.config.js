import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-local-data',
      configureServer(server) {
        server.middlewares.use('/local-data', (req, res, next) => {
          const filePath = path.join(__dirname, '..', req.url);
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/json');
            res.end(fs.readFileSync(filePath));
          } else {
            next();
          }
        });
      }
    }
  ],
})
