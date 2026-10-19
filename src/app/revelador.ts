/**
 * Revelador de página: despliega una actividad de a poco con una barra de
 * "‹ Paso N de M ›" fija abajo, bajo un ÚNICO contador — un bloque simple
 * (un párrafo, una imagen) cuenta como 1 paso; un mapa conceptual
 * (crearOrganizador, montado con `controles: false` para que no tenga su
 * propia barra) aporta TANTOS pasos como nodos tenga, y el mismo botón
 * "Siguiente" general los va revelando uno por uno, con su propia
 * animación de nodos/líneas — como si todo el mapa fuera, nodo a nodo,
 * parte de esta misma secuencia.
 *
 * Cada paso es un contenedor que ya existe en el HTML (el autor decide qué
 * agrupar envolviéndolo en un <div id="pasoN">): esta función NO arma
 * layout, solo agrega/quita la clase que lo muestra/oculta, delega en el
 * mapa qué nodo mostrar, y mueve la barra de navegación.
 */

/** Lo mínimo que necesita un mapa (crearOrganizador) para integrarse aquí. */
export interface SubpasoOrganizador {
  readonly totalPasos: number;
  irAPaso(paso: number): void;
  reiniciar(): void;
}

export interface PasoRevelador {
  el: HTMLElement;
  /** Si este bloque ES un mapa conceptual: sus nodos pasan a ser varios "pasos" de esta misma secuencia. */
  organizador?: SubpasoOrganizador;
}

export interface Revelador {
  readonly paso: number;
  readonly totalPasos: number;
  siguiente(): void;
  anterior(): void;
  reiniciar(): void;
}

const icono = (path: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">${path}</svg>`;
const ICONO_REINICIAR = icono('<path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />');
const ICONO_ANTERIOR = icono('<path d="m15 18-6-6 6-6" />');
const ICONO_SIGUIENTE = icono('<path d="m9 18 6-6-6-6" />');

const BOTON_SECUNDARIO =
  'grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-40';
const BOTON_PRINCIPAL =
  'grid h-11 w-11 place-items-center rounded-xl bg-brand-500 text-white shadow-sm transition hover:bg-brand-600 active:scale-95 disabled:pointer-events-none disabled:bg-slate-200 disabled:text-slate-400';

interface Tramo {
  item: PasoRevelador;
  /** Primer paso GLOBAL (de toda la página) que le corresponde a este bloque. */
  inicio: number;
  /** Cuántos pasos globales ocupa (1 para un bloque simple; sus nodos si es un mapa). */
  cuenta: number;
}

/** Despliega `pasos` de a uno, con una barra fija abajo de toda la pantalla. */
export function crearRevelador(pasos: PasoRevelador[]): Revelador {
  const tramos: Tramo[] = [];
  let acumulado = 0;
  for (const item of pasos) {
    item.el.classList.add('reveal-paso');
    const cuenta = item.organizador?.totalPasos ?? 1;
    tramos.push({ item, inicio: acumulado, cuenta });
    acumulado += cuenta;
  }
  const total = acumulado;

  /** El bloque (con o sin mapa adentro) al que pertenece el paso global `indiceGlobal`. */
  function tramoDe(indiceGlobal: number): Tramo {
    let actual = tramos[0]!;
    for (const t of tramos) {
      if (t.inicio > indiceGlobal) break;
      actual = t;
    }
    return actual;
  }

  const barra = document.createElement('div');
  barra.className =
    'reveal-barra fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-2 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:gap-3 print:hidden';
  barra.innerHTML = `
    <button type="button" data-rev="reiniciar" aria-label="Reiniciar" title="Reiniciar" class="${BOTON_SECUNDARIO}">${ICONO_REINICIAR}</button>
    <button type="button" data-rev="anterior" aria-label="Anterior" title="Anterior" class="${BOTON_SECUNDARIO}">${ICONO_ANTERIOR}</button>
    <div class="min-w-[8.5rem] px-2 text-center">
      <div data-rev="etiqueta" aria-live="polite" class="text-sm font-bold text-slate-700"></div>
      <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div data-rev="barra" class="h-full rounded-full bg-brand-500 transition-[width] duration-500"></div>
      </div>
    </div>
    <button type="button" data-rev="siguiente" aria-label="Siguiente" title="Siguiente" class="${BOTON_PRINCIPAL}">${ICONO_SIGUIENTE}</button>
  `;
  // Espacio al final de la página para que el último bloque no quede
  // tapado detrás de la barra fija.
  const relleno = document.createElement('div');
  relleno.className = 'print:hidden';
  relleno.style.height = '76px';
  document.body.append(barra, relleno);

  const botonReiniciar = barra.querySelector<HTMLButtonElement>('[data-rev="reiniciar"]')!;
  const botonAnterior = barra.querySelector<HTMLButtonElement>('[data-rev="anterior"]')!;
  const botonSiguiente = barra.querySelector<HTMLButtonElement>('[data-rev="siguiente"]')!;
  const etiqueta = barra.querySelector<HTMLElement>('[data-rev="etiqueta"]')!;
  const progreso = barra.querySelector<HTMLElement>('[data-rev="barra"]')!;

  let paso = 0;
  function aplicar(): void {
    for (const t of tramos) {
      const visible = paso >= t.inicio;
      const el = t.item.el;
      if (visible) {
        if (el.classList.contains('reveal-oculto')) {
          // Todavía estaba colapsado (display:none, "ni existe" en el
          // layout): hay que devolverle su display ANTES de animar, pero
          // en un frame aparte — si se agrega "reveal-visible" en el
          // mismo instante, el navegador nunca llega a pintar el estado
          // de partida (opacity 0) y la transición no se ve, aparece de
          // golpe.
          el.classList.remove('reveal-oculto');
          void el.offsetHeight; // fuerza reflow: fija el estado "oculto" antes de animar
          requestAnimationFrame(() => el.classList.add('reveal-visible'));
        } else {
          el.classList.add('reveal-visible');
        }
      } else {
        // Colapsa a display:none (no solo opacity:0): así la página no
        // reserva ya desde el inicio el alto de TODO lo que falta por
        // aparecer — crece de a poco, al ritmo de "Siguiente".
        el.classList.remove('reveal-visible');
        el.classList.add('reveal-oculto');
      }
      el.inert = !visible;
      // El mapa adentro de este bloque avanza a su propio nodo según cuánto
      // de este tramo ya se recorrió — 0 mientras el tramo ni empieza.
      t.item.organizador?.irAPaso(Math.min(Math.max(paso - t.inicio, 0), t.cuenta - 1));
    }
    etiqueta.textContent = `Paso ${paso + 1} de ${total}`;
    progreso.style.width = `${((paso + 1) / total) * 100}%`;
    botonReiniciar.disabled = paso === 0;
    botonAnterior.disabled = paso === 0;
    botonSiguiente.disabled = paso === total - 1;
  }

  // Margen entre el borde superior de la ventana y el bloque recién
  // revelado — deja ver el botón ☰ del menú (fixed, arriba a la izquierda)
  // sin que el bloque quede pegado al borde.
  const MARGEN_SCROLL_PX = 90;

  function ir(destino: number, scrollAlNuevoPaso = false): void {
    const anterior = paso;
    paso = Math.min(Math.max(destino, 0), total - 1);
    aplicar();
    // Solo se hace scroll al entrar a un bloque NUEVO (no en cada nodo
    // interno de un mismo mapa — ya está a la vista, re-scrollear a su
    // mismo contenedor en cada clic sería innecesario).
    const tramoNuevo = tramoDe(paso);
    if (scrollAlNuevoPaso && paso > anterior && tramoNuevo !== tramoDe(anterior)) {
      const el = tramoNuevo.item.el;
      // rAF: espera a que "aplicar()" ya haya quitado "inert" y aplicado
      // layout antes de medir la posición del bloque recién visible.
      requestAnimationFrame(() => {
        const destinoScroll = el.getBoundingClientRect().top + window.scrollY - MARGEN_SCROLL_PX;
        const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: destinoScroll, behavior: prefiereMenosMovimiento ? 'auto' : 'smooth' });
      });
    }
  }

  botonSiguiente.addEventListener('click', () => ir(paso + 1, true));
  botonAnterior.addEventListener('click', () => ir(paso - 1));
  botonReiniciar.addEventListener('click', () => {
    pasos.forEach(p => p.organizador?.reiniciar());
    ir(0);
  });

  aplicar();


  return {
    get paso() {
      return paso;
    },
    get totalPasos() {
      return total;
    },
    siguiente: () => ir(paso + 1, true),
    anterior: () => ir(paso - 1),
    reiniciar: () => ir(0),
  };
}
