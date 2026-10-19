// Tipos de "completarTabla.js", generados automáticamente desde
// src/funciones/completarTabla/index.ts — no editar a mano.
/// <reference path="./comun.d.ts" />

/**
 * ============================================================================
 *  Completar tabla
 * ============================================================================
 *
 * ¿Qué hace?
 * Arma una tabla real (columnas con encabezado, celdas divididas por
 * líneas) donde algunas celdas son campos de texto que el estudiante llena
 * y otras son etiquetas fijas (no editables) que solo dan estructura —
 * por ejemplo una fila de "Total" al final de una columna de números.
 *
 * Cada columna es `{ titulo?, celdas, ancho?, alineacionHorizontal?,
 * alineacionVertical? }`. Cada celda de `celdas` es:
 *   - un string o número -> un campo de texto cuya respuesta correcta es
 *     ese valor.
 *   - `{ etiqueta: 'texto' }` -> una celda fija, no editable, que no se
 *     califica (sirve para nombres de fila, un "Total", etc.).
 *
 * `columna.alineacionHorizontal` ('izquierda' | 'centro' | 'derecha', por
 * defecto 'centro') y `columna.alineacionVertical` ('arriba' | 'centro' |
 * 'abajo', por defecto 'centro') controlan dónde queda el texto dentro de
 * cada celda de esa columna (etiquetas y campos) — el reemplazo de lo que
 * antes se hacía a mano con un objeto "styles". La vertical no tiene efecto
 * en columnas "multilinea" (el <textarea> siempre llena el alto disponible
 * para poder crecer con el texto).
 *
 * `datos.aleatorio` (por defecto true) baraja el ORDEN DE LAS FILAS (todas
 * las columnas a la vez, para no romper la alineación) — las filas que
 * tienen una etiqueta en cualquier columna se quedan fijas en su lugar
 * (para que un "Total" no termine flotando en medio de la tabla) y solo se
 * reordenan entre sí las filas de puro campo de texto. La calificación
 * nunca depende del orden.
 *
 * `datos.multilinea` (por defecto false) usa `<textarea>` en vez de
 * `<input>` y ajusta automáticamente el alto de toda la fila (en todas las
 * columnas a la vez) al contenido más alto, para que ninguna celda se vea
 * cortada. Ese alto se vuelve a calcular cada vez que cambia el ANCHO real
 * de la tabla (un `ResizeObserver` sobre el contenedor) y también justo
 * antes de imprimir (`beforeprint`) — el ancho de la página impresa casi
 * nunca es igual al del navegador, así que el mismo texto puede envolver en
 * más líneas y el alto guardado en pantalla se queda corto. El
 * `ResizeObserver` es la defensa principal: reacciona a CUALQUIER cambio de
 * ancho sin importar la causa, así que también cubre exportadores a PDF que
 * arman la página con un navegador de verdad pero sin pasar por
 * `window.print()` (donde `beforeprint` nunca se dispara).
 *
 * Estándar de calificación (Sistema A — cada celda ya trae su propia
 * respuesta correcta fija, no es una lista de opciones marcables como en
 * Selección Múltiple): cada campo de texto vale 1/total. Acertarlo (texto
 * normalizado: sin importar mayúsculas, tildes ni espacios, estén donde
 * estén) suma 1/total; escribir algo distinto resta solo la MITAD de eso
 * ((1/total)/2); dejarlo en blanco no suma ni resta (pero sigue pintándose como
 * incorrecto). `nota = (correctas − incorrectas/2) / total`, sin bajar de 0.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * La tabla siempre ocupa el 100% del ancho disponible: la función le fuerza
 * `width: 100%` al propio contenedor (el div del "id"), y cada columna se
 * dimensiona en PORCENTAJE del total (nunca en px con scroll horizontal) —
 * si no le das `ancho`, reparte el espacio parejo con las demás columnas
 * sin `ancho`. Esto es a propósito: un scroll horizontal se ve bien en
 * pantalla, pero al imprimir el libro no hay forma de "deslizar" y el
 * contenido que no cabe en el ancho de la página se corta — por eso esta
 * tabla nunca depende de scroll, ni siquiera en mobile (el texto largo se
 * envuelve dentro de su celda en vez de ensanchar la columna).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Completa el símbolo químico de cada elemento.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearCompletarTabla(1, {
 *       columnas: [
 *         { titulo: 'Elemento', celdas: [{ etiqueta: 'Hidrógeno' }, { etiqueta: 'Oxígeno' }, { etiqueta: 'Carbono' }] },
 *         { titulo: 'Símbolo', celdas: ['H', 'O', 'C'] },
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
 * `crearCompletarTabla` devuelve una instancia con:
 *   - revisar(): califica, pinta cada campo (verde/rojo), escribe la nota
 *     en el input (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra lo escrito y el feedback, deja todo en blanco.
 * ============================================================================
 */
/**
 * Una celda es un string/número (campo de texto, respuesta correcta) o
 * `{ etiqueta }` (celda fija). "etiqueta" admite HTML (se inserta con
 * innerHTML, no como texto plano).
 */
type CompletarTablaCelda = string | number | {
    etiqueta: string;
};
type AlineacionHorizontal = 'izquierda' | 'centro' | 'derecha';
type AlineacionVertical = 'arriba' | 'centro' | 'abajo';
interface CompletarTablaColumna {
    /** Texto del encabezado de la columna. Admite HTML (innerHTML, no texto plano). */
    titulo?: string;
    celdas: CompletarTablaCelda[];
    /** Ancho fijo en porcentaje; si se omite, la columna crece pareja con las demás. */
    ancho?: number;
    /** Alineación horizontal del texto de la columna (etiquetas y campos). Por defecto 'centro'. */
    alineacionHorizontal?: AlineacionHorizontal;
    /**
     * Alineación vertical de la columna. Por defecto 'centro'. Sin efecto en
     * celdas de <textarea> (columnas con "multilinea"), que siempre llenan
     * el alto disponible para poder crecer con el texto.
     */
    alineacionVertical?: AlineacionVertical;
}
interface CompletarTablaDatos {
    columnas: CompletarTablaColumna[];
    /** Título general de toda la tabla (opcional). Admite HTML (innerHTML, no texto plano). */
    titulo?: string;
    /** Baraja el orden de las filas (sin mover las que tienen etiqueta). Por defecto true. */
    aleatorio?: boolean;
    /** Usa <textarea> con autoajuste de alto en vez de <input>. Por defecto false. */
    multilinea?: boolean;
}
interface CompletarTablaResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface CompletarTablaInstancia {
    revisar(): CompletarTablaResultado;
    obtenerResultado(): CompletarTablaResultado;
    reiniciar(): void;
}
declare function crearCompletarTabla(id: IdentificadorActividad, datos: CompletarTablaDatos, puntaje?: number): CompletarTablaInstancia;
