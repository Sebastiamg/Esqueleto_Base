// Tipos de "renglones.js", generados automáticamente desde
// src/funciones/renglones/index.ts — no editar a mano.
/// <reference path="./comun.d.ts" />

/**
 * ============================================================================
 *  Renglones
 * ============================================================================
 *
 * ¿Qué hace?
 * Crea campos de texto "de cuaderno": renglones dibujados con líneas
 * horizontales que empiezan con una cantidad mínima de líneas y crecen
 * solos a medida que el estudiante escribe más — y si borra todo, vuelven
 * a encogerse a su tamaño mínimo (nunca más chico que eso). Es pura
 * "maquetación" — no se califica, no hay respuesta correcta.
 *
 * Tiene DOS modos, según cómo la llames:
 *
 * 1) SIN NINGÚN PARÁMETRO — `crearRenglones()` — modo automático: busca en
 *    TODO el documento los `<div>` que tengan la clase `bookText` MÁS una
 *    clase `lnN` (ej. `ln3`) — "N" es cuántos renglones tiene ese campo al
 *    empezar — y convierte cada uno en un campo de renglones. Útil para
 *    maquetar un libro donde ya dejaste los `<div class="bookText ln3">`
 *    marcando dónde va cada espacio de escritura, sin tener que llamar la
 *    función una por una.
 *
 * 2) CON `id` Y `config` — `crearRenglones(1, { preguntas: [...] })` —
 *    arma una lista de preguntas numeradas (a, b, c… o con puntos simples,
 *    según `config.numeracion`) dentro de `#p1act`, cada una con su propio
 *    campo de renglones debajo (1 renglón inicial por defecto). La
 *    pregunta se muestra en cursiva para distinguirla claramente del
 *    espacio de respuesta. Cada `pregunta` admite HTML (se inserta con
 *    `innerHTML`, no como texto plano) — útil para negritas, cursivas,
 *    `<sub>`/`<sup>` (fórmulas químicas/matemáticas), saltos de línea, etc.
 *
 * Esta función NO SE CALIFICA — no hay nada que responder "bien" o "mal".
 * Por eso revisar()/obtenerResultado() solo existen para cumplir el mismo
 * contrato que el resto de funciones; siempre devuelven un resultado
 * neutro y NUNCA escriben nada en un input de nota. reiniciar() sí hace
 * algo útil aquí: borra lo escrito en todos los campos que esta llamada
 * creó (o encontró, en modo automático) y los regresa a su tamaño mínimo.
 *
 * IMPORTANTE: en el modo con `id`, la función NUNCA crea el contenedor —
 * debe existir ya en tu HTML. En el modo automático no hace falta ningún
 * contenedor propio: los `<div class="bookText lnN">` ya son el contenedor
 * de cada campo.
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   Modo automático:
 *     <div class="bookText ln2"></div>
 *     <div class="bookText ln4"></div>
 *     <script>crearRenglones();</script>
 *
 *   Modo con preguntas:
 *     <div id="p1act"></div>
 *     <script>
 *       const instancia = crearRenglones(1, {
 *         preguntas: [
 *           '¿Qué descubrimientos permitieron modificar los modelos atómicos?',
 *           '¿Cuáles fueron los principales aportes y limitaciones de cada modelo?',
 *         ],
 *         numeracion: 'letras',
 *       });
 *     </script>
 *
 * `crearRenglones` devuelve una instancia con:
 *   - revisar() / obtenerResultado(): no califican nada, devuelven siempre
 *     { correctas: 0, total: 0, porcentaje: 0, nota: 0 } y no escriben
 *     ninguna nota (el campo "nota" existe solo por consistencia de forma
 *     con el resto del catálogo, nunca se usa de verdad aquí).
 *   - reiniciar(): borra lo escrito en todos los campos y los regresa a su
 *     tamaño mínimo.
 * ============================================================================
 */
type NumeracionRenglones = 'letras' | 'puntos';
interface RenglonesConfig {
    /**
     * Preguntas a mostrar, cada una con su propio campo de renglones debajo.
     * Admite HTML (se inserta con innerHTML, no como texto plano) — útil
     * para negritas, cursivas, `<sub>`/`<sup>` (fórmulas), etc.
     */
    preguntas: string[];
    /** 'letras' (a, b, c… — por defecto) o 'puntos' (marcador simple, como un <ul>). */
    numeracion?: NumeracionRenglones;
    /** Renglones iniciales de cada campo. Por defecto 1. */
    lineasIniciales?: number;
}
interface RenglonesResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Siempre 0 — esta actividad no se califica, "nota" existe solo por consistencia de forma con el resto del catálogo. */
    nota: number;
}
interface RenglonesInstancia {
    revisar(): RenglonesResultado;
    obtenerResultado(): RenglonesResultado;
    reiniciar(): void;
}
declare function crearRenglones(id?: IdentificadorActividad, config?: RenglonesConfig, _puntaje?: number): RenglonesInstancia;
