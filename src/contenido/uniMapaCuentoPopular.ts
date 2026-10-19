import { crearMenu } from '../app/menu';
import { crearEncabezado } from '../app/header';
import { crearOrganizador, type ConectorConfig, type NodoMapa } from '../organizadores';

const encabezado = crearEncabezado(document.getElementById('encabezado')!, {
  unidad: 1,
  tema: 'Cuento popular',
  pagina: 1,
});

crearMenu({
  ayudas: [
    'Pulsa <b class="text-blue-600">›</b> para descubrir cada parte del organizador.',
    'Escribe en los <b class="text-blue-600">renglones</b> lo que falta en cada cuadro.',
  ],
  onCalificar: () => undefined,
  onNombreEstudiante: nombre => encabezado.mostrarAlumno(nombre),
});

/** Espacio de escritura: crearRenglones() convierte cada div.bookText en renglones. */
const renglones = (lineas = 1) => `<div class="bookText ln${lineas}"></div>`;

const AZUL: ConectorConfig = { clase: 'stroke-sky-600', marcadorFin: true };
const ROSA: ConectorConfig = { clase: 'stroke-pink-500', marcadorFin: true };

const pastilla = (texto: string, borde: string): NodoMapa => ({
  tipo: 'hoja',
  texto,
  clase: `w-36 rounded-full border-solid ${borde} py-1.5 font-medium`,
});

const cuadro = (texto: string, borde: string): NodoMapa => ({
  tipo: 'libre',
  texto,
  clase: `w-52 rounded-md border-2 ${borde} bg-white px-3 py-1.5 text-sm font-medium leading-snug text-slate-700 shadow-sm`,
});

const parte = (etiqueta: string, respuesta: string, borde: string, conector: ConectorConfig): NodoMapa => ({
  ...pastilla(etiqueta, borde),
  conectorHijos: conector,
  hijos: [cuadro(respuesta, borde)],
});

const rama = (texto: string, clase: string, conectorHijos: ConectorConfig, hijos: NodoMapa[]): NodoMapa => ({
  tipo: 'rama',
  texto,
  clase: `w-36 rounded-full border-2 bg-white py-1.5 shadow-sm ${clase}`,
  conectorHijos,
  hijos,
});

crearOrganizador(1, {
  raiz: {
    tipo: 'raiz',
    texto: 'Cuento popular',
    clase: 'rounded-xl border-2 border-sky-600 bg-white px-5 py-2.5 text-sky-700 shadow-md',
    conectorHijos: { clase: 'stroke-sky-500', marcadorFin: true },
    nota: {
      tipo: 'libre',
      texto: renglones(4),
      clase: 'w-48 rounded-xl border-2 border-sky-600 bg-white px-3 py-2 shadow-sm',
      conector: { clase: 'stroke-sky-600', etiqueta: 'es' },
    },
    hijos: [
      rama('Estructura', 'border-sky-600 text-sky-700', AZUL, [
        parte(renglones(), renglones(2), 'border-sky-600', AZUL),
        parte('Nudo', renglones(2), 'border-sky-600', AZUL),
        parte(renglones(), renglones(2), 'border-sky-600', AZUL),
      ]),
      rama('Elementos', 'border-pink-500 text-pink-600', ROSA, [
        {
          ...pastilla('Personajes', 'border-pink-400'),
          conectorHijos: ROSA,
          hijos: [
            parte(renglones(), 'Alrededor de ellos gira el relato.', 'border-pink-400', ROSA),
            parte('Secundarios', renglones(2), 'border-pink-400', ROSA),
          ],
        },
        parte(renglones(), 'Acontecimientos que desarrollan la historia.', 'border-pink-400', ROSA),
        parte('Tiempo', renglones(2), 'border-pink-400', ROSA),
        parte('Espacio', renglones(2), 'border-pink-400', ROSA),
        {
          ...pastilla('Narrador', 'border-pink-400'),
          conectorHijos: ROSA,
          hijos: [
            pastilla(renglones(), 'border-pink-400'),
            pastilla(renglones(), 'border-pink-400'),
            pastilla(renglones(), 'border-pink-400'),
          ],
        },
      ]),
    ],
  },
});

// Después de armar el organizador: los div.bookText ya existen en el DOM.
crearRenglones();
