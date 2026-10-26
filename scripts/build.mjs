import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getEntries } from './entradas.mjs';

const viteBin = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));

// `node scripts/build.mjs 2` compila solo la unidad 2 (uni2_*). Todo lo que
// no empieza por uniN_ con N de 1 a 9 (ej. uni0_tem0_diagnostica) entra en
// cualquier build por unidad.
const unidad = process.argv[2];
const entries = getEntries();
const nombres = Object.keys(entries).filter(
  (n) => !unidad || n.startsWith(`uni${unidad}_`) || !/^uni[1-9]_/.test(n),
);

if (nombres.length === 0) {
  console.error(`No se encontró ninguna actividad${unidad ? ` de la unidad ${unidad}` : ''} en src/actividades/.`);
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
