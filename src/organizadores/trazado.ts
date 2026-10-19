/*
  OJO: las dos funciones de este archivo deben ser AUTOCONTENIDAS (sin usar
  nada de fuera: ni imports, ni constantes del módulo). print.ts las
  serializa con toString() y las inyecta como <script> en el iframe de
  impresión, donde no corre ningún script del libro — es la única forma de
  recalcular las líneas con el layout real de la hoja.
*/

/** Calcula la geometría de todas las conexiones de un .org-arbol según dónde están hoy sus nodos. */
export function trazarConexiones(arbol: HTMLElement): void {
  const RADIO = 3.5;
  const compacto = arbol.classList.contains('org-compacto');

  // Posición sin transformaciones (las animaciones escalan los nodos).
  const caja = (el: HTMLElement) => {
    let x = 0;
    let y = 0;
    let n: HTMLElement | null = el;
    while (n && n !== arbol) {
      x += n.offsetLeft;
      y += n.offsetTop;
      n = n.offsetParent as HTMLElement | null;
    }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  };
  const nodo = (id: string | undefined) =>
    id ? arbol.querySelector<HTMLElement>(`[data-org-id="${id}"]`) : null;

  arbol.querySelectorAll<SVGGElement>('.org-conexion').forEach(g => {
    const origen = (compacto && nodo(g.dataset.desdeCompacto)) || nodo(g.dataset.desde);
    const destino = nodo(g.dataset.hasta);
    const trazo = g.querySelector<SVGPathElement>('.org-trazo');
    const mascara = g.querySelector<SVGPathElement>('.org-mascara');
    if (!origen || !destino || !trazo || !mascara) return;

    const ruta = compacto ? 'v' : g.dataset.ruta;
    const marcadorIni = g.querySelector('.org-marcador-inicio');
    const marcadorFin = g.querySelector('.org-marcador-fin');
    const etiqueta = g.querySelector('.org-etiqueta');
    const a = caja(origen);
    const b = caja(destino);
    const gi = marcadorIni ? RADIO + 1 : 0;
    const gf = marcadorFin ? RADIO + 1 : 0;

    let d: string;
    let ix: number;
    let iy: number;
    let fx: number;
    let fy: number;
    let recto = false;

    if (ruta === 'h') {
      ix = a.x + a.w + gi;
      iy = a.y + a.h / 2;
      fx = b.x - gf;
      fy = b.y + b.h / 2;
      const dy = fy - iy;
      if (Math.abs(dy) < 1) {
        d = `M${ix},${iy} H${fx}`;
      } else {
        // El codo va cerca del destino (dentro del espacio entre columnas):
        // a mitad de camino podría caer encima de una nota del origen.
        const mx = fx - Math.min(22, (fx - ix) / 2);
        const r = Math.min(10, Math.abs(dy) / 2, Math.abs(fx - mx));
        const s = dy > 0 ? 1 : -1;
        d = `M${ix},${iy} H${mx - r} Q${mx},${iy} ${mx},${iy + s * r} V${fy - s * r} Q${mx},${fy} ${mx + r},${fy} H${fx}`;
      }
    } else {
      ix = a.x + Math.min(18, a.w / 2);
      iy = a.y + a.h + gi;
      fx = b.x - gf;
      fy = b.y + b.h / 2;
      if (fx - ix < 4) {
        recto = true;
        fx = ix;
        fy = b.y - gf;
        d = `M${ix},${iy} V${fy}`;
      } else {
        const r = Math.min(10, Math.abs(fy - iy), Math.abs(fx - ix));
        d = `M${ix},${iy} V${fy - r} Q${ix},${fy} ${ix + r},${fy} H${fx}`;
      }
    }

    trazo.setAttribute('d', d);
    mascara.setAttribute('d', d);
    mascara.style.setProperty('--org-largo', `${trazo.getTotalLength() + 1}px`);

    if (marcadorIni) {
      marcadorIni.setAttribute('cx', String(ruta === 'h' ? ix - gi : ix));
      marcadorIni.setAttribute('cy', String(ruta === 'h' ? iy : iy - gi));
    }
    if (marcadorFin) {
      marcadorFin.setAttribute('cx', String(recto ? fx : fx + gf));
      marcadorFin.setAttribute('cy', String(recto ? fy + gf : fy));
    }
    if (etiqueta) {
      // Vertical: al costado del tramo que baja, en el hueco entre nodos.
      // Horizontal: encima de la línea.
      const vertical = ruta !== 'h';
      etiqueta.setAttribute('x', String(vertical ? ix + 8 : (ix + fx) / 2));
      etiqueta.setAttribute('y', String(vertical ? (a.y + a.h + Math.max(b.y, a.y + a.h)) / 2 : iy - 9));
      etiqueta.setAttribute('text-anchor', vertical ? 'start' : 'middle');
    }
  });
}

/**
 * Prepara todos los organizadores de un documento para la hoja impresa.
 *
 * "beforeprint" dispara con el layout de PANTALLA todavía activo: los
 * estilos de @media print (letra al 86 %, espaciado reducido, sin padding
 * de página) se aplican DESPUÉS. Medir ahí deja las líneas calculadas para
 * un layout que ya no existe (chuecas y fuera de lugar en el papel). Por eso
 * se inyecta, solo mientras se mide, una copia de esas reglas de impresión
 * (ver tailwind.css, fixes #1, #2, #8 y #10, y revelador.css; si cambian allá, cambiar acá).
 * Las posiciones se miden relativas al propio mapa, así que no dependen del
 * ancho de la hoja: solo importa que la tipografía y el espaciado coincidan.
 *
 * Si el mapa horizontal no cabe en `anchoHoja` (ancho útil de una hoja A4/
 * Carta con márgenes de 9 mm), se reduce con scale() (en papel no hay
 * interacción, reducir es correcto); si quedaría ilegible (menos de 60 %),
 * pasa a modo esquema. `trazar` es trazarConexiones (se pasa como parámetro
 * para que esta función siga siendo autocontenida).
 */
export function ajustarOrganizadoresParaImprimir(
  doc: Document,
  trazar: (arbol: HTMLElement) => void,
  anchoHoja = 700,
): void {
  const estilo = doc.createElement('style');
  estilo.textContent =
    "html{font-size:86% !important}" +
    ":root,:host{--spacing:0.2rem;--leading-tight:1.25;--leading-snug:1.25;--leading-normal:1.35;--leading-relaxed:1.45;--leading-loose:1.6}" +
    ".book-page,.book-card__body{padding:0 !important}" +
    "[style*='min-width']{min-width:0 !important}";
  doc.head.append(estilo);
  // El revelador de página oculta los bloques pendientes (.reveal-oculto) y
  // solo al imprimir los vuelve a mostrar: se destapan mientras se mide, o
  // sus mapas medirían 0.
  const ocultos = Array.from(doc.querySelectorAll<HTMLElement>('.reveal-oculto'));
  ocultos.forEach(el => el.classList.remove('reveal-oculto'));
  try {
    doc.querySelectorAll<HTMLElement>('.org-arbol').forEach(arbol => {
      arbol.style.transform = '';
      arbol.style.marginBottom = '';
      arbol.classList.remove('org-compacto', 'org-sin-transicion');

      const escala = Math.min(1, anchoHoja / arbol.offsetWidth);
      if (escala < 0.6) {
        arbol.classList.add('org-compacto');
        trazar(arbol);
        return;
      }
      trazar(arbol);
      if (escala < 1) {
        arbol.style.transformOrigin = 'top left';
        arbol.style.transform = `scale(${escala})`;
        // scale() no achica la caja de layout: se recupera el alto sobrante.
        arbol.style.marginBottom = `${-arbol.offsetHeight * (1 - escala)}px`;
      }
    });
  } finally {
    ocultos.forEach(el => el.classList.add('reveal-oculto'));
    estilo.remove();
  }
}
