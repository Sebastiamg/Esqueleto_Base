import { crearControlDeVoz } from './speech';
import { imprimirActividad } from './print';
import { abrirDialogoGuardar } from './save-dialog';
import { expandirEtiquetas } from './etiquetas';
import {
  iconoAltavoz,
  iconoAyudas,
  iconoCalificar,
  iconoCalificarEnLinea,
  iconoCerrar,
  iconoDetener,
  iconoHamburguesa,
  iconoImprimir,
  iconoImprimirEnLinea,
  iconoInfo,
  iconoRecargar,
  iconoRecargarEnLinea,
} from './icons';

export interface MenuConfig {
  /** Pistas específicas de esta actividad (se muestran en el panel de Ayudas y se pueden leer en voz alta). */
  ayudas: string[];
  /**
   * Qué hacer al pulsar "Calificar" (normalmente: llamar a
   * calificarActividad(...) del módulo grading, que ya devuelve su propio
   * resultado). Si en vez de eso hacés tu propio cálculo de nota a mano,
   * devolvé ese número (sobre 10) — se incrusta solo en el encabezado a
   * través de "mostrarNota" (ver abajo), sin que tengas que llamar a
   * encabezado.mostrarNota(...) vos mismo. "unknown" (no "void") a
   * propósito: acepta cualquier valor de retorno (el de calificarActividad
   * incluido) — solo el CASO de que sea un número dispara "mostrarNota".
   */
  onCalificar: () => unknown;
  /**
   * Qué hacer con el número (sobre 10) que devuelva "onCalificar" — normalmente
   * encabezado.mostrarNota. Opcional: si "onCalificar" ya se encarga de
   * mostrar la nota por su cuenta (ej. llamando a calificarActividad, que
   * ya la escribe sola), no hace falta pasar esto.
   */
  mostrarNota?: (sobreDiez: number) => void;
  /** Qué hacer con el nombre que el estudiante escribe en el diálogo de guardado (ej. encabezado.mostrarAlumno). */
  onNombreEstudiante: (nombre: string) => void;
}

interface ItemMenu {
  accion: string;
  icono: string;
  etiqueta: string;
  descripcion: string;
  /** Clases de color del botón cuadrado (fondo degradado + tinte de sombra). */
  color: string;
}

const ITEMS: ItemMenu[] = [
  {
    accion: 'ayudas',
    icono: iconoAyudas,
    etiqueta: 'Ayudas',
    descripcion: 'Muestra las pistas para resolver esta actividad y permite escucharlas en voz alta.',
    color: 'from-brand-500 to-brand-600 shadow-brand-600/30 hover:from-brand-600 hover:to-brand-700',
  },
  {
    accion: 'imprimir',
    icono: iconoImprimir,
    etiqueta: 'Imprimir PDF',
    descripcion: 'Abre el diálogo de impresión del navegador para guardar la actividad como PDF.',
    color: 'from-acento-1 to-purple-700 shadow-purple-700/30 hover:brightness-110',
  },
  {
    accion: 'recargar',
    icono: iconoRecargar,
    etiqueta: 'Recargar',
    descripcion: 'Vuelve a cargar la página; se pierde el progreso escrito en esta actividad.',
    color: 'from-amber-400 to-amber-500 shadow-amber-500/30 hover:from-amber-500 hover:to-amber-600',
  },
  {
    accion: 'calificar',
    icono: iconoCalificar,
    etiqueta: 'Calificar',
    descripcion: 'Corrige la actividad, pide el nombre del estudiante y abre la vista de impresión.',
    color: 'from-success-500 to-success-600 shadow-success-600/30 hover:from-success-600 hover:to-success-700',
  },
  {
    accion: 'info',
    icono: iconoInfo,
    etiqueta: 'Info',
    descripcion: 'Explica, uno por uno, qué hace cada botón de este menú.',
    color: 'from-acento-6 to-cyan-700 shadow-cyan-700/30 hover:brightness-110',
  },
  {
    accion: 'cerrar',
    icono: iconoCerrar,
    etiqueta: 'Cerrar',
    descripcion: 'Oculta este menú. Vuelve a aparecer al pulsar el botón ☰.',
    color: 'from-danger-500 to-danger-600 shadow-danger-600/30 hover:from-danger-600 hover:to-danger-700',
  },
];

/** Botón cuadrado-redondeado ("squircle"), con color propio y entrada escalonada. */
function botonMenu(item: ItemMenu, indice: number): string {
  return `
    <div class="group relative animate-entrada" style="animation-delay: ${indice * 45}ms">
      <button
        type="button"
        data-accion="${item.accion}"
        aria-label="${item.etiqueta}"
        class="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${item.color}"
      >${item.icono}</button>
      <span
        role="tooltip"
        class="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-panel transition group-hover:opacity-100"
      >${item.etiqueta}</span>
    </div>`;
}

/** Tarjeta flotante (ícono en círculo + texto + botón rojo de cerrar en la esquina) — usada por Ayudas e Info. */
function tarjetaFlotante(id: string, icono: string, titulo: string, cuerpoHtml: string): string {
  return `
    <aside id="${id}" class="fixed left-24 top-4 z-50 hidden w-80 animate-entrada rounded-3xl bg-white p-5 shadow-card-hover print:hidden">
      <button
        type="button"
        data-cerrar-tarjeta
        aria-label="Cerrar"
        class="absolute -right-2.5 -top-2.5 grid h-7 w-7 place-items-center rounded-full bg-danger-500 text-white shadow-panel transition hover:bg-danger-600"
      >${iconoCerrar}</button>
      <div class="mb-3 flex items-center gap-3">
        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">${icono}</span>
        <p class="font-bold text-slate-800">${titulo}</p>
      </div>
      ${cuerpoHtml}
    </aside>`;
}

/** Construye el menú hamburguesa flotante (Ayudas, Imprimir PDF, Recargar, Calificar, Info, Cerrar) y lo inserta en <body>. */
export function crearMenu(config: MenuConfig): void {
  expandirEtiquetas();

  const raiz = document.createElement('div');
  raiz.innerHTML = `
    <button
      id="menu-abrir"
      type="button"
      aria-label="Abrir menú"
      class="fixed left-4 top-4 z-50 grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-brand-500 to-brand-600 text-white shadow-xl shadow-brand-600/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl print:hidden"
    >${iconoHamburguesa}</button>

    <nav
      id="menu-panel"
      class="fixed left-4 top-4 z-50 hidden flex-col gap-2 rounded-[26px] bg-white/70 p-2 shadow-card-hover backdrop-blur print:hidden"
    >
      ${ITEMS.map(botonMenu).join('')}
    </nav>

    ${tarjetaFlotante(
      'panel-ayudas',
      iconoAyudas,
      'Ayudas de la actividad',
      `
        <ul class="mb-3 flex flex-col gap-1.5 pl-4 text-sm text-slate-700 marker:text-brand-500 list-disc">
          ${config.ayudas.map(ayuda => `<li>${ayuda}</li>`).join('')}
        </ul>
        <p class="mb-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
          Para evaluar y guardar el ejercicio pulsa sobre ${iconoCalificarEnLinea}.
          Para repetir el ejercicio pulsa sobre ${iconoRecargarEnLinea}.
          Para guardar la actividad pulsa sobre ${iconoImprimirEnLinea}.
        </p>
        <div class="flex gap-2">
          <button type="button" data-voz="iniciar" class="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-200">${iconoAltavoz} Escuchar</button>
          <button type="button" data-voz="detener" class="hidden items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200">${iconoDetener} Detener</button>
        </div>
      `,
    )}

    ${tarjetaFlotante(
      'panel-info',
      iconoInfo,
      '¿Qué hace cada botón?',
      `
        <ul class="flex flex-col gap-3 text-sm text-slate-700">
          ${ITEMS.map(
            item => `
              <li data-accion="${item.accion}" class="flex items-start gap-2.5">
                <span class="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-linear-to-br text-white ${item.color}">${item.icono}</span>
                <span><b class="text-slate-800">${item.etiqueta}:</b> ${item.descripcion}</span>
              </li>`,
          ).join('')}
        </ul>
      `,
    )}
  `;
  document.body.append(...raiz.children);

  const botonAbrir = document.getElementById('menu-abrir') as HTMLButtonElement;
  const panelMenu = document.getElementById('menu-panel') as HTMLElement;
  const panelAyudas = document.getElementById('panel-ayudas') as HTMLElement;
  const panelInfo = document.getElementById('panel-info') as HTMLElement;

  function cerrarSubpaneles(): void {
    panelAyudas.classList.add('hidden');
    panelInfo.classList.add('hidden');
  }

  function abrirMenu(): void {
    botonAbrir.classList.add('hidden');
    panelMenu.classList.remove('hidden');
    panelMenu.classList.add('flex');
  }

  function cerrarMenu(): void {
    panelMenu.classList.add('hidden');
    panelMenu.classList.remove('flex');
    botonAbrir.classList.remove('hidden');
    cerrarSubpaneles();
  }

  botonAbrir.addEventListener('click', abrirMenu);

  panelMenu.addEventListener('click', event => {
    const boton = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-accion]');
    if (!boton) return;
    switch (boton.dataset.accion) {
      case 'ayudas':
        panelInfo.classList.add('hidden');
        panelAyudas.classList.toggle('hidden');
        break;
      case 'imprimir':
        imprimirActividad();
        break;
      case 'recargar':
        location.reload();
        break;
      case 'calificar': {
        const resultado = config.onCalificar();
        if (typeof resultado === 'number') config.mostrarNota?.(resultado);
        // Ya calificado: el botón "Calificar" no debe volver a aparecer
        // (ni en el panel del menú ni en la lista de "Info").
        panelMenu.querySelector('[data-accion="calificar"]')?.closest('.group')?.remove();
        panelInfo.querySelector('[data-accion="calificar"]')?.remove();
        cerrarMenu();
        abrirDialogoGuardar(nombre => {
          config.onNombreEstudiante(nombre);
          // Tras guardar, la actividad queda congelada: nada del contenido
          // se puede seguir tocando (botones/selects/inputs/selección de
          // texto), salvo el menú hamburguesa mismo (ver tailwind.css).
          document.body.classList.add('actividad-bloqueada');
          imprimirActividad();
        });
        break;
      }
      case 'info':
        panelAyudas.classList.add('hidden');
        panelInfo.classList.toggle('hidden');
        break;
      case 'cerrar':
        cerrarMenu();
        break;
    }
  });

  for (const tarjeta of [panelAyudas, panelInfo]) {
    tarjeta.querySelector('[data-cerrar-tarjeta]')?.addEventListener('click', () => tarjeta.classList.add('hidden'));
  }

  // Cerrar todo con Escape, o al hacer clic fuera del menú y sus tarjetas.
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panelMenu.classList.contains('hidden')) cerrarMenu();
  });
  document.addEventListener('click', event => {
    const dentroDelMenu = (event.target as HTMLElement).closest('#menu-panel, #panel-ayudas, #panel-info, #menu-abrir');
    if (!dentroDelMenu && !panelMenu.classList.contains('hidden')) cerrarMenu();
  });

  // "ayudas" admite HTML (ej. "<b>"); se lee del <ul> ya renderizado en vez
  // de las strings crudas — su textContent ya viene sin etiquetas.
  const textoAyudas = [...panelAyudas.querySelectorAll('li')].map(li => li.textContent ?? '').join('. ');
  const voz = crearControlDeVoz(textoAyudas);
  const btnIniciarVoz = panelAyudas.querySelector<HTMLButtonElement>('[data-voz="iniciar"]')!;
  const btnDetenerVoz = panelAyudas.querySelector<HTMLButtonElement>('[data-voz="detener"]')!;
  if (!voz.soportado) {
    btnIniciarVoz.disabled = true;
    btnIniciarVoz.title = 'La lectura en voz alta no está disponible en este navegador.';
  }
  btnIniciarVoz.addEventListener('click', () => {
    voz.iniciar();
    btnIniciarVoz.classList.replace('inline-flex', 'hidden');
    btnDetenerVoz.classList.replace('hidden', 'inline-flex');
  });
  btnDetenerVoz.addEventListener('click', () => {
    voz.detener();
    btnDetenerVoz.classList.replace('inline-flex', 'hidden');
    btnIniciarVoz.classList.replace('hidden', 'inline-flex');
  });
}
