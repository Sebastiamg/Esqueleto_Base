// Tipos de "lienzo.js", generados automáticamente desde
// src/funciones/lienzo/index.ts — no editar a mano.
/// <reference path="./comun.d.ts" />

/**
 * ============================================================================
 *  Lienzo
 * ============================================================================
 *
 * ¿Qué hace?
 * Uno o varios mini "Paint" para dibujar o pintar libremente: lápiz,
 * borrador, 4 formas básicas (rectángulo, círculo, triángulo y línea —
 * arrastrando desde donde empieza hasta donde termina la forma, con vista
 * previa en vivo), una paleta de colores (+ color personalizado), 3
 * grosores de trazo, deshacer, limpiar todo y descargar el dibujo como
 * imagen. Funciona con mouse y con dedo/lápiz táctil (Pointer Events).
 *
 * `datos` es un ARREGLO de configuraciones — uno por cada lienzo que
 * quieras en esa misma actividad (lo normal es solo uno, pero puedes pedir
 * varios, ej. "Dibuja el inicio" / "Dibuja el final" del cuento, cada uno
 * con su propio tamaño e imagen de fondo).
 *
 * Esta actividad NO SE CALIFICA — no hay una respuesta "correcta". Por eso
 * revisar()/obtenerResultado() solo existen para cumplir el mismo contrato
 * que el resto de funciones (por si el libro llama instancia.revisar() en
 * bloque junto con actividades que sí califican); siempre devuelven un
 * resultado neutro y NUNCA escriben nada en un input de nota — de hecho,
 * esta función ni siquiera necesita que exista un input "preXa" en tu HTML.
 *
 * `imagenFondo` (opcional, por lienzo) pone una imagen detrás de ESE lienzo
 * (para calcar o colorear encima, como un libro para colorear); si no la
 * mandas, el lienzo empieza en blanco. El lápiz y el borrador dibujan en
 * una capa transparente por encima — borrar revela la imagen de nuevo en
 * vez de dejar un hueco blanco.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor — debe existir ya en tu
 * HTML. La función solo lo busca (con document.getElementById).
 *
 * La barra de herramientas (colores, lápiz/borrador/formas, grosor,
 * deshacer/limpiar/descargar) lleva la clase compartida "no-print" (ver
 * style.css) — al imprimir o exportar a PDF desaparece sola (nadie puede
 * tocar un botón en papel) y solo queda el lienzo con el dibujo.
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Dibuja lo que más te gustó del cuento.</p>
 *   <div id="p1act"></div>
 *
 *   <script>
 *     const instancia = crearLienzo(1, [
 *       { ancho: 700, alto: 450 },
 *       // { titulo: 'Otra escena', ancho: 700, alto: 450, imagenFondo: 'https://.../dibujo.png' },
 *     ]);
 *   </script>
 *
 * El primer parámetro (id) funciona igual que en el resto de funciones —
 * ver utilidades/contenedor.ts. El tercer parámetro (puntaje) se acepta por
 * consistencia con el contrato general, pero esta función lo ignora por
 * completo (no se califica).
 *
 * `crearLienzo` devuelve una instancia con:
 *   - revisar() / obtenerResultado(): no califican nada, devuelven siempre
 *     { correctas: 0, total: 0, porcentaje: 0, nota: 0 } y no escriben
 *     ninguna nota (el campo "nota" existe solo por consistencia de forma
 *     con el resto del catálogo, nunca se usa de verdad aquí).
 *   - reiniciar(): borra TODOS los lienzos de la actividad, uno por uno.
 * ============================================================================
 */
interface LienzoDatos {
    /** Título opcional de este lienzo (útil cuando hay varios en la misma actividad). Admite HTML (innerHTML, no texto plano). */
    titulo?: string;
    /** Ancho lógico del lienzo en px. Por defecto 700. */
    ancho?: number;
    /** Alto lógico del lienzo en px. Por defecto 450. */
    alto?: number;
    /** Imagen de fondo opcional (para calcar o colorear encima); si se omite, el lienzo queda en blanco. */
    imagenFondo?: string;
    /** Paleta de colores disponible; si se omite, se usa una paleta por defecto. */
    colores?: string[];
    /** Color seleccionado al iniciar. Por defecto el primero de la paleta. */
    colorInicial?: string;
    /** Grosor de trazo inicial en px. Por defecto 8. */
    grosorInicial?: number;
}
interface LienzoResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Siempre 0 — esta actividad no se califica, "nota" existe solo por consistencia de forma con el resto del catálogo. */
    nota: number;
}
interface LienzoInstancia {
    revisar(): LienzoResultado;
    obtenerResultado(): LienzoResultado;
    reiniciar(): void;
}
declare function crearLienzo(id: IdentificadorActividad, datos?: LienzoDatos[], _puntaje?: number): LienzoInstancia;
