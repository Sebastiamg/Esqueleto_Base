// Tipos de "verdaderoFalso.js", generados automáticamente desde
// src/funciones/verdaderoFalso/index.ts — no editar a mano.
/// <reference path="./comun.d.ts" />

/**
 * ============================================================================
 *  Verdadero / Falso
 * ============================================================================
 *
 * ¿Qué hace?
 * Muestra una lista de enunciados, cada uno con dos botones tipo píldora
 * ("V" y "F") para que el estudiante marque su respuesta. Incluye un botón
 * "Revisar respuestas" que pinta cada tarjeta en verde o rojo, calcula el
 * puntaje y lo escribe en el input de nota del libro.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById) y usa el contenedor para pintar las tarjetas y
 * el input para escribirle el valor calculado.
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     // "1" -> busca el contenedor #p1act y, al revisar, el input #pre1a.
 *     // Ambos deben existir ya en el HTML de arriba. Vale 2 puntos.
 *     const instancia = crearVerdaderoFalso(1, {
 *       items: [
 *         { enunciado: 'El sol es una estrella.', correcta: 'V' },
 *         { enunciado: 'La Luna emite luz propia.', correcta: 'F' },
 *       ],
 *     }, 2);
 *
 *     // cuando quieras calificar (ej. dentro de tu función total()):
 *     const resultado = instancia.revisar();
 *     // resultado = { correctas, total, porcentaje, nota }
 *     // "nota" es un NÚMERO (resultado.porcentaje * 2, redondeado a 2
 *     // decimales) — el mismo valor que ya quedó escrito (como texto) en
 *     // #pre1a.value, por si lo necesitas sin leer el input.
 *   </script>
 *
 * El primer parámetro identifica la actividad, con 3 formas posibles:
 *   - número (ej. 1)      -> busca "#p1act",   y al revisar "#pre1a"
 *   - string (ej. "2_2")  -> busca "#p2_2act", y al revisar "#pre2_2a"
 *   - un HTMLElement ya existente -> se usa tal cual como contenedor, y
 *     NO se busca ningún input de nota (útil para demos o casos donde no
 *     hay un input "preXa" real).
 *
 * El tercer parámetro (`puntaje`, opcional) es cuántos puntos vale la
 * pregunta completa — si no se manda, vale 1. La nota que se escribe en
 * el input es siempre `resultado.porcentaje * puntaje`.
 *
 * `datos.aleatorio` (por defecto true) baraja el orden de las preguntas;
 * pon false para mantener el orden de "items". No afecta la calificación —
 * cada tarjeta sigue sabiendo cuál es su propia respuesta.
 *
 * Calificación: cada pregunta ya trae su propia respuesta correcta fija
 * (V o F) — no es una lista de opciones independientes como en Selección
 * Múltiple, así que cada pregunta vale 1/total. Acertarla suma 1/total;
 * marcarla mal resta solo la MITAD de eso ((1/total)/2), para que una sola
 * respuesta mala no sea tan drástica; dejarla en blanco no suma ni resta
 * (pero sigue contando como incorrecta al pintar). El resultado nunca baja
 * de 0.
 *
 * `crearVerdaderoFalso` devuelve una instancia con:
 *   - revisar(): califica, pinta cada tarjeta, escribe la nota en el input
 *     (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra selecciones y colores, deja todo en blanco.
 * ============================================================================
 */
interface VerdaderoFalsoItem {
    /** Admite HTML (se inserta con innerHTML, no como texto plano). */
    enunciado: string;
    correcta: 'V' | 'F';
}
interface VerdaderoFalsoDatos {
    items: VerdaderoFalsoItem[];
    /** Baraja el orden de las preguntas. Por defecto true. */
    aleatorio?: boolean;
}
interface VerdaderoFalsoResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface VerdaderoFalsoInstancia {
    revisar(): VerdaderoFalsoResultado;
    obtenerResultado(): VerdaderoFalsoResultado;
    reiniciar(): void;
}
declare function crearVerdaderoFalso(id: IdentificadorActividad, datos: VerdaderoFalsoDatos, puntaje?: number): VerdaderoFalsoInstancia;
