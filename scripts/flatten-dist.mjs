// Vite emite el HTML de cada actividad respetando su ruta de origen
// (src/actividades/x.html -> dist/src/actividades/x.html), pero la
// plataforma espera cada archivo plano en la raíz de lo que se sube
// (x.html), al lado de css/, img/ y fonts/.
//
// Dos cosas dependen de esa ubicación anidada y quedan mal al mover el
// archivo si no se corrigen:
//   1. Los <link> a los CSS de public/: Vite los emite como "../../css/..."
//      porque calcula la ruta relativa desde la ubicación ANIDADA
//      original, no desde la plana final.
//   2. Las rutas de imagen armadas en JS en tiempo de ejecución
//      (ej. '/img/foo.png') que se dejaron como absolutas ("/img/...")
//      para que funcionaran en dev (donde el HTML vive anidado en
//      /src/actividades/ pero public/ siempre se sirve en la raíz). Una
//      ruta absoluta con "/" al inicio se rompe tanto si el archivo se
//      abre con doble clic (file://) como si la plataforma lo sube a una
//      subcarpeta en vez de la raíz del dominio.
//
// Este script corrige ambos casos convirtiéndolos a rutas relativas planas
// (css/..., img/..., fonts/...) que funcionan sin importar dónde se abra
// el archivo final: doble clic, servidor en la raíz, o subcarpeta.
import { readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = 'dist';
const nestedDir = join(distDir, 'src', 'actividades');

const ABSOLUTE_OR_NESTED = /(["'`])(?:\.\.\/\.\.\/|\/)((?:css|img|fonts)\/)/g;

for (const file of readdirSync(nestedDir)) {
  const from = join(nestedDir, file);
  const to = join(distDir, file);
  renameSync(from, to);

  if (file.endsWith('.html')) {
    const original = readFileSync(to, 'utf8');
    const fixed = original.replace(ABSOLUTE_OR_NESTED, '$1$2');
    if (fixed !== original) writeFileSync(to, fixed);
  }

  console.log('dist/src/actividades/' + file, '->', 'dist/' + file);
}

rmSync(join(distDir, 'src'), { recursive: true, force: true });
