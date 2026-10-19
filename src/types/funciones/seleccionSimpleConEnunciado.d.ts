// Tipos de "seleccionSimpleConEnunciado.js", generados automáticamente desde
// src/funciones/seleccionSimpleConEnunciado/index.ts — no editar a mano.
/// <reference path="./comun.d.ts" />

/**
 * ============================================================================
 *  Selección simple — con enunciado
 * ============================================================================
 *
 * ¿Qué hace?
 * Muestra una lista de enunciados, cada uno con varias opciones (A, B, C…)
 * de las que el estudiante elige una sola. Incluye revisión con puntaje:
 * pinta la opción elegida en verde o rojo según si acertó, calcula el
 * puntaje y lo escribe en el input de nota del libro.
 *
 * (Existe también crearSeleccionSimpleSinEnunciado, para cuando no hay una
 * pregunta visible y el estudiante solo elige entre varias opciones sueltas.)
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearSeleccionSimpleConEnunciado(1, {
 *       items: [
 *         {
 *           enunciado: '¿Cuál es la capital de Ecuador?',
 *           opciones: ['Guayaquil', 'Quito', 'Cuenca'],
 *           correcta: 1,
 *         },
 *       ],
 *     }, 2);
 *
 *     const resultado = instancia.revisar();
 *     // resultado = { correctas, total, porcentaje, nota }
 *     // "nota" es un NÚMERO (resultado.porcentaje * 2, redondeado a 2
 *     // decimales) — el mismo valor que ya quedó escrito (como texto) en
 *     // #pre1a.value, por si lo necesitas sin leer el input.
 *   </script>
 *
 * `correcta` es el índice (empieza en 0) de la opción correcta dentro de
 * `opciones`. El primer parámetro (id) y el tercero (puntaje) funcionan
 * igual que en el resto de funciones — ver utilidades/contenedor.ts.
 *
 * `datos.aleatorio` (por defecto true) baraja el orden de las preguntas;
 * pon false para mantener el orden de "items". No afecta la calificación.
 *
 * `crearSeleccionSimpleConEnunciado` devuelve una instancia con:
 *   - revisar(): califica, pinta cada tarjeta, escribe la nota en el input
 *     (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra selecciones y colores, deja todo en blanco.
 * ============================================================================
 */
interface SeleccionSimpleConEnunciadoItem {
    /** Admite HTML (se inserta con innerHTML, no como texto plano). */
    enunciado: string;
    /** Cada opción admite HTML (se inserta con innerHTML, no como texto plano). */
    opciones: string[];
    correcta: number;
}
interface SeleccionSimpleConEnunciadoDatos {
    items: SeleccionSimpleConEnunciadoItem[];
    /** Baraja el orden de las preguntas. Por defecto true. */
    aleatorio?: boolean;
}
interface SeleccionSimpleConEnunciadoResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface SeleccionSimpleConEnunciadoInstancia {
    revisar(): SeleccionSimpleConEnunciadoResultado;
    obtenerResultado(): SeleccionSimpleConEnunciadoResultado;
    reiniciar(): void;
}
declare function crearSeleccionSimpleConEnunciado(id: IdentificadorActividad, datos: SeleccionSimpleConEnunciadoDatos, puntaje?: number): SeleccionSimpleConEnunciadoInstancia;
