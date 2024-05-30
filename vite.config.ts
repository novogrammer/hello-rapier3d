import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  base: "/hello-rapier3d/",
  plugins: [wasm()],
});