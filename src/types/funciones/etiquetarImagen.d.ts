// Tipos de "etiquetarImagen.js", generados automáticamente desde
// src/funciones/etiquetarImagen/index.ts — no editar a mano.
/// <reference path="./comun.d.ts" />

/**
 * ============================================================================
 *  Etiquetar imagen
 * ============================================================================
 *
 * ¿Qué hace?
 * Cualquier imagen (submarino, mapa, célula, máquina, ilustración...) con
 * "zonas" invisibles que vos posicionás a mano sobre ella (`x`, `y`, en % del
 * ancho/alto de la imagen) y un banco de opciones — el estudiante asigna cada
 * opción a la zona que le corresponde. Completamente genérica: no sabe nada
 * de qué representa la imagen ni las zonas, solo dónde están y cuál es la
 * respuesta correcta de cada una.
 *
 * Dos modos de asignar la opción a una zona (`datos.modo`):
 *   - 'arrastrar' (por defecto): el estudiante ARRASTRA una opción (una
 *     "ficha") desde el banco de opciones hasta la zona sobre la imagen.
 *     Funciona con mouse, dedo y lápiz óptico (Pointer Events, igual que
 *     Lienzo) — no depende de drag-and-drop nativo del navegador. Una ficha
 *     ya colocada se puede volver a arrastrar a otra zona (o de vuelta al
 *     banco); soltarla sobre una zona que ya tenía otra ficha reemplaza esa
 *     ficha (vuelve sola al banco), igual que Relacionar reemplaza una
 *     conexión existente al tocar una tarjeta de nuevo.
 *   - 'select': cada zona es un `<select>` (banco cerrado) posicionado
 *     directamente sobre la imagen en su `x`/`y` — sin arrastrar nada, más
 *     simple en pantallas chicas o si preferís que responda con teclado. El
 *     banco de cada `<select>` SIEMPRE se muestra en el mismo orden barajado
 *     (uno solo para toda la actividad, más fácil de escanear) y SIEMPRE es
 *     aleatorio, sin excepción — igual regla que el banco de palabras de
 *     Rellenar espacios en modo 'select'.
 *
 * `datos.zonas` es la lista de zonas: cada una es `{ x, y, ancho?, alto?,
 * respuesta }`. `x`/`y` son el CENTRO de la zona, en % del ancho/alto de la
 * imagen (0-100) — nunca en píxeles, así la posición escala sola sin
 * importar el tamaño real en pantalla (celular, tablet, PC) ni la
 * proporción de la imagen. `ancho`/`alto` (también en %, opcionales) fijan
 * el tamaño de la caja de destino en modo 'arrastrar'; en modo 'select',
 * "ancho" en cambio es el ancho del propio `<select>` (si se omite, se
 * calcula solo según la opción más larga del banco, igual que Rellenar
 * espacios). Las zonas NUNCA cambian de posición ni de orden — las ubicás
 * vos a mano, la función jamás las reordena.
 *
 * `datos.opciones` es el banco de opciones que ve el estudiante; si se
 * omite, se arma solo con las `respuesta` de todas las zonas (sin
 * duplicados) — igual que Rellenar espacios, podés mandar un banco más
 * grande con distractores sin que se desordene qué respuesta es la correcta
 * de cada zona.
 *
 * `datos.aleatorio` (por defecto true) baraja el orden del banco de
 * opciones — SOLO tiene efecto en modo 'arrastrar' (el orden en que
 * aparecen las fichas en el banco). En modo 'select' no aplica: ahí el
 * banco de cada `<select>` siempre es aleatorio, sin importar este valor
 * (misma excepción que el modo 'select' de Rellenar espacios).
 *
 * Estándar de calificación (Sistema A — cada zona ya trae su propia
 * respuesta correcta fija, no es una lista de opciones marcables como en
 * Selección Múltiple): cada zona vale 1/total. Acertarla (comparación
 * flexible: sin mayúsculas, tildes ni espacios) suma 1/total; colocar la
 * opción equivocada resta solo la MITAD de eso ((1/total)/2); dejarla vacía
 * no suma ni resta (pero sigue pintándose como incorrecta). `nota =
 * (correctas − incorrectas/2) / total`, sin bajar de 0.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Arrastra cada nombre hasta la parte del submarino que le corresponde.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearEtiquetarImagen(1, {
 *       imagen: 'submarino.png',
 *       imagenAlt: 'Ilustración de un submarino',
 *       zonas: [
 *         { x: 20, y: 12, respuesta: 'Periscopio' },
 *         { x: 62, y: 20, respuesta: 'Antena' },
 *         { x: 82, y: 46, respuesta: 'Timón' },
 *         { x: 90, y: 78, respuesta: 'Hélice' },
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
 * `crearEtiquetarImagen` devuelve una instancia con:
 *   - revisar(): califica, pinta cada zona (verde/rojo), escribe la nota en
 *     el input (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): en 'arrastrar', devuelve todas las fichas al banco (en su
 *     orden original); en 'select', vacía cada `<select>`. Deja todo en
 *     blanco y borra el feedback visual.
 * ============================================================================
 */
type ModoEtiquetarImagen = 'arrastrar' | 'select';
interface EtiquetarImagenZona {
    /** Comparación flexible: sin mayúsculas, tildes ni espacios. */
    respuesta: string;
    /** Centro de la zona, en % del ancho de la imagen (0-100). */
    x: number;
    /** Centro de la zona, en % del alto de la imagen (0-100). */
    y: number;
    /** 'arrastrar': ancho de la caja de destino, en % del ancho de la imagen. 'select': ancho del propio <select> (px); si se omite, se calcula según la opción más larga del banco. */
    ancho?: number;
    /** Alto de la caja de destino, en % del alto de la imagen. Solo aplica en modo 'arrastrar'. */
    alto?: number;
}
interface EtiquetarImagenDatos {
    /** URL de la imagen de fondo. */
    imagen: string;
    /** Texto alternativo de la imagen (accesibilidad). */
    imagenAlt?: string;
    zonas: EtiquetarImagenZona[];
    /** Banco de opciones; si se omite, se arma solo con las "respuesta" de "zonas" (sin duplicados). */
    opciones?: string[];
    /** 'arrastrar' (por defecto, arrastra fichas desde un banco) o 'select' (un <select> por zona). */
    modo?: ModoEtiquetarImagen;
    /** Baraja el orden del banco de opciones. Por defecto true. Solo aplica en modo 'arrastrar' — en 'select' el banco de cada <select> SIEMPRE es aleatorio, sin excepción. */
    aleatorio?: boolean;
}
interface EtiquetarImagenResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface EtiquetarImagenInstancia {
    revisar(): EtiquetarImagenResultado;
    obtenerResultado(): EtiquetarImagenResultado;
    reiniciar(): void;
}
declare function crearEtiquetarImagen(id: IdentificadorActividad, datos: EtiquetarImagenDatos, puntaje?: number): EtiquetarImagenInstancia;
