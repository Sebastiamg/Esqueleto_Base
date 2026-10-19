import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const actividadesDir = path.join(root, 'src', 'actividades');

/**
 * Descubre una entrada de build por cada .html en src/actividades/.
 * vite-plugin-singlefile no soporta varias entradas en una sola pasada de
 * Rollup (inlinea todo en un único archivo, lo que exige un solo output),
 * así que scripts/build.mjs invoca "vite build" una vez por cada una de
 * estas entradas.
 */
export function getEntries() {
  const entries = {};
  for (const file of readdirSync(actividadesDir)) {
    if (file.endsWith('.html')) {
      entries[file.replace(/\.html$/, '')] = path.join('src', 'actividades', file);
    }
  }
  return entries;
}
