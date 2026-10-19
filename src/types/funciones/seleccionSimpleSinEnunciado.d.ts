// Tipos de "seleccionSimpleSinEnunciado.js", generados automáticamente desde
// src/funciones/seleccionSimpleSinEnunciado/index.ts — no editar a mano.
/// <reference path="./comun.d.ts" />

/**
 * ============================================================================
 *  Selección simple — sin enunciado
 * ============================================================================
 *
 * ¿Qué hace?
 * Muestra un grupo de opciones sueltas (sin una pregunta visible propia —
 * el enunciado, si existe, va en el HTML del libro, fuera de esta función)
 * de las que el estudiante elige una sola. La cantidad de opciones puede
 * variar bastante (2, 3, 5, 10...), así que por defecto se acomodan en una
 * cuadrícula flexible en vez de una lista vertical fija — si prefieres una
 * sola columna, manda `columna: true`.
 *
 * Es un componente con 5 variantes visuales — la lógica de selección y
 * calificación es siempre la misma, lo que cambia es cómo se representa
 * visualmente que una opción está seleccionada:
 *   - 'pintar'    -> la caja se rellena de color (como si el color apareciera).
 *   - 'subrayar'  -> aparece una línea debajo del texto, dibujándose.
 *   - 'check'     -> aparece un ✓ dibujándose dentro de una casilla.
 *   - 'cruz'      -> aparece una ✗ dibujándose dentro de una casilla.
 *   - 'circulo'   -> aparece un círculo dibujándose alrededor de la opción.
 * Por defecto es 'check' si no se indica.
 *
 * `datos.aleatorio` (por defecto true) baraja el orden de las opciones; pon
 * false para mantener el orden de "opciones". La calificación se resuelve
 * por el índice original, nunca por el orden visual.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Encierra la palabra que corresponde a un mamífero.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearSeleccionSimpleSinEnunciado(1, {
 *       opciones: ['Delfín', 'Tiburón', 'Pulpo', 'Medusa'],
 *       correcta: 0,
 *       variante: 'circulo',
 *       columna: false,
 *     }, 2);
 *
 *     const resultado = instancia.revisar();
 *     // resultado = { correctas, total, porcentaje, nota } (total siempre es 1)
 *     // "nota" es un NÚMERO (resultado.porcentaje * 2, redondeado a 2
 *     // decimales) — el mismo valor que ya quedó escrito (como texto) en
 *     // #pre1a.value, por si lo necesitas sin leer el input.
 *   </script>
 *
 * El primer parámetro (id) y el tercero (puntaje) funcionan igual que en
 * el resto de funciones — ver utilidades/contenedor.ts. Si no se selecciona
 * ninguna opción, la actividad cuenta como incorrecta al revisar.
 *
 * `crearSeleccionSimpleSinEnunciado` devuelve una instancia con:
 *   - revisar(): califica, pinta el feedback, escribe la nota en el input
 *     (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra la selección y el feedback, deja todo en blanco.
 * ============================================================================
 */
type VarianteSeleccionSinEnunciado = 'pintar' | 'subrayar' | 'check' | 'cruz' | 'circulo';
interface SeleccionSimpleSinEnunciadoDatos {
    /** Cada opción admite HTML (se inserta con innerHTML, no como texto plano). */
    opciones: string[];
    correcta: number;
    variante?: VarianteSeleccionSinEnunciado;
    columna?: boolean;
    /** Baraja el orden de las opciones. Por defecto true. */
    aleatorio?: boolean;
}
interface SeleccionSimpleSinEnunciadoResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface SeleccionSimpleSinEnunciadoInstancia {
    revisar(): SeleccionSimpleSinEnunciadoResultado;
    obtenerResultado(): SeleccionSimpleSinEnunciadoResultado;
    reiniciar(): void;
}
declare function crearSeleccionSimpleSinEnunciado(id: IdentificadorActividad, datos: SeleccionSimpleSinEnunciadoDatos, puntaje?: number): SeleccionSimpleSinEnunciadoInstancia;
