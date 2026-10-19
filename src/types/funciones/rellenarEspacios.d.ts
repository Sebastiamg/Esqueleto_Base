// Tipos de "rellenarEspacios.js", generados automáticamente desde
// src/funciones/rellenarEspacios/index.ts — no editar a mano.
/// <reference path="./comun.d.ts" />

/**
 * ============================================================================
 *  Rellenar espacios
 * ============================================================================
 *
 * ¿Qué hace?
 * Muestra uno o varios enunciados con espacios en blanco incrustados en
 * medio del texto (no en tarjetas aparte) — el estudiante los llena
 * eligiendo de un banco de palabras (`modo: 'select'`, un <select> por
 * espacio) o escribiendo la respuesta libremente (`modo: 'input'`).
 *
 * Cada ítem es `{ texto, respuestas }`: "texto" trae el marcador (por
 * defecto "___") una vez por cada espacio que necesite, y "respuestas" es
 * la respuesta correcta de cada espacio EN EL MISMO ORDEN en que aparece el
 * marcador dentro de ese texto — un enunciado puede tener más de un espacio.
 *
 * En `modo: 'select'`, el banco de palabras (`datos.opciones`) es
 * independiente de las respuestas correctas: si no se manda, se arma solo
 * con las respuestas correctas de todos los ítems (sin duplicados), pero se
 * puede mandar un banco más grande con palabras de más (distractores) sin
 * que eso rompa nada — a diferencia de la versión vieja de esta función,
 * donde el banco de opciones y la respuesta correcta de cada espacio eran
 * la MISMA lista (la posición en "options" definía la respuesta correcta),
 * así que no se podían agregar distractores sin desordenar las respuestas.
 * El orden de las opciones dentro de cada <select> es aleatorio, pero el
 * mismo para todos los selects de la actividad (más fácil de escanear).
 *
 * El orden de los ítems (párrafos) es aleatorio por defecto (`datos.aleatorio`,
 * por defecto true) — cada espacio se lleva su propia respuesta correcta
 * consigo, así que la calificación nunca depende del orden. Pon
 * `aleatorio: false` para mantener el orden en que los escribiste.
 *
 * El banco de palabras del modo 'select' (`datos.opciones`) SIEMPRE se
 * mezcla, sin excepción — no tiene opción de desactivarse.
 *
 * Si hay más de un ítem, cada uno se numera con `datos.numeracion`:
 * `'letras'` (a., b., c.… — por defecto), `'numeros'` (1., 2., 3.…) o
 * `'ninguna'` (sin numerar).
 *
 * Estándar de calificación (Sistema A — cada espacio ya trae su propia
 * respuesta correcta fija, no es una lista de opciones marcables como en
 * Selección Múltiple): cada espacio vale 1/total. Acertarlo (texto
 * normalizado: sin importar mayúsculas, tildes ni espacios, estén donde
 * estén) suma 1/total; escribir/elegir algo distinto resta solo la MITAD de eso
 * ((1/total)/2); dejarlo en blanco no suma ni resta (pero sigue pintándose
 * como incorrecto). `nota = (correctas − incorrectas/2) / total`, sin bajar
 * de 0.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Completa los espacios en blanco.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearRellenarEspacios(1, {
 *       items: [
 *         { texto: 'El proceso de convertir agua líquida en vapor se llama ___.', respuestas: ['evaporación'] },
 *         { texto: 'El paso de vapor a líquido se llama ___ y el de sólido a líquido se llama ___.', respuestas: ['condensación', 'fusión'] },
 *       ],
 *       opciones: ['evaporación', 'condensación', 'fusión', 'sublimación'],
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
 * `crearRellenarEspacios` devuelve una instancia con:
 *   - revisar(): califica, pinta cada espacio (verde/rojo), escribe la nota
 *     en el input (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra lo escrito/elegido y el feedback, deja todo en blanco.
 * ============================================================================
 */
type ModoRellenarEspacios = 'select' | 'input';
type NumeracionRellenarEspacios = 'letras' | 'numeros' | 'ninguna';
interface RellenarEspaciosItem {
    /** Texto del enunciado; incluye el marcador una vez por cada espacio a llenar. Admite HTML (se inserta con innerHTML, no como texto plano) — evita usar el "marcador" dentro de una etiqueta HTML. */
    texto: string;
    /** Respuesta correcta de cada espacio, en el mismo orden en que aparece el marcador dentro de "texto". */
    respuestas: string[];
}
interface RellenarEspaciosDatos {
    items: RellenarEspaciosItem[];
    /** 'select' (banco de palabras cerrado) o 'input' (respuesta libre). Por defecto 'select'. */
    modo?: ModoRellenarEspacios;
    /** Texto que marca un espacio dentro de "texto". Por defecto '___'. */
    marcador?: string;
    /** Banco de palabras para modo 'select'; si se omite, se arma con las respuestas correctas (sin duplicados). */
    opciones?: string[];
    /** Cómo numerar los ítems (solo si hay más de uno): 'letras' (a., b., c.…), 'numeros' (1., 2., 3.…) o 'ninguna'. Por defecto 'letras'. */
    numeracion?: NumeracionRellenarEspacios;
    /** Baraja el orden de los ítems (párrafos). Por defecto true. El banco de palabras del modo 'select' SIEMPRE se baraja, sin importar este valor. */
    aleatorio?: boolean;
}
interface RellenarEspaciosResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface RellenarEspaciosInstancia {
    revisar(): RellenarEspaciosResultado;
    obtenerResultado(): RellenarEspaciosResultado;
    reiniciar(): void;
}
declare function crearRellenarEspacios(id: IdentificadorActividad, datos: RellenarEspaciosDatos, puntaje?: number): RellenarEspaciosInstancia;
