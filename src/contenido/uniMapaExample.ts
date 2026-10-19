import { crearMenu } from '../app/menu';
import { crearEncabezado } from '../app/header';
import { crearOrganizador, type ConectorConfig, type NodoMapa } from '../organizadores';

const encabezado = crearEncabezado(document.getElementById('encabezado')!, {
  unidad: 1,
  tema: 'Organizador gráfico',
  pagina: 1,
  imagenUnidad: '/img/icono_aprendo_y_me_divierto.png',
  anchoImagenUnidad: { movil: 370, desktop: 370 },
});

crearMenu({
  ayudas: [
    'Pulsa <b class="text-blue-600">›</b> para descubrir el siguiente elemento del organizador.',
    'Pulsa <b class="text-blue-600">‹</b> para volver, o el botón circular para empezar de nuevo.',
  ],
  onCalificar: () => undefined,
  onNombreEstudiante: nombre => encabezado.mostrarAlumno(nombre),
});

const iconoLibro = `
  <span class="-my-2 -ml-4 grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-amber-500 shadow-md ring-4 ring-amber-100">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7">
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </svg>
  </span>`;

const lineaVioleta: ConectorConfig = { clase: 'stroke-violet-400', estilo: 'discontinuo' };

const tarjetaNarrador = (titulo: string, texto: string, claseTitulo = 'bg-violet-400'): NodoMapa => ({
  tipo: 'tarjeta',
  titulo,
  texto,
  clase: 'w-64',
  claseTitulo,
  claseTexto: 'bg-violet-50',
});

const tipoNarrador = (texto: string, tarjeta: NodoMapa): NodoMapa => ({
  tipo: 'hoja',
  texto,
  clase: 'w-36 border-violet-400',
  conectorHijos: lineaVioleta,
  hijos: [tarjeta],
});

const rama = (texto: string, clase: string, extra: Partial<NodoMapa> = {}): NodoMapa => ({
  tipo: 'rama',
  texto,
  clase: `w-40 bg-linear-to-r ${clase}`,
  ...extra,
});

crearOrganizador(1, {
  raiz: {
    tipo: 'raiz',
    texto: 'Elementos<br />del cuento',
    icono: iconoLibro,
    conectorHijos: { clase: 'stroke-slate-400', estilo: 'punteado', marcadorFin: true },
    hijos: [
      rama('Personajes', 'from-green-200 to-green-50 text-green-600', {
        conectorHijos: { clase: 'stroke-green-500', estilo: 'discontinuo', marcadorFin: true },
        hijos: [
          { tipo: 'hoja', texto: 'Principales', clase: 'w-36 border-green-500' },
          { tipo: 'hoja', texto: 'Secundarios', clase: 'w-36 border-green-500' },
        ],
        converge: {
          tipo: 'nota',
          texto: 'Pueden ser humanos, animales o seres ficticios.',
          clase: 'w-52 bg-green-500 text-center font-semibold text-white shadow-sm',
          conector: { clase: 'stroke-green-500', marcadorInicio: true },
        },
      }),
      rama('Acciones', 'from-amber-200 to-amber-50 text-amber-500'),
      rama('Espacio', 'from-cyan-200 to-cyan-50 text-cyan-600'),
      rama('Tiempo', 'from-orange-200 to-orange-50 text-orange-500'),
      rama('Narrador', 'from-violet-200 to-violet-50 text-violet-600', {
        nota: {
          tipo: 'nota',
          texto:
            'Es la voz que cuenta la historia, dice dónde y cuándo ocurren las acciones, presenta a los personajes y el problema.',
          clase: 'w-56 border-2 border-dashed border-violet-400 bg-white text-center',
          conector: { clase: 'stroke-violet-500' },
        },
        conectorHijos: { ...lineaVioleta, marcadorFin: true },
        hijos: [
          tipoNarrador(
            'Protagonista',
            tarjetaNarrador('Es el personaje principal', 'Narra en primera persona sobre lo que ve, oye, piensa y siente.'),
          ),
          tipoNarrador(
            'Testigo',
            tarjetaNarrador('Es un personaje secundario', 'Narra en primera o tercera persona sobre lo que ve, siente y oye.'),
          ),
          tipoNarrador(
            'Omnisciente',
            tarjetaNarrador(
              'No es un personaje de la historia',
              'Narra en tercera persona. Sabe todo lo que piensan, sienten y dicen los personajes y lo que sucede a su alrededor.',
              'bg-violet-600',
            ),
          ),
        ],
      }),
    ],
  },
});
