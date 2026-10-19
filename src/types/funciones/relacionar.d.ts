// Tipos de "relacionar.js", generados automáticamente desde
// src/funciones/relacionar/index.ts — no editar a mano.
/// <reference path="./comun.d.ts" />

/**
 * ============================================================================
 *  Relacionar — Unir con líneas
 * ============================================================================
 *
 * ¿Qué hace?
 * Dos columnas de tarjetas (izquierda = "respuesta", derecha = "item"). El
 * estudiante traza "cuerdas" (curvas SVG con caída tipo gravedad) tocando
 * una tarjeta de un lado y luego una del otro para conectarlas — cada
 * cuerda nace/muere escondida detrás de su tarjeta (el SVG va detrás) y
 * solo se ve el tramo que cruza el hueco entre columnas.
 *
 * Cada tarjeta se ajusta al ancho de la más ancha DENTRO DE SU MISMA
 * COLUMNA (nunca al ancho completo de la columna del grid) — una palabra
 * corta ("Aves") no termina angosta ni al lado de una caja enorme y vacía:
 * queda del mismo tamaño que sus vecinas de ese lado. Ambas columnas quedan
 * pegadas hacia el hueco central (la izquierda por su borde derecho, la
 * derecha por su borde izquierdo), así el punto de donde nace/muere cada
 * cuerda queda siempre en el mismo lugar sin importar qué tan angosta sea
 * una tarjeta puntual.
 *
 * Los datos se dan como una lista plana de pares correctos ("datos.pares"):
 * cada objeto es { item, respuesta }. Las columnas (izquierda/derecha) se
 * derivan solas quitando duplicados, en el orden en que aparecen. Repetir
 * el mismo "item" o la misma "respuesta" en varios pares es lo que da
 * uno-a-muchos/muchos-a-muchos — no hay que armar índices a mano.
 *
 * "datos.aleatorio" (por defecto true) baraja el orden de las tarjetas de
 * cada columna; pon false para mantener el orden de "datos.pares". Las
 * relaciones se califican sobre el par correcto, nunca sobre el orden
 * visual, así que desactivarlo no afecta la calificación.
 *
 * "datos.tipo" (por defecto 'uno_a_uno') define cómo se corrige un error
 * al conectar, para que el estudiante pueda arreglarse solo sin un botón
 * de reiniciar:
 *   - 'uno_a_uno': cada tarjeta (de cualquier lado) admite máximo UNA
 *     conexión — conectar una tarjeta que ya tenía otra conexión borra la
 *     anterior sola.
 *   - 'uno_a_muchos': cada tarjeta de la IZQUIERDA ("respuesta") admite
 *     máximo una conexión (conectarla de nuevo borra la anterior), pero
 *     una tarjeta de la DERECHA ("item") puede recibir varias.
 *   - 'muchos_a_muchos': sin restricciones, cualquier tarjeta puede tener
 *     varias conexiones a la vez.
 * En los tres casos, tocar una cuerda ya trazada la borra, y tocar la
 * misma pareja ya conectada también la borra (toggle).
 *
 * Estándar de calificación (Sistema B aplicado a pares): cada combinación
 * POSIBLE izquierda×derecha es un "ítem" marcable de forma independiente
 * (como una casilla de Selección Múltiple) — las que aparecen en
 * "datos.pares" son las correctas.
 *   totalCorrectas = cantidad de pares correctos definidos
 *   totalOpciones  = izquierda.length * derecha.length (todas las parejas posibles)
 *   cada cuerda que coincide con un par correcto (acierto) -> suma 1/totalCorrectas
 *   cada cuerda que NO coincide con ningún par (error) -> resta 1/totalOpciones
 *   nota = aciertos/totalCorrectas − errores/totalOpciones, sin bajar de 0
 * No trazar ninguna cuerda da 0 de forma natural; trazar absolutamente
 * todas las combinaciones posibles también se fuerza a 0 (igual que en
 * Selección Múltiple).
 *
 * Al calificar, las cuerdas SIEMPRE se pintan (verde/roja) — el color de
 * marca (violeta, ámbar, etc.) es exclusivo de mientras se está
 * conectando, nunca se usa verde/rojo antes de calificar. Además, SOLO en
 * 'uno_a_uno' (donde cada tarjeta tiene una sola conexión posible, así que
 * el veredicto no es ambiguo) también se pinta la tarjeta completa y su
 * círculo, de los dos lados; en 'uno_a_muchos'/'muchos_a_muchos' una
 * tarjeta puede tener varias conexiones con veredictos distintos a la vez,
 * así que ahí solo se pintan las cuerdas.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Las cuerdas ya trazadas se ven bien sin importar el ancho/alto real que
 * tenga el bloque al momento de imprimir, exportar a PDF, hacer zoom,
 * redimensionar la ventana o rotar el celular — INCLUSO si JavaScript no
 * llega a correr en ese momento (el caso real de imprimir: el motor de
 * impresión de un navegador arma su propia versión del layout en un paso
 * que la página no puede observar ni interceptar a tiempo). La solución de
 * raíz es que el SVG tiene un "viewBox" fijado al tamaño que el bloque
 * tenía al montarse — el propio motor de renderizado (el mismo en pantalla
 * o al imprimir) estira ese sistema de coordenadas para llenar el tamaño
 * real en cada momento, sin que ninguna cuerda necesite recalcularse por
 * JS. Además, tres mecanismos (requestAnimationFrame en bucle,
 * ResizeObserver y "beforeprint") afinan la posición con las coordenadas
 * EXACTAS cuando JS sí alcanza a correr (uso normal en pantalla).
 *
 * El alto de TODAS las tarjetas (de las dos columnas) se iguala al montar
 * la actividad, a la altura máxima que necesita cualquiera de ellas — así
 * el alto total del bloque NUNCA cambia aunque el texto envuelva distinto
 * a un ancho de página distinto al de la pantalla (ej. al imprimir). Esto
 * es clave para que el "viewBox" de arriba estire las cuerdas de forma
 * proporcional y correcta: si el alto cambiara junto con el ancho, un
 * estiramiento no uniforme (ancho y alto en proporciones distintas)
 * exageraría o aplanaría la curva de cada cuerda.
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Relaciona cada figura literaria con su ejemplo.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearRelacionar(1, {
 *       tipo: 'uno_a_uno',
 *       pares: [
 *         { item: 'Personificación', respuesta: 'El viento susurraba secretos entre los árboles.' },
 *         { item: 'Anáfora', respuesta: 'Nunca, nunca olvidaré ese día.' },
 *         { item: 'Hipérbole', respuesta: 'Lloré un océano de lágrimas por su partida.' },
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
 * `crearRelacionar` devuelve una instancia con:
 *   - revisar(): califica, pinta el feedback, escribe la nota en el input
 *     (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra todas las cuerdas y el feedback, deja todo en blanco.
 * ============================================================================
 */
type TipoRelacion = 'uno_a_uno' | 'uno_a_muchos' | 'muchos_a_muchos';
interface RelacionarPar {
    /** Columna derecha. Admite HTML (se inserta con innerHTML, no como texto plano). */
    item: string;
    /** Columna izquierda. Admite HTML (se inserta con innerHTML, no como texto plano). */
    respuesta: string;
}
interface RelacionarDatos {
    pares: RelacionarPar[];
    /** Por defecto 'uno_a_uno'. */
    tipo?: TipoRelacion;
    /** Baraja el orden de las tarjetas de cada columna. Por defecto true. */
    aleatorio?: boolean;
}
interface RelacionarResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface RelacionarInstancia {
    revisar(): RelacionarResultado;
    obtenerResultado(): RelacionarResultado;
    reiniciar(): void;
}
declare function crearRelacionar(id: IdentificadorActividad, datos: RelacionarDatos, puntaje?: number): RelacionarInstancia;
