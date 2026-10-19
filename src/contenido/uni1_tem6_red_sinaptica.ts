import { crearMenu } from '../app/menu';
import { crearEncabezado } from '../app/header';
import { crearRevelador } from '../app/revelador';
import { crearOrganizador, type NodoMapa } from '../organizadores';

const encabezado = crearEncabezado(document.getElementById('encabezado')!, {
  unidad: 1,
  tema: 'Red sináptica de ideas',
  imagenUnidad: '/img/ico_red_sinaptica_de_ideas.png',
  pagina: 50,
});

crearMenu({
  ayudas: [
    'Recorre cada <b class="text-blue-600">organizador</b> con el botón "Siguiente" para repasar los temas de la unidad.',
  ],
  // Resumen de la unidad: contenido, no se califica.
  onCalificar: () => undefined,
  onNombreEstudiante: nombre => encabezado.mostrarAlumno(nombre),
});

/** Colores de cada organizador: borde, texto y trazo de las líneas. */
interface Paleta {
  borde: string;
  texto: string;
  trazo: string;
  raiz: string;
}
const NARANJA: Paleta = { borde: 'border-orange-400', texto: 'text-orange-600', trazo: 'stroke-orange-400', raiz: 'border-orange-400 text-orange-600' };
const MORADO: Paleta = { borde: 'border-fuchsia-400', texto: 'text-fuchsia-700', trazo: 'stroke-fuchsia-400', raiz: 'border-fuchsia-500 text-fuchsia-700' };
const VERDE: Paleta = { borde: 'border-green-500', texto: 'text-green-700', trazo: 'stroke-green-500', raiz: 'border-green-500 text-green-700' };
const AZUL: Paleta = { borde: 'border-sky-500', texto: 'text-sky-700', trazo: 'stroke-sky-500', raiz: 'border-sky-500 text-sky-700' };
const AZUL_FUERTE: Paleta = { borde: 'border-blue-500', texto: 'text-blue-700', trazo: 'stroke-blue-500', raiz: 'border-blue-500 text-blue-700' };
const TURQUESA: Paleta = { borde: 'border-teal-500', texto: 'text-teal-700', trazo: 'stroke-teal-500', raiz: 'border-teal-500 text-teal-700' };

const raiz = (texto: string, p: Paleta): Pick<NodoMapa, 'tipo' | 'texto' | 'clase'> => ({
  tipo: 'libre',
  texto: `<b>${texto}</b>`,
  clase: `rounded-full border-4 bg-white px-8 py-2.5 text-center text-lg shadow-md ${p.raiz}`,
});

/** Etiqueta de un tema, sin texto de apoyo (ej. "Estructura"). */
const etiqueta = (texto: string, p: Paleta, ancho = 'w-44'): NodoMapa => ({
  tipo: 'libre',
  texto,
  clase: `${ancho} rounded-lg border-2 ${p.borde} bg-white px-3 py-2 text-center leading-snug text-slate-800 shadow-sm`,
  conectorHijos: { clase: p.trazo, marcadorFin: true },
});

/** Cuadro de explicación. */
const cuadro = (texto: string, p: Paleta, ancho = 'w-64'): NodoMapa => ({
  tipo: 'libre',
  texto,
  clase: `${ancho} rounded-lg border-2 ${p.borde} bg-white px-3 py-2 text-center text-sm leading-snug text-slate-700 shadow-sm`,
});

/** Término con su explicación a la derecha. */
const par = (termino: string, explicacion: string, p: Paleta, ancho = 'w-40'): NodoMapa => ({
  tipo: 'libre',
  texto: `<b class="${p.texto}">${termino}</b>`,
  clase: `${ancho} rounded-lg border-2 ${p.borde} bg-white px-3 py-2 text-center leading-snug shadow-sm`,
  conectorHijos: { clase: p.trazo, marcadorFin: true },
  hijos: [cuadro(explicacion, p)],
});

// controles:false — el botón "Siguiente" de la página revela un nodo por clic.
const organizador = (id: number, nodo: NodoMapa) =>
  crearOrganizador(id, { controles: false, raiz: nodo });

// 1. Cuento clásico
const cuento = organizador(1, {
  ...raiz('Cuento clásico', NARANJA),
  conectorHijos: { clase: NARANJA.trazo },
  hijos: [
    {
      ...etiqueta('Estructura', NARANJA),
      hijos: [
        par('Inicio', 'Se describen los personajes, el tiempo y el lugar.', NARANJA),
        par('Nudo o conflicto', 'Se narran los hechos o aventuras y el problema.', NARANJA),
        par('Final', 'Es el desenlace del conflicto.', NARANJA),
      ],
    },
    {
      ...etiqueta('Tipos de personajes', NARANJA),
      hijos: [
        {
          ...par('Personajes principales', '', NARANJA, 'w-44'),
          hijos: [
            cuadro('Protagonista: el personaje', NARANJA, 'w-52'),
            cuadro('Antagonista: el oponente', NARANJA, 'w-52'),
          ],
        },
        par('Personajes secundarios', 'Aliados o enemigos', NARANJA, 'w-44'),
      ],
    },
  ],
});

// 2. La descripción
const descripcion = organizador(2, {
  ...raiz('La descripción', MORADO),
  conectorHijos: { clase: MORADO.trazo },
  hijos: [
    cuadro('Es explicar las características de personas, lugares u objetos.', MORADO, 'w-72'),
    {
      ...etiqueta('Pautas para realizar una descripción oral', MORADO, 'w-56'),
      hijos: [
        cuadro('Utilizar un volumen de voz y entonación adecuados.', MORADO),
        cuadro('Vocalizar correctamente las palabras y emplear un lenguaje apropiado.', MORADO),
        cuadro('Mantener una postura, gestos y movimientos formales.', MORADO),
        cuadro('Usar material visual de apoyo.', MORADO),
      ],
    },
  ],
});

// 3. Texto instructivo
const instructivo = organizador(3, {
  ...raiz('Texto instructivo', VERDE),
  conectorHijos: { clase: VERDE.trazo },
  hijos: [
    cuadro('Brinda indicaciones para realizar una acción.', VERDE, 'w-72'),
    {
      ...etiqueta('Partes', VERDE, 'w-32'),
      hijos: [
        par('Título', 'Nombre de la actividad', VERDE, 'w-36'),
        par('Materiales', 'Listado de implementos', VERDE, 'w-36'),
        par('Pasos', 'Instrucciones ordenadas', VERDE, 'w-36'),
        par('Imágenes', 'Elementos visuales', VERDE, 'w-36'),
      ],
    },
  ],
});

// 4. Signos de puntuación
const signos = organizador(4, {
  ...raiz('Signos de puntuación', AZUL),
  conectorHijos: { clase: AZUL.trazo },
  hijos: [
    par('Punto', 'Indica una pausa corta.', AZUL, 'w-40'),
    par('La coma', 'Indica una pausa corta.', AZUL, 'w-40'),
  ],
});

// 5. Sustantivo
const sustantivo = organizador(5, {
  ...raiz('Sustantivo', AZUL_FUERTE),
  conectorHijos: { clase: AZUL_FUERTE.trazo },
  hijos: [
    par('Propio', 'Nombra a personas, animales, plantas, objetos y lugares para distinguirlos de los demás.', AZUL_FUERTE),
    par('Común', 'Nombra a personas, animales, plantas, objetos y lugares en general.', AZUL_FUERTE),
    par('Individual', 'Nombra a un solo elemento.', AZUL_FUERTE),
    par('Colectivo', 'Nombra a varios elementos.', AZUL_FUERTE),
  ],
});

// 6. Preservación de las lenguas ancestrales
const lenguas = organizador(6, {
  ...raiz('Preservación de las lenguas ancestrales', TURQUESA),
  conectorHijos: { clase: TURQUESA.trazo },
  hijos: [
    cuadro(
      'Cuando una lengua se extingue, se pierde una parte importante del patrimonio y la riqueza cultural de una nación.',
      TURQUESA,
      'w-80',
    ),
  ],
});

crearRevelador([
  { el: document.getElementById('paso1')!, organizador: cuento },
  { el: document.getElementById('paso2')!, organizador: descripcion },
  { el: document.getElementById('paso3')!, organizador: instructivo },
  { el: document.getElementById('paso4')!, organizador: signos },
  { el: document.getElementById('paso5')!, organizador: sustantivo },
  { el: document.getElementById('paso6')!, organizador: lenguas },
]);
