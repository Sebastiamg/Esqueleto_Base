// Tipos de "seleccionMultipleSinEnunciado.js", generados automáticamente desde
// src/funciones/seleccionMultipleSinEnunciado/index.ts — no editar a mano.
/// <reference path="./comun.d.ts" />

/**
 * ============================================================================
 *  Selección múltiple — sin enunciado
 * ============================================================================
 *
 * ¿Qué hace?
 * Es exactamente lo mismo que crearSeleccionSimpleSinEnunciado (mismas 5
 * variantes visuales, mismos colores, mismo modo de selección/cuadrícula),
 * con una sola diferencia: aquí el estudiante puede marcar VARIAS opciones
 * en vez de una sola — cada clic prende/apaga esa opción, no es exclusivo.
 *
 * Es un componente con 5 variantes visuales — la lógica de selección y
 * calificación es siempre la misma, lo que cambia es cómo se representa
 * visualmente que una opción está marcada:
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
 *   <p>Marca los animales que son mamíferos.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearSeleccionMultipleSinEnunciado(1, {
 *       opciones: ['Delfín', 'Tiburón', 'Ballena', 'Medusa'],
 *       correctas: [0, 2],
 *       variante: 'circulo',
 *       columna: false,
 *     }, 2);
 *
 *     const resultado = instancia.revisar();
 *     // resultado = { correctas, total, porcentaje, nota }
 *     // "total" es la cantidad de opciones correctas que existen (aquí 2),
 *     // "correctas" es cuántas de esas SÍ marcó el estudiante.
 *     // "nota" es un NÚMERO (resultado.porcentaje * 2, redondeado a 2
 *     // decimales) — el mismo valor que ya quedó escrito (como texto) en
 *     // #pre1a.value, por si lo necesitas sin leer el input.
 *   </script>
 *
 * El primer parámetro (id) y el tercero (puntaje) funcionan igual que en
 * el resto de funciones — ver utilidades/contenedor.ts. Calificación (dos
 * denominadores distintos):
 *   - Cada ACIERTO (opción correcta que sí marcó) suma 1/totalCorrectas.
 *   - Cada ERROR (opción incorrecta que marcó de más) resta 1/totalOpciones.
 *   nota = aciertos/totalCorrectas − errores/totalOpciones, sin bajar de 0.
 *   Ej.: 1 acierto de 2 correctas (+0.5) y 1 error de 4 opciones (−0.25) = 0.25.
 * No marcar nada da 0 de forma natural (0 − 0). Marcar absolutamente todas
 * las opciones no es una respuesta real (nunca hay una actividad donde
 * todas sean correctas), así que esa sí se fuerza a 0 aparte.
 *
 * `crearSeleccionMultipleSinEnunciado` devuelve una instancia con:
 *   - revisar(): califica, pinta el feedback, escribe la nota en el input
 *     (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra las selecciones y el feedback, deja todo en blanco.
 * ============================================================================
 */
type VarianteSeleccionMultiple = 'pintar' | 'subrayar' | 'check' | 'cruz' | 'circulo';
interface SeleccionMultipleSinEnunciadoDatos {
    /** Cada opción admite HTML (se inserta con innerHTML, no como texto plano). */
    opciones: string[];
    correctas: number[];
    variante?: VarianteSeleccionMultiple;
    columna?: boolean;
    /** Baraja el orden de las opciones. Por defecto true. */
    aleatorio?: boolean;
}
interface SeleccionMultipleSinEnunciadoResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface SeleccionMultipleSinEnunciadoInstancia {
    revisar(): SeleccionMultipleSinEnunciadoResultado;
    obtenerResultado(): SeleccionMultipleSinEnunciadoResultado;
    reiniciar(): void;
}
declare function crearSeleccionMultipleSinEnunciado(id: IdentificadorActividad, datos: SeleccionMultipleSinEnunciadoDatos, puntaje?: number): SeleccionMultipleSinEnunciadoInstancia;
