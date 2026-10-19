// Tipos de "relacionarLiteral.js", generados automáticamente desde
// src/funciones/relacionarLiteral/index.ts — no editar a mano.
/// <reference path="./comun.d.ts" />

/**
 * ============================================================================
 *  Relacionar literal–enunciado
 * ============================================================================
 *
 * ¿Qué hace?
 * La clásica "relación de literales": una columna izquierda con términos
 * etiquetados con una letra (a, b, c…) y una columna derecha con
 * enunciados, cada uno con un campo para escribir o elegir la letra del
 * término que le corresponde. Es la versión "con letras" de Relacionar
 * (que usa cuerdas dibujadas) — misma idea, sin trazar líneas.
 *
 * `datos.literales` es la columna izquierda (los términos); la letra de
 * cada uno se asigna sola según su posición en pantalla (que es aleatoria
 * en cada carga, igual que el resto del catálogo). `datos.items` es la
 * columna derecha: cada uno es `{ enunciado, correcta }`, donde "correcta"
 * es el TEXTO EXACTO de uno de los elementos de "literales" (no un índice
 * — así no hay que llevar la cuenta de posiciones a mano).
 *
 * `datos.modo` ('select', por defecto, o 'input') define si el estudiante
 * ELIGE la letra de un banco cerrado o la ESCRIBE libremente — igual que en
 * Rellenar espacios.
 *
 * `datos.aleatorio` (por defecto true) baraja el orden de presentación de
 * ambas columnas; pon false para mantener el orden de "literales"/"items".
 * La calificación se resuelve por texto, nunca por posición, así que
 * desactivarlo no la afecta.
 *
 * Las tarjetas de la fila N a la izquierda y a la derecha quedan siempre a
 * la misma altura (la del contenido más alto de las dos), para que las dos
 * columnas se vean parejas aunque un enunciado ocupe dos líneas y su
 * literal solo una. Esto solo aplica de "sm" para arriba — en mobile las
 * columnas se apilan una encima de la otra.
 *
 * Estándar de calificación (Sistema A — cada enunciado ya trae su propia
 * letra correcta fija, no es una lista de opciones marcables como en
 * Selección Múltiple): cada enunciado vale 1/total. Acertar la letra
 * (comparación flexible: sin importar mayúsculas, tildes ni espacios) suma
 * 1/total; escribir/elegir otra letra resta solo la MITAD de eso
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
 *   <p>Relaciona cada proceso con su definición.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearRelacionarLiteral(1, {
 *       literales: ['Nitrificación', 'Fijación del nitrógeno', 'Amonificación', 'Desnitrificación'],
 *       items: [
 *         { enunciado: 'La materia orgánica se descompone y se libera amonio.', correcta: 'Amonificación' },
 *         { enunciado: 'Transformación de nitritos en nitratos.', correcta: 'Nitrificación' },
 *         { enunciado: 'Los nitratos se convierten en nitrógeno gaseoso.', correcta: 'Desnitrificación' },
 *         { enunciado: 'El nitrógeno se fija en el suelo.', correcta: 'Fijación del nitrógeno' },
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
 * `crearRelacionarLiteral` devuelve una instancia con:
 *   - revisar(): califica, pinta cada campo (verde/rojo), escribe la nota
 *     en el input (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra lo escrito/elegido y el feedback, deja todo en blanco.
 * ============================================================================
 */
type ModoRelacionarLiteral = 'select' | 'input';
interface RelacionarLiteralItem {
    /** Enunciado de la columna derecha. Admite HTML (se inserta con innerHTML, no como texto plano). */
    enunciado: string;
    /** Texto EXACTO de uno de los elementos de "literales" — es la respuesta correcta de este enunciado. */
    correcta: string;
}
interface RelacionarLiteralDatos {
    /** Columna izquierda: términos/definiciones; cada uno se etiqueta solo con una letra según su posición en pantalla. Cada literal admite HTML (se inserta con innerHTML, no como texto plano). */
    literales: string[];
    /** Columna derecha: enunciados a los que hay que ponerles la letra correcta. */
    items: RelacionarLiteralItem[];
    /** 'select' (banco cerrado con las letras disponibles, por defecto) o 'input' (escribe la letra). */
    modo?: ModoRelacionarLiteral;
    /** Baraja el orden de presentación de ambas columnas (literales e ítems). Por defecto true. */
    aleatorio?: boolean;
}
interface RelacionarLiteralResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface RelacionarLiteralInstancia {
    revisar(): RelacionarLiteralResultado;
    obtenerResultado(): RelacionarLiteralResultado;
    reiniciar(): void;
}
declare function crearRelacionarLiteral(id: IdentificadorActividad, datos: RelacionarLiteralDatos, puntaje?: number): RelacionarLiteralInstancia;
