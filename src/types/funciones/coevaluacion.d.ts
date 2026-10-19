// Tipos de "coevaluacion.js", generados automáticamente desde
// src/funciones/coevaluacion/index.ts — no editar a mano.
/// <reference path="./comun.d.ts" />

/**
 * ============================================================================
 *  Coevaluación
 * ============================================================================
 *
 * ¿Qué hace?
 * La típica tabla de autoevaluación/coevaluación: una lista de criterios y,
 * por cada uno, tres columnas — "Sí", "No" y "DM" (Debo Mejorar) — de las
 * que el estudiante marca UNA sola por fila (como un radio button).
 *
 * Estándar de calificación (no es ni Sistema A ni Sistema B — aquí no hay
 * una respuesta "correcta": las 3 opciones son válidas, pero valen distinto
 * según qué tan bien se cumplió el criterio): cada criterio vale 1/total.
 * Marcar "Sí" da el valor COMPLETO de ese criterio; marcar "No" da un valor
 * REDUCIDO (por defecto la mitad); marcar "DM" da un valor todavía más
 * chico (por defecto un cuarto) — pero NUNCA 0. Dejar una fila sin marcar
 * sí da 0 en esa fila (es la única forma de no sumar nada).
 *   nota = Σ(peso de lo marcado en cada fila) / total, sin bajar de 0
 * Ejemplo con 5 criterios (cada uno vale 0.2): 4 en "Sí" (0.2 cada uno) y 1
 * en "No" (0.1, la mitad de 0.2) → (4×0.2 + 0.1) / 5 = 0.18.
 *
 * `pesos` (opcional) cambia esas fracciones por defecto ({ si: 1, no: 0.5,
 * dm: 0.25 }) — son fracciones del valor completo de un criterio, no
 * valores absolutos.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p><strong>Evalúa</strong> tu trabajo según los criterios y <strong>completa</strong> la tabla.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearCoevaluacion(1, {
 *       criterios: [
 *         'El modelo representa correctamente la propuesta atómica asignada.',
 *         'La exposición evidencia la evolución histórica de los modelos atómicos.',
 *         'Los materiales fueron utilizados con creatividad, seguridad y responsabilidad.',
 *         'Todos los integrantes participaron activamente en la elaboración y presentación.',
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
 * El primer parámetro (id) y el tercero (puntaje) funcionan igual que en
 * el resto de funciones — ver utilidades/contenedor.ts.
 *
 * `crearCoevaluacion` devuelve una instancia con:
 *   - revisar(): califica, escribe la nota en el input (si aplica) y
 *     devuelve el resultado. "correctas" es cuántos criterios se marcaron
 *     en "Sí" (no hay "incorrectas" como tal, ver arriba).
 *   - obtenerResultado(): igual que revisar() pero sin escribir nada.
 *   - reiniciar(): borra todas las marcas, deja la tabla en blanco.
 * ============================================================================
 */
type RespuestaCoevaluacion = 'si' | 'no' | 'dm';
interface PesosCoevaluacion {
    /** Fracción del valor del criterio al marcar "Sí". Por defecto 1 (completo). */
    si?: number;
    /** Fracción del valor del criterio al marcar "No". Por defecto 0.5. */
    no?: number;
    /** Fracción del valor del criterio al marcar "DM". Por defecto 0.25. Nunca debería ser 0. */
    dm?: number;
}
interface CoevaluacionDatos {
    /** Cada criterio admite HTML (se inserta con innerHTML, no como texto plano). */
    criterios: string[];
    pesos?: PesosCoevaluacion;
}
interface CoevaluacionResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface CoevaluacionInstancia {
    revisar(): CoevaluacionResultado;
    obtenerResultado(): CoevaluacionResultado;
    reiniciar(): void;
}
declare function crearCoevaluacion(id: IdentificadorActividad, datos: CoevaluacionDatos, puntaje?: number): CoevaluacionInstancia;
