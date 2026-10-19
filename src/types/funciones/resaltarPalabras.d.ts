// Tipos de "resaltarPalabras.js", generados automáticamente desde
// src/funciones/resaltarPalabras/index.ts — no editar a mano.
/// <reference path="./comun.d.ts" />

/**
 * ============================================================================
 *  Resaltar palabras
 * ============================================================================
 *
 * ¿Qué hace?
 * Muestra un pasaje de lectura donde ciertas palabras o frases son
 * "marcables" — el estudiante hace clic en las que considera correctas
 * (ej. "resalta los sustantivos", "subraya las palabras relacionadas con el
 * cambio climático") y cada clic prende/apaga esa palabra sola, sin afectar
 * a las demás (igual mecánica que Selección Múltiple, pero incrustada
 * dentro del flujo normal del texto en vez de tarjetas sueltas).
 *
 * `datos.texto` es el pasaje completo; cada palabra o frase marcable va
 * envuelta en `datos.marcador` (por defecto `**`, como en Markdown), ej.:
 * `'El **agua** es un recurso natural, aunque a veces se desperdicia.'`.
 * Solo lo que está DENTRO del marcador se vuelve clicable — el resto del
 * pasaje es texto normal, no interactivo. `datos.correctas` son los índices
 * (empiezan en 0, en el orden en que aparecen dentro de "texto") de las
 * palabras/frases marcables que son la respuesta correcta — las demás son
 * distractores.
 *
 * A diferencia del resto del catálogo, el orden de las palabras NUNCA se
 * mezcla — es un pasaje de lectura real, reordenarlo lo volvería
 * incoherente.
 *
 * `datos.variante` es `'resaltar'` (fondo de color, como un marcador de
 * texto real — por defecto) o `'subrayar'` (una línea debajo, que se
 * dibuja más gruesa al marcar).
 *
 * Estándar de calificación (Sistema B — igual que Selección Múltiple: una
 * lista de opciones marcables independientemente, con correctas e
 * incorrectas a la vez en pantalla):
 *   - Cada ACIERTO (palabra correcta que sí marcó) suma 1/totalCorrectas.
 *   - Cada ERROR (palabra incorrecta marcada de más) resta 1/totalPalabras.
 *   nota = aciertos/totalCorrectas − errores/totalPalabras, sin bajar de 0.
 * No marcar nada da 0 de forma natural. Marcar absolutamente todas las
 * palabras marcables no es una respuesta real (nunca hay un pasaje donde
 * todas las palabras marcables sean correctas), así que esa se fuerza a 0
 * aparte — igual que en Selección Múltiple.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Resalta las palabras relacionadas con el ciclo del agua.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearResaltarPalabras(1, {
 *       texto: 'El **agua** se **evapora** con el calor del sol, sube y forma las **nubes**, que luego producen la lluvia.',
 *       correctas: [0, 1, 2],
 *       variante: 'resaltar',
 *     }, 2);
 *
 *     const resultado = instancia.revisar();
 *     // resultado = { correctas, total, porcentaje, nota }
 *     // "total" es la cantidad de palabras correctas que existen,
 *     // "correctas" es cuántas de esas SÍ marcó el estudiante.
 *     // "nota" es un NÚMERO (resultado.porcentaje * 2, redondeado a 2
 *     // decimales) — el mismo valor que ya quedó escrito (como texto) en
 *     // #pre1a.value, por si lo necesitas sin leer el input.
 *   </script>
 *
 * El primer parámetro (id) y el tercero (puntaje) funcionan igual que en
 * el resto de funciones — ver utilidades/contenedor.ts.
 *
 * `crearResaltarPalabras` devuelve una instancia con:
 *   - revisar(): califica, pinta cada palabra marcada (verde/rojo), escribe
 *     la nota en el input (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra las marcas y el feedback, deja todo en blanco.
 * ============================================================================
 */
type VarianteResaltado = 'resaltar' | 'subrayar';
interface ResaltarPalabrasDatos {
    /**
     * Pasaje de lectura; cada palabra o frase marcable va envuelta en
     * "marcador". Admite HTML (se inserta con innerHTML, no como texto
     * plano) tanto dentro como fuera de las palabras marcables.
     */
    texto: string;
    /** Índices (empiezan en 0, en el orden en que aparecen en "texto") de las palabras/frases marcables que son la respuesta correcta. */
    correctas: number[];
    /** Instrucción o consigna que se muestra arriba del pasaje (opcional). Admite HTML (innerHTML, no texto plano). */
    titulo?: string;
    /** Texto que envuelve cada palabra/frase marcable dentro de "texto". Por defecto '**'. */
    marcador?: string;
    /** 'resaltar' (fondo de color, por defecto) o 'subrayar' (línea debajo). */
    variante?: VarianteResaltado;
}
interface ResaltarPalabrasResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface ResaltarPalabrasInstancia {
    revisar(): ResaltarPalabrasResultado;
    obtenerResultado(): ResaltarPalabrasResultado;
    reiniciar(): void;
}
declare function crearResaltarPalabras(id: IdentificadorActividad, datos: ResaltarPalabrasDatos, puntaje?: number): ResaltarPalabrasInstancia;
