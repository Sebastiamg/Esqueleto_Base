import { iconoAlumno } from './icons';

export interface EncabezadoConfig {
  unidad: string | number;
  tema: string;
  pagina: string | number;
  /**
   * Ruta de una imagen para el badge de unidad (ej. "/img/ico_unidad1.png"),
   * para cuando el libro trae un recorte ilustrado en vez de solo texto. Es
   * opcional y se prueba en tiempo de ejecución: si la imagen carga bien,
   * reemplaza por completo la píldora "Unidad N"; si no existe todavía
   * (404), se deja el texto tal cual, sin romper nada.
   */
  imagenUnidad?: string;
  /**
   * Ancho (en px) de `imagenUnidad`, por si el recorte necesita verse más
   * grande o más pequeño que el tamaño por defecto (110px / 150px en
   * escritorio). `movil` aplica siempre; `desktop` aplica desde el
   * breakpoint @sm del contenedor y, si no se indica, usa el valor de
   * `movil`.
   */
  anchoImagenUnidad?: { movil: number; desktop?: number };
}

export interface Encabezado {
  /** Escribe la nota final (0-10) en el encabezado, ej. tras calificar. */
  mostrarNota(sobreDiez: number): void;
  /** Inserta la etiqueta "Alumno: <nombre>" dentro de la misma franja del encabezado. */
  mostrarAlumno(nombre: string): void;
}

/**
 * Arma el encabezado de la actividad: franja con color propio (degradado +
 * borde inferior) que la distingue claramente del resto de la página, con
 * "Pág" y "Nota" apiladas como píldoras a la derecha (Pág arriba, Nota
 * abajo) y espacio para el nombre del estudiante dentro de la misma franja
 * una vez que se califica.
 *
 * El layout responsive usa CONTAINER QUERIES ("@container"/"@sm:"), no
 * breakpoints de viewport ("sm:"): un libro digital suele mostrarse
 * embebido en un lector/iframe angosto, así que la pantalla puede ser de
 * escritorio aunque este bloque tenga poco ancho real disponible — con un
 * breakpoint de viewport, el layout de una sola columna nunca se activaba
 * en ese caso. Es el mismo motivo por el que crearPanelInformativo (motor
 * de Funciones) ya usa container queries para su propio layout.
 */
export function crearEncabezado(
  contenedor: HTMLElement,
  config: EncabezadoConfig,
): Encabezado {
  // El "@container" va en `contenedor` (el padre), no en .folleto-encabezado:
  // un elemento no puede consultar su propio ancho con container queries
  // (sería circular) — solo sus descendientes pueden usar "@sm:" etc.
  contenedor.classList.add('@container');
  contenedor.innerHTML = `
    <div class="folleto-encabezado -mx-7 -mt-7 mb-8 rounded-t-lg border-b-2 border-brand-300 bg-linear-to-r from-brand-100 via-brand-50 to-indigo-100 px-4 py-4 shadow-sm @sm:px-7! @sm:py-5!">
      <div class="flex flex-col gap-3 @sm:flex-row! @sm:flex-wrap! @sm:items-center! @sm:justify-between! @sm:gap-4!">
        <div class="flex flex-wrap items-center gap-3">
          <span data-unidad-badge class="rounded-lg bg-brand-600 px-3.5 py-1.5 text-sm font-black tracking-wide text-white shadow-control">Unidad ${config.unidad}</span>
          <span class="text-xl font-black" style="color: #1d4ed8">${config.tema}</span>
        </div>
        <div class="flex flex-row self-end gap-2 @sm:ml-auto! @sm:flex-col! @sm:items-end! @sm:gap-1.5! @sm:self-auto!">
          <span class="rounded-lg bg-white px-3.5 py-1 text-sm font-bold italic text-brand-700 shadow-surface">Pág ${config.pagina}</span>
          <span data-nota class="rounded-lg bg-white px-3.5 py-1 text-sm font-black text-brand-700 shadow-surface">Nota __ / 10</span>
        </div>
      </div>
      <div data-alumno class="mt-4 hidden w-fit items-center gap-2 rounded-lg bg-white px-4 py-1.5 shadow-control">
        <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-white">${iconoAlumno}</span>
        <span class="text-sm font-bold text-brand-800">Alumno: <span data-alumno-nombre class="text-slate-800"></span></span>
      </div>
    </div>
  `;

  const notaEl = contenedor.querySelector<HTMLElement>('[data-nota]');
  const alumnoEl = contenedor.querySelector<HTMLElement>('[data-alumno]');
  const alumnoNombreEl = contenedor.querySelector<HTMLElement>(
    '[data-alumno-nombre]',
  );

  if (config.imagenUnidad) {
    const anchoMovil = config.anchoImagenUnidad?.movil ?? 110;
    const anchoDesktop =
      config.anchoImagenUnidad?.desktop ?? config.anchoImagenUnidad?.movil ?? 150;

    const imagen = new Image();
    imagen.alt = `Unidad ${config.unidad}`;
    imagen.className =
      'object-contain w-[var(--ancho-imagen-unidad-movil)] @sm:w-[var(--ancho-imagen-unidad-desktop)]!';
    imagen.style.setProperty('--ancho-imagen-unidad-movil', `${anchoMovil}px`);
    imagen.style.setProperty('--ancho-imagen-unidad-desktop', `${anchoDesktop}px`);
    imagen.addEventListener('load', () => {
      contenedor.querySelector('[data-unidad-badge]')?.replaceWith(imagen);
    });
    // Si la imagen no existe todavía (404), no pasa nada: se queda la píldora de texto.
    imagen.src = config.imagenUnidad;
  }

  return {
    mostrarNota(sobreDiez: number) {
      if (notaEl) notaEl.textContent = `Nota ${sobreDiez.toFixed(2)} / 10`;
    },
    mostrarAlumno(nombre: string) {
      if (!alumnoEl || !alumnoNombreEl) return;
      alumnoNombreEl.textContent = nombre;
      alumnoEl.classList.remove('hidden');
      alumnoEl.classList.add('flex');
    },
  };
}
