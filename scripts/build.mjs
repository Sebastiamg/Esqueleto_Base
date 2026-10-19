import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getEntries } from './entradas.mjs';

const viteBin = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));

const entries = getEntries();
const nombres = Object.keys(entries);

if (nombres.length === 0) {
  console.error('No se encontró ninguna actividad en src/actividades/.');
  process.exit(1);
}

nombres.forEach((nombre, i) => {
  console.log(`\n▸ Compilando "${nombre}"...`);
  execFileSync(process.execPath, [viteBin, 'build'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PAGE_ENTRY: nombre,
      PAGE_EMPTY_OUTDIR: i === 0 ? '1' : '0',
    },
  });
});

console.log(`\n✓ Listo: ${nombres.length} actividad(es) compiladas en dist/`);
