import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Strona www: statyczne strony HTML bez JS (Vite tylko składa CSS, fonty i podmienia %VITE_*%).
const frontendDir = fileURLToPath(new URL('.', import.meta.url));
const page = (name: string) => fileURLToPath(new URL(`./www/${name}.html`, import.meta.url));

export default defineConfig({
  root: 'www',
  envDir: frontendDir,
  server: { port: 5174, strictPort: true },
  preview: { port: 4174, strictPort: true },
  build: {
    outDir: '../dist/www',
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        index: page('index'),
        regulamin: page('regulamin'),
        'polityka-prywatnosci': page('polityka-prywatnosci'),
      },
    },
  },
});
