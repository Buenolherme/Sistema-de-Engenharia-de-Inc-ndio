import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-expect-error server API is plain ESM used only by Vite/Node.
import { handleApiRequest, serveUploadRequest } from './server/api.js';

function localApiPlugin() {
  return {
    name: 'izcode-local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          if (await handleApiRequest(req, res)) return;
          if (await serveUploadRequest(req, res)) return;
          next();
        } catch (error) {
          console.error(error);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end('Erro interno do servidor.');
          }
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [localApiPlugin(), react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
