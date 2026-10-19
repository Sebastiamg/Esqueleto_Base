import { ajustarOrganizadoresParaImprimir, trazarConexiones } from '../organizadores/trazado';

// Ancho fijo tipo "hoja/PC" (≈ 8.5in a 96dpi) al que SIEMPRE se monta la
// actividad justo antes de imprimir, sin importar el ancho real del
// dispositivo. Ver el porqué en el comentario de imprimirActividad().
const ANCHO_IMPRESION_PX = 816;

/**
 * Clona el documento actual (con las respuestas/estado tal como están AHORA
 * en pantalla) en un string de HTML listo para un iframe, sin scripts.
 */
function clonarParaImprimir(): string {
  const clon = document.documentElement.cloneNode(true) as HTMLElement;

  // cloneNode() copia los ATRIBUTOS originales de cada elemento, pero NO el
  // valor "vivo" que el estudiante haya escrito en un <input>/<textarea> ni
  // la opción elegida en un <select> — esas viven como propiedades del
  // elemento en memoria, no como algo que "outerHTML" pueda ver. Sin este
  // paso, imprimir borraría todo lo que el estudiante ya respondió.
  const originales = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input, textarea, select',
  );
  const clonados = clon.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input, textarea, select',
  );
  // outerHTML serializa ATRIBUTOS, no la propiedad ".value"/".checked" en
  // memoria — hay que fijar el ATRIBUTO correspondiente en cada caso (y en
  // <textarea>, que no tiene atributo "value", el contenido de texto).
  originales.forEach((original, indice) => {
    const destino = clonados[indice];
    if (!destino) return;
    if (original instanceof HTMLInputElement && (original.type === 'checkbox' || original.type === 'radio')) {
      if (original.checked) destino.setAttribute('checked', '');
      else destino.removeAttribute('checked');
    } else if (original instanceof HTMLTextAreaElement) {
      destino.textContent = original.value;
    } else if (original instanceof HTMLSelectElement) {
      const opciones = (destino as HTMLSelectElement).querySelectorAll('option');
      opciones.forEach((opcion, indiceOpcion) => {
        if (indiceOpcion === original.selectedIndex) opcion.setAttribute('selected', '');
        else opcion.removeAttribute('selected');
      });
    } else {
      destino.setAttribute('value', original.value);
    }
  });

  // El <canvas> del widget "Lienzo" (dibujo libre) guarda lo dibujado en un
  // buffer de píxeles interno, invisible para cloneNode()/outerHTML — igual
  // que el ".value" de un input, pero sin ni siquiera un atributo HTML
  // equivalente al que aferrarse: un <canvas> clonado siempre nace en
  // blanco. La única forma de llevar el dibujo al clon es capturarlo como
  // imagen (canvas.toDataURL) ANTES de clonar, y reemplazar el <canvas>
  // clonado (ya sin dibujo) por un <img> con esa foto — mismo tamaño y
  // clases, así queda en el mismo lugar exacto sobre el fondo/plantilla
  // (que si sobrevive el clonado normal: es un "background-image" de CSS,
  // no algo dibujado en el canvas).
  const canvasOriginales = document.querySelectorAll('canvas');
  const canvasClonados = clon.querySelectorAll('canvas');
  canvasOriginales.forEach((original, indice) => {
    const destino = canvasClonados[indice];
    if (!destino) return;
    const imagen = document.createElement('img');
    imagen.src = original.toDataURL('image/png');
    imagen.className = destino.className;
    destino.replaceWith(imagen);
  });

  // Sin <script> del libro: no queremos que la actividad se vuelva a montar
  // desde cero dentro del iframe (cada crearXxx() empieza con
  // "raiz.innerHTML = ''", así que volver a correrlas borraría las
  // respuestas y las cuerdas SVG ya dibujadas que acabamos de copiar
  // arriba). El HTML clonado ya trae todo lo necesario: los widgets ya
  // montados, con su estado actual.
  clon.querySelectorAll('script').forEach(s => s.remove());

  // El widget "Relacionar — Unir con líneas" fija su SVG con un "viewBox"
  // capturado al MONTARSE (ver su código fuente) — funciona bien porque el
  // navegador lo estira solo cuando el bloque cambia de ancho, SIN
  // necesitar JS. La cuerda nace/muere ADENTRO de cada tarjeta (tapada por
  // su fondo opaco, el SVG va detrás — ver "MARGEN_TARJETA_PX" en la fuente
  // del widget), así que ya no hace falta apuntar con precisión a un punto
  // chico: un margen de varios píxeles entre el dispositivo donde se
  // respondió y donde se imprime deja de notarse. Este script, de todas
  // formas, es un refuerzo barato: recalcula el extremo exacto según dónde
  // están REALMENTE las tarjetas a los 816px de esta impresión — no vuelve
  // a montar nada (nunca podría perder respuestas), identificando cada
  // cuerda por "data-widget-relacionar"/"data-izquierda"/"data-derecha"
  // (ver el código fuente de "relacionar" en el proyecto "funciones").
  const recalculo = document.createElement('script');
  recalculo.textContent = `
    function recalcularRelacionar() {
      var MARGEN_TARJETA_PX = 26;
      document.querySelectorAll('[data-widget-relacionar]').forEach(function (envoltorio) {
        // Igual que al montar (ver "sincronizarAnchoTarjetas" y
        // "sincronizarAlturaTarjetas" en la fuente de "relacionar"):
        // primero el ANCHO de cada columna (a la tarjeta más ancha de ESE
        // lado), después el ALTO (a la más alta de las dos columnas) — el
        // ancho de una tarjeta cambia cuántas líneas necesita su texto, así
        // que el alto se tiene que medir DESPUÉS. Los dos se fijaron una
        // sola vez al montarse, en el dispositivo del estudiante (ej.
        // celular angosto) — a los 816px de esta impresión el texto
        // envuelve distinto y esos valores viejos ya no le alcanzan a la
        // tarjeta más larga (o le sobran a las demás), así que se ven de
        // tamaños distintos en vez de parejas. Como acá no corre ningún
        // script del libro, nadie más vuelve a hacer este paso.
        ['izquierda', 'derecha'].forEach(function (lado) {
          var deEsteLado = envoltorio.querySelectorAll('button[data-lado="' + lado + '"]');
          deEsteLado.forEach(function (b) { b.style.minWidth = ''; });
          var anchoMaximo = 0;
          deEsteLado.forEach(function (b) {
            var w = b.getBoundingClientRect().width;
            if (w > anchoMaximo) anchoMaximo = w;
          });
          deEsteLado.forEach(function (b) { b.style.minWidth = anchoMaximo + 'px'; });
        });

        var botones = envoltorio.querySelectorAll('button[data-lado]');
        botones.forEach(function (b) { b.style.height = 'auto'; });
        var alturaMaxima = 44;
        botones.forEach(function (b) {
          if (b.scrollHeight > alturaMaxima) alturaMaxima = b.scrollHeight;
        });
        botones.forEach(function (b) { b.style.height = alturaMaxima + 'px'; });

        var svg = envoltorio.querySelector('svg');
        if (!svg || !svg.viewBox || !svg.viewBox.baseVal) return;
        var vb = svg.viewBox.baseVal;
        function borde(boton, lado) {
          var r = boton.getBoundingClientRect();
          var s = svg.getBoundingClientRect();
          var xPx = (lado === 'izquierda' ? r.right - MARGEN_TARJETA_PX : r.left + MARGEN_TARJETA_PX) - s.left;
          var yPx = r.top + r.height / 2 - s.top;
          return {
            x: s.width > 0 ? (xPx / s.width) * vb.width : 0,
            y: s.height > 0 ? (yPx / s.height) * vb.height : 0,
          };
        }
        function sag(x1, x2) {
          return Math.min(70, 20 + Math.abs(x2 - x1) * 0.12);
        }
        function curva(x1, y1, x2, y2, s) {
          var mx = (x1 + x2) / 2;
          var my = (y1 + y2) / 2 + s;
          return 'M ' + x1 + ' ' + y1 + ' Q ' + mx + ' ' + my + ' ' + x2 + ' ' + y2;
        }
        svg.querySelectorAll('g[data-izquierda]').forEach(function (grupo) {
          var iz = grupo.getAttribute('data-izquierda');
          var de = grupo.getAttribute('data-derecha');
          var botonIz = envoltorio.querySelector('button[data-lado="izquierda"][data-indice="' + iz + '"]');
          var botonDe = envoltorio.querySelector('button[data-lado="derecha"][data-indice="' + de + '"]');
          if (!botonIz || !botonDe) return;
          var p1 = borde(botonIz, 'izquierda');
          var p2 = borde(botonDe, 'derecha');
          var d = curva(p1.x, p1.y, p2.x, p2.y, sag(p1.x, p2.x));
          grupo.querySelectorAll('path').forEach(function (p) {
            p.setAttribute('d', d);
          });
        });
      });
    }
    // Tres pasadas:
    //  1) inmediata: cubre el caso normal.
    //  2) con un margen (200ms): una imagen cercana que todavía esté
    //     cargando (sin alto reservado) puede correr el layout un poco
    //     DESPUÉS de la primera medición; esta la agarra ya asentada.
    //  3) en "beforeprint": las DOS primeras miden el layout de PANTALLA
    //     del iframe (el "@media print" del libro — que achica el tamaño
    //     de letra y el espaciado para ahorrar hojas, ver tailwind.css —
    //     todavía NO está activo ahí), así que el texto envuelve distinto
    //     una vez que la impresión real empieza y esas dos pasadas quedan
    //     desactualizadas. "beforeprint" en Chrome de escritorio dispara
    //     justo cuando los estilos de impresión YA se aplicaron, así que
    //     alcanza a corregir con el envoltorio de texto real que vale para
    //     la hoja.
    recalcularRelacionar();
    setTimeout(recalcularRelacionar, 200);
    window.addEventListener('beforeprint', recalcularRelacionar);
  `;
  clon.querySelector('body')?.appendChild(recalculo);

  // Organizadores gráficos: sus líneas son coordenadas medidas en pantalla.
  // A los 816px (y con el tamaño de letra de impresión) los nodos se mueven,
  // así que se re-trazan dentro del iframe con las mismas tres pasadas que
  // "Relacionar" (ver comentario arriba). Las funciones son autocontenidas
  // a propósito para poder serializarlas con toString().
  if (clon.querySelector('.org-arbol')) {
    const organizadores = document.createElement('script');
    organizadores.textContent = `
      (function () {
        var trazar = ${trazarConexiones.toString()};
        var ajustar = ${ajustarOrganizadoresParaImprimir.toString()};
        function pasada() { ajustar(document, trazar); }
        pasada();
        setTimeout(pasada, 200);
        window.addEventListener('beforeprint', pasada);
      })();
    `;
    clon.querySelector('body')?.appendChild(organizadores);
  }

  return clon.outerHTML;
}

/**
 * Imprime la actividad SIEMPRE a un ancho fijo tipo "hoja/PC"
 * (ANCHO_IMPRESION_PX), sin importar si el dispositivo real es un celular o
 * una computadora.
 *
 * ¿Por qué? Varios widgets (ej. "Relacionar — Unir con líneas") miden
 * posiciones en píxeles al montarse y arman una vista (cuerdas SVG) que
 * asume que el layout no da saltos drásticos después. Si un estudiante hace
 * la actividad en el celular (pantalla angosta) e imprime desde ahí, el
 * motor de impresión arma la hoja a un ancho de página bastante más ancho
 * (~800px) — un cambio de layout que el JS de la página NO tiene garantía
 * de alcanzar a corregir a tiempo, sobre todo en los flujos de
 * imprimir/exportar-PDF de navegadores móviles. Montar SIEMPRE la actividad
 * a este mismo ancho fijo antes de imprimir elimina ese salto de raíz: el
 * ancho de montaje y el ancho de impresión terminan siendo el mismo número,
 * pase lo que pase con el dispositivo real.
 *
 * Se usa un <iframe> (no un <div> escalado con CSS) porque un iframe arma
 * su propio contexto de navegación con su propio viewport — los
 * breakpoints responsive de Tailwind (que reaccionan al ancho de PANTALLA,
 * no al ancho de un contenedor cualquiera) se resuelven según el ancho del
 * iframe, no el del dispositivo real.
 */
export function imprimirActividad(): void {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.top = '-10000px';
  iframe.style.left = '-10000px';
  iframe.style.width = `${ANCHO_IMPRESION_PX}px`;
  // El alto no necesita coincidir con el contenido real: @page pagina el
  // documento igual, sea cual sea el alto visible del iframe.
  iframe.style.height = '1200px';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  function limpiar(): void {
    iframe.remove();
  }

  iframe.addEventListener('load', () => {
    const ventana = iframe.contentWindow;
    if (!ventana) {
      limpiar();
      return;
    }
    // El margen (400ms) le da tiempo al navegador a terminar de aplicar
    // layout/estilos al nuevo ancho, Y a que corra la segunda pasada del
    // script de recálculo de "Relacionar" (agendada a los 200ms, ver
    // clonarParaImprimir) antes de imprimir. A propósito NO se usa
    // requestAnimationFrame para este margen: los navegadores PAUSAN por
    // completo el rAF en documentos/pestañas no visibles (ej. si el flujo
    // de compartir/imprimir del celular esconde la pestaña un instante), lo
    // que dejaría este código esperando para siempre. setTimeout no se
    // pausa así.
    setTimeout(() => {
      ventana.focus();
      ventana.print();
      // No hay evento confiable de "diálogo de impresión cerrado" en todos
      // los navegadores/móviles — se limpia el iframe con un margen amplio
      // en vez de dejarlo pegado en el DOM para siempre.
      setTimeout(limpiar, 60_000);
    }, 400);
  });

  iframe.srcdoc = clonarParaImprimir();
}
