// Tipos de "panelInformativo.js", generados automáticamente desde
// src/funciones/panelInformativo/index.ts — no editar a mano.
/// <reference path="./comun.d.ts" />

/**
 * ============================================================================
 *  Panel informativo
 * ============================================================================
 *
 * ¿Qué hace?
 * Arma un bloque de contenido (no una actividad): un título, un fondo de
 * color pastel aleatorio, un texto explicativo, opcionalmente una imagen
 * (a la izquierda, derecha, arriba o abajo del texto — las de los lados
 * quedan centradas verticalmente, las de arriba/abajo centradas y
 * apiladas), y opcionalmente una cita/fuente pequeña abajo a la derecha
 * (como una referencia bibliográfica). Es puro "generación de DOM" para
 * introducir un tema — piensa en la típica caja de "¿Sabías que...?" o la
 * introducción de una unidad.
 *
 * `datos.ajusteImagen` controla cómo se acomoda una imagen que NO es
 * cuadrada: `'cubrir'` (por defecto) la rellena en una caja de alto fijo,
 * recortando lo que sobre por los lados (como antes); `'original'` NUNCA
 * recorta — respeta su relación de aspecto real (una foto muy alta o muy
 * ancha se ve completa) y solo la reduce si no cabe en el bloque.
 *
 * `datos.titulo` y `datos.texto` admiten HTML (se insertan con `innerHTML`,
 * no como texto plano) — muchas preguntas de libro necesitan negritas,
 * cursivas, `<sub>`/`<sup>` (fórmulas químicas/matemáticas), saltos de
 * línea, etc.
 *
 * Con la imagen a un lado ('izquierda'/'derecha'), el paso a fila usa un
 * CONTAINER QUERY (mide el ancho real de ESTE bloque) en vez del breakpoint
 * de viewport de Tailwind — un libro digital suele mostrar este panel
 * dentro de una columna angosta (un lector/iframe embebido, no la pantalla
 * completa), así que el viewport puede ser de escritorio aunque el panel
 * tenga poco espacio real; con un breakpoint de viewport eso mantenía la
 * imagen y el texto lado a lado con el texto aplastado a una palabra por
 * línea. Con el container query, la imagen baja a apilarse automáticamente
 * en cuanto el BLOQUE (no la pantalla) se queda sin espacio.
 *
 * Esta actividad NO SE CALIFICA — no hay nada que responder. Por eso
 * revisar()/obtenerResultado() solo existen para cumplir el mismo contrato
 * que el resto de funciones (por si el libro llama instancia.revisar() en
 * bloque junto con actividades que sí califican); siempre devuelven un
 * resultado neutro y NUNCA escriben nada en un input de nota — de hecho,
 * esta función ni siquiera necesita que exista un input "preXa" en tu HTML.
 * reiniciar() tampoco hace nada (no hay ninguna selección que borrar).
 *
 * IMPORTANTE: la función NUNCA crea el contenedor — debe existir ya en tu
 * HTML. La función solo lo busca (con document.getElementById).
 *
 * El panel siempre ocupa el 100% del ancho disponible: la función le fuerza
 * `width: 100%` al propio contenedor (el div del "id"), así no importa si
 * el HTML del libro no le dio un ancho explícito (ej. dentro de un
 * contenedor flex/grid que dejaría un div vacío en su ancho mínimo de
 * "fit-content", angostando todo el panel).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <div id="p1act"></div>
 *
 *   <script>
 *     const instancia = crearPanelInformativo(1, {
 *       titulo: '¿Cómo ha cambiado nuestra comprensión del átomo?',
 *       texto: 'A lo largo de la historia, distintos científicos propusieron modelos para explicar la estructura del átomo...',
 *       imagen: 'https://.../atomo.jpg',
 *       posicionImagen: 'derecha',
 *       cita: 'Hird, 2026.',
 *     });
 *   </script>
 *
 * El primer parámetro (id) funciona igual que en el resto de funciones —
 * ver utilidades/contenedor.ts. El tercer parámetro (puntaje) se acepta por
 * consistencia con el contrato general, pero esta función lo ignora por
 * completo (no se califica).
 *
 * `crearPanelInformativo` devuelve una instancia con:
 *   - revisar() / obtenerResultado(): no califican nada, devuelven siempre
 *     { correctas: 0, total: 0, porcentaje: 0, nota: 0 } y no escriben
 *     ninguna nota (el campo "nota" existe solo por consistencia de forma
 *     con el resto del catálogo, nunca se usa de verdad aquí).
 *   - reiniciar(): no hace nada (no hay ningún estado que borrar).
 * ============================================================================
 */
type PosicionImagenPanel = 'izquierda' | 'derecha' | 'arriba' | 'abajo';
type AjusteImagenPanel = 'cubrir' | 'original';
interface PanelInformativoDatos {
    /**
     * Título del panel (se muestra en negrita, centrado si no hay imagen).
     * Admite HTML (se inserta con innerHTML, no como texto plano).
     */
    titulo: string;
    /**
     * Texto explicativo del panel. Admite HTML (se inserta con innerHTML, no
     * como texto plano) — útil para negritas, cursivas, <sub>/<sup>
     * (fórmulas), saltos de línea, etc.
     */
    texto: string;
    /** URL de una imagen opcional. */
    imagen?: string;
    /** Texto alternativo de la imagen (accesibilidad). Por defecto usa "titulo". */
    imagenAlt?: string;
    /** Dónde va la imagen si se manda: a los lados ('izquierda'/'derecha', centrada verticalmente) o apilada ('arriba'/'abajo', centrada horizontalmente). Por defecto 'derecha'. */
    posicionImagen?: PosicionImagenPanel;
    /**
     * Cómo se acomoda una imagen que no es cuadrada. 'cubrir' (por defecto)
     * la rellena en una caja de alto fijo, recortando lo que sobre por los
     * lados — se ve prolijo con fotos "normales", pero una foto muy alta o
     * muy ancha puede perder parte del contenido. 'original' respeta su
     * relación de aspecto real (nunca recorta) y solo la reduce de tamaño si
     * no cabe en el bloque.
     */
    ajusteImagen?: AjusteImagenPanel;
    /** Cita/fuente pequeña, abajo a la derecha (ej. "Hird, 2026."). Opcional. Admite HTML (innerHTML, no texto plano). */
    cita?: string;
    /** Fondo del panel; si se omite, se usa un color pastel aleatorio (como el resto del catálogo). */
    color?: string;
}
interface PanelInformativoResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Siempre 0 — esta actividad no se califica, "nota" existe solo por consistencia de forma con el resto del catálogo. */
    nota: number;
}
interface PanelInformativoInstancia {
    revisar(): PanelInformativoResultado;
    obtenerResultado(): PanelInformativoResultado;
    reiniciar(): void;
}
declare function crearPanelInformativo(id: IdentificadorActividad, datos: PanelInformativoDatos, _puntaje?: number): PanelInformativoInstancia;
