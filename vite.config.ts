import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import tailwindcss from '@tailwindcss/vite';
import { getEntries } from './scripts/entradas.mjs';

export default defineConfig(() => {
  // `npm run dev` sirve todo el proyecto normal (todas las actividades a
  // la vez, cada una en su propia URL). `npm run build` en cambio corre
  // este config una vez POR actividad (ver scripts/build.mjs) porque
  // vite-plugin-singlefile no soporta varias entradas en una sola pasada
  // — cada build solo conoce la entrada indicada por PAGE_ENTRY.
  const nombre = process.env.PAGE_ENTRY;
  if (!nombre) {
    return { plugins: [tailwindcss()] };
  }

  const entries = getEntries();
  const entrada = entries[nombre];
  if (!entrada) {
    throw new Error(`PAGE_ENTRY="${nombre}" no coincide con ninguna actividad en src/actividades/.`);
  }

  return {
    base: './',
    plugins: [tailwindcss(), viteSingleFile()],
    build: {
      outDir: 'dist',
      emptyOutDir: process.env.PAGE_EMPTY_OUTDIR === '1',
      rollupOptions: {
        input: { [nombre]: entrada },
      },
    },
  };
});
