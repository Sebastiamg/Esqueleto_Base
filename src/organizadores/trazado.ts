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
  const vertical = !compacto && arbol.classList.contains('org-vertical');

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

    if (vertical) {
      // Árbol de arriba hacia abajo: baja del centro del origen hasta la
      // mitad del hueco, cruza en horizontal y baja al centro del destino.
      ix = a.x + a.w / 2;
      iy = a.y + a.h + gi;
      fx = b.x + b.w / 2;
      fy = b.y - gf;
      recto = true;
      const my = (a.y + a.h + b.y) / 2;
      const dx = fx - ix;
      if (Math.abs(dx) < 1) {
        fx = ix;
        d = `M${ix},${iy} V${fy}`;
      } else {
        const r = Math.min(10, Math.abs(dx) / 2, my - iy, fy - my);
        const s = dx > 0 ? 1 : -1;
        d = `M${ix},${iy} V${my - r} Q${ix},${my} ${ix + s * r},${my} H${fx - s * r} Q${fx},${my} ${fx},${my + r} V${fy}`;
      }
      trazo.setAttribute('d', d);
      mascara.setAttribute('d', d);
      mascara.style.setProperty('--org-largo', `${trazo.getTotalLength() + 1}px`);
      if (marcadorIni) {
        marcadorIni.setAttribute('cx', String(ix));
        marcadorIni.setAttribute('cy', String(iy - gi));
      }
      if (marcadorFin) {
        marcadorFin.setAttribute('cx', String(fx));
        marcadorFin.setAttribute('cy', String(fy + gf));
      }
      if (etiqueta) {
        // Al costado del último tramo, el que baja al destino.
        etiqueta.setAttribute('x', String(fx + 7));
        etiqueta.setAttribute('y', String(Math.abs(dx) < 1 ? (iy + fy) / 2 : (my + fy) / 2));
        etiqueta.setAttribute('text-anchor', 'start');
      }
      return;
    }

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
 * Si el mapa no cabe en `anchoHoja` (ancho útil de una hoja A4/Carta con
 * márgenes de 9 mm): un mapa horizontal prueba primero el layout vertical
 * (árbol de arriba hacia abajo); con el que quede más ancho de los dos se
 * reduce con scale() hasta 85 % (en papel no hay interacción, reducir un
 * poco es correcto); si ni así cabe, pasa a modo esquema (nunca se corta ni
 * aparece una barra de scroll). `trazar` es trazarConexiones (se pasa como
 * parámetro para que esta función siga siendo autocontenida).
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
    "[style*='min-width']:not([data-lado]){min-width:0 !important}" +
    ".org-arbol{--spacing:0.25rem}";
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
      // Se parte de la orientación que ya eligió la pantalla (con el mismo
      // criterio de ancho de hoja): casi siempre ya cabe y no se rearma nada.
      // Solo se suelta el esquema compacto (ej. si se imprime desde el celular).
      arbol.classList.remove('org-compacto', 'org-sin-transicion');

      let escala = Math.min(1, anchoHoja / arbol.offsetWidth);
      if (escala < 1 && !arbol.classList.contains('org-vertical')) {
        arbol.classList.add('org-vertical');
        const escalaVertical = Math.min(1, anchoHoja / arbol.offsetWidth);
        if (escalaVertical > escala) escala = escalaVertical;
        else arbol.classList.remove('org-vertical');
      }
      if (escala < 0.85) {
        arbol.classList.remove('org-vertical');
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
