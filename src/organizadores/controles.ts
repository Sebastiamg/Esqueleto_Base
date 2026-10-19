const icono = (path: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">${path}</svg>`;

const ICONO_REINICIAR = icono('<path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />');
const ICONO_ANTERIOR = icono('<path d="m15 18-6-6 6-6" />');
const ICONO_SIGUIENTE = icono('<path d="m9 18 6-6-6-6" />');

const BOTON_SECUNDARIO =
  'grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-40';
const BOTON_PRINCIPAL =
  'grid h-11 w-11 place-items-center rounded-xl bg-brand-500 text-white shadow-sm transition hover:bg-brand-600 active:scale-95 disabled:pointer-events-none disabled:bg-slate-200 disabled:text-slate-400';

export interface AccionesControles {
  anterior(): void;
  siguiente(): void;
  reiniciar(): void;
}

export interface Controles {
  actualizar(paso: number, total: number): void;
  destruir(): void;
}

export function crearControles(host: HTMLElement, acciones: AccionesControles): Controles {
  const hueco = document.createElement('div');
  hueco.className = 'org-controles-hueco mt-5 print:hidden';
  const barra = document.createElement('div');
  barra.className = 'org-controles flex w-max items-center justify-center gap-2 sm:gap-3 mx-auto';
  barra.innerHTML = `
    <button type="button" data-org="reiniciar" aria-label="Reiniciar" title="Reiniciar" class="${BOTON_SECUNDARIO}">${ICONO_REINICIAR}</button>
    <button type="button" data-org="anterior" aria-label="Anterior" title="Anterior" class="${BOTON_SECUNDARIO}">${ICONO_ANTERIOR}</button>
    <div class="min-w-[8.5rem] px-2 text-center">
      <div data-org="etiqueta" aria-live="polite" class="text-sm font-bold text-slate-700"></div>
      <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div data-org="barra" class="h-full rounded-full bg-brand-500 transition-[width] duration-500"></div>
      </div>
    </div>
    <button type="button" data-org="siguiente" aria-label="Siguiente" title="Siguiente" class="${BOTON_PRINCIPAL}">${ICONO_SIGUIENTE}</button>
  `;
  hueco.append(barra);
  host.append(hueco);

  // Flota (fixed abajo) solo mientras el mapa está en pantalla y el lugar
  // natural de la barra quedó más abajo del borde: así en el celular se
  // puede avanzar sin bajar hasta el final del mapa. .book-card tiene
  // overflow:hidden, por eso no sirve "position: sticky".
  let cuadro = 0;
  const evaluarFlotante = () => {
    cancelAnimationFrame(cuadro);
    cuadro = requestAnimationFrame(() => {
      const flotando = barra.classList.contains('org-controles--flotante');
      if (!flotando) hueco.style.height = `${barra.offsetHeight}px`;
      const alto = window.innerHeight;
      const mapa = host.getBoundingClientRect();
      const lugar = hueco.getBoundingClientRect();
      const flotar = mapa.top < alto - 160 && lugar.bottom > alto;
      if (flotar !== flotando) barra.classList.toggle('org-controles--flotante', flotar);
    });
  };
  window.addEventListener('scroll', evaluarFlotante, { passive: true });
  window.addEventListener('resize', evaluarFlotante);
  evaluarFlotante();

  const boton = (nombre: string) => barra.querySelector<HTMLButtonElement>(`[data-org="${nombre}"]`)!;
  const reiniciar = boton('reiniciar');
  const anterior = boton('anterior');
  const siguiente = boton('siguiente');
  const etiqueta = barra.querySelector<HTMLElement>('[data-org="etiqueta"]')!;
  const progreso = barra.querySelector<HTMLElement>('[data-org="barra"]')!;

  reiniciar.addEventListener('click', acciones.reiniciar);
  anterior.addEventListener('click', acciones.anterior);
  siguiente.addEventListener('click', acciones.siguiente);

  return {
    actualizar(paso, total) {
      etiqueta.textContent = `Paso ${paso + 1} de ${total}`;
      progreso.style.width = `${((paso + 1) / total) * 100}%`;
      reiniciar.disabled = paso === 0;
      anterior.disabled = paso === 0;
      siguiente.disabled = paso === total - 1;
      // Revelar nodos cambia el alto del mapa (y con eso dónde cae la barra).
      evaluarFlotante();
    },
    destruir() {
      window.removeEventListener('scroll', evaluarFlotante);
      window.removeEventListener('resize', evaluarFlotante);
      cancelAnimationFrame(cuadro);
    },
  };
}
