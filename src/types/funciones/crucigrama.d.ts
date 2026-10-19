// Tipos de "crucigrama.js", generados automáticamente desde
// src/funciones/crucigrama/index.ts — no editar a mano.
/// <reference path="./comun.d.ts" />

/**
 * ============================================================================
 *  Crucigrama
 * ============================================================================
 *
 * ¿Qué hace?
 * A partir de una lista plana de `{ respuesta, pista }` (sin fila/columna/
 * dirección — nada de eso se arma a mano), el motor de auto-diagramación
 * intenta cruzar las palabras por letras compartidas hasta lograr un
 * crucigrama válido donde todas encajan, y arma el tablero (una celda por
 * letra) con un campo de una sola letra por casilla. Cada celda donde
 * arranca una palabra lleva una etiqueta (1, 2, 3… o a, b, c…) que la
 * conecta con su pista en el listado de abajo — un solo listado, sin
 * separar Horizontales/Verticales (esa dirección es un detalle interno del
 * motor, no algo que el estudiante necesite ver).
 *
 * Respuestas de más de una palabra (ej. "LINEA EQUINOCCIONAL") funcionan
 * igual: el espacio también ocupa una celda en el tablero, pero esa celda
 * se pinta como separador (sin campo) — no se muestra ni se califica.
 *
 * El armado (qué palabra cruza con cuál, y en qué posición exacta del
 * tablero) es responsabilidad del motor y depende de un candidato al azar
 * entre los cruces válidos posibles — por eso el layout nunca es
 * exactamente igual dos veces, sin que eso sea configurable (no tendría
 * sentido un crucigrama "no aleatorio": sin azar en el cruce, muchas listas
 * de palabras simplemente no lograrían encajar). Lo que SÍ es configurable
 * con `datos.aleatorio` (por defecto true) es el orden en que se reparten
 * las ETIQUETAS (1/2/3… o a/b/c…) entre las pistas — no afecta dónde queda
 * cada palabra en el tablero, la calificación tampoco depende de esto.
 *
 * `datos.numeracion` (por defecto 'numeros') es 'numeros' (1., 2., 3.…) o
 * 'letras' (a., b., c.…) para las etiquetas de las pistas.
 *
 * Si la lista de palabras no comparte suficientes letras entre sí, el motor
 * reintenta armar el tablero completo varias veces y, si aun así no logra
 * ubicar todas las palabras, la función pinta un mensaje de error legible
 * en vez de un tablero roto — revisa que las palabras tengan letras en
 * común.
 *
 * Estándar de calificación (Sistema A — cada celda ya trae su propia letra
 * correcta fija, no es una lista de opciones marcables como en Selección
 * Múltiple): cada celda con letra vale 1/total. Acertarla (sin importar
 * mayúsculas ni tildes) suma 1/total; escribir otra letra resta solo la
 * MITAD de eso ((1/total)/2); dejarla en blanco no suma ni resta (pero
 * sigue pintándose como incorrecta). `nota = (correctas − incorrectas/2) /
 * total`, sin bajar de 0. Las celdas separadoras (espacio entre palabras de
 * una misma respuesta) nunca cuentan para el total.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Completa el crucigrama con las pistas.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearCrucigrama(1, {
 *       palabras: [
 *         { respuesta: 'SOL', pista: 'Estrella del sistema solar.' },
 *         { respuesta: 'LUNA', pista: 'Satélite natural de la Tierra.' },
 *         { respuesta: 'TIERRA', pista: 'Planeta donde vivimos.' },
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
 * `crearCrucigrama` devuelve una instancia con:
 *   - revisar(): califica, pinta cada celda (verde/rojo), escribe la nota
 *     en el input (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra lo escrito y el feedback, deja todo en blanco (el
 *     tablero armado se conserva, no se vuelve a generar).
 * ============================================================================
 */
type NumeracionCrucigrama = 'numeros' | 'letras';
interface CrucigramaPalabra {
    /** Se compara sin mayúsculas ni tildes. Un espacio (respuesta de más de una palabra) ocupa una celda separadora, nunca se muestra como campo ni se califica. */
    respuesta: string;
    /** Admite HTML (se inserta con innerHTML, no como texto plano). */
    pista: string;
}
interface CrucigramaDatos {
    palabras: CrucigramaPalabra[];
    /** Baraja el orden en que se reparten las etiquetas (1/2/3.../a/b/c...) entre las pistas. Por defecto true. No afecta el armado del tablero ni la calificación. */
    aleatorio?: boolean;
    /** 'numeros' (1., 2., 3.… — por defecto) o 'letras' (a., b., c.…). */
    numeracion?: NumeracionCrucigrama;
}
interface CrucigramaResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface CrucigramaInstancia {
    revisar(): CrucigramaResultado;
    obtenerResultado(): CrucigramaResultado;
    reiniciar(): void;
}
declare function crearCrucigrama(id: IdentificadorActividad, datos: CrucigramaDatos, puntaje?: number): CrucigramaInstancia;
