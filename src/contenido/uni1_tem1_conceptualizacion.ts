import { crearMenu } from '../app/menu';
import { crearEncabezado } from '../app/header';
import { crearRevelador } from '../app/revelador';
import { crearOrganizador, type NodoMapa } from '../organizadores';

const encabezado = crearEncabezado(document.getElementById('encabezado')!, {
  unidad: 1,
  tema: 'El cuento clásico',
  pagina: 15,
});

crearMenu({
  ayudas: [
    'Lee la <b class="text-blue-600">Conceptualización</b> y recorre los dos organizadores con el botón "›".',
    'En <b class="text-blue-600">Construyo mi aprendizaje</b>, completa lo que piensas, lo que te interesa y lo que vas a investigar.',
  ],
  // Conceptualización + rutina de pensamiento: contenido, no se califica.
  onCalificar: () => undefined,
  onNombreEstudiante: nombre => encabezado.mostrarAlumno(nombre),
});

crearPanelInformativo(1, {
  titulo: 'Los cuentos clásicos o tradicionales',
  texto:
    'Son narraciones cortas de hechos imaginarios y fantásticos que se transmiten oralmente entre familias o comunidades desde tiempos muy antiguos.',
});

// Mapa 1: Estructura del cuento
const tarjetaEstructura = (
  titulo: string,
  texto: string,
  color: string,
): NodoMapa => ({
  tipo: 'tarjeta',
  titulo,
  texto,
  clase: 'w-60',
  claseTitulo: color,
  claseTexto: 'bg-white',
});

// Estos dos mapas viven DENTRO del revelador de página (ver crearRevelador
// más abajo): controles:false apaga su propia barra de navegación — si no,
// aparecerían dos barras fijas abajo a la vez. Sus nodos pasan a ser
// pasos más de la MISMA secuencia general: el botón "Siguiente" de la
// página va revelando un nodo del mapa por clic (con su propia animación
// de nodos y líneas) hasta completarlo, y recién ahí sigue con el próximo
// bloque de la página.
const mapaEstructura = crearOrganizador(2, {
  controles: false,
  raiz: {
    tipo: 'rama',
    texto: 'Estructura del cuento',
    clase: 'rounded-full bg-blue-700 text-white px-6',
    conectorHijos: { clase: 'stroke-blue-700' },
    hijos: [
      tarjetaEstructura(
        'Inicio',
        'Se describen los personajes, el tiempo y el lugar.',
        'bg-sky-500',
      ),
      tarjetaEstructura(
        'Nudo o conflicto',
        'Se narran los hechos o aventuras y el problema.',
        'bg-amber-500',
      ),
      tarjetaEstructura(
        'Final',
        'Es el desenlace del conflicto.',
        'bg-violet-700',
      ),
    ],
  },
});

// Mapa 2: Tipos de personajes
const tarjetaPersonaje = (
  imagen: string,
  alt: string,
  texto: string,
  clase: string,
): NodoMapa => ({
  tipo: 'libre',
  clase: `w-72 rounded-xl border-2 ${clase} bg-white p-3 text-sm leading-snug text-slate-700`,
  texto: `
    <div class="flex items-center gap-3">
      <img src="${imagen}" alt="${alt}" class="h-16 w-auto shrink-0 object-contain" />
      <div>${texto}</div>
    </div>`,
});

const mapaPersonajes = crearOrganizador(3, {
  controles: false,
  raiz: {
    tipo: 'rama',
    texto: 'Tipos de<br />personajes',
    clase: 'rounded-xl bg-fuchsia-700 text-white',
    conectorHijos: { clase: 'stroke-fuchsia-700' },
    hijos: [
      {
        tipo: 'hoja',
        texto: 'Personajes<br />principales',
        clase: 'w-40 border-sky-500',
        conectorHijos: { clase: 'stroke-sky-500' },
        hijos: [
          {
            tipo: 'hoja',
            texto: 'Protagonista',
            clase: 'w-32 border-teal-500',
            conectorHijos: { clase: 'stroke-teal-500' },
            hijos: [
              tarjetaPersonaje(
                '/img/i3_p15_act_personajes.png',
                'Protagonista',
                'Personaje principal con características esenciales: valiente, bondadoso, justo y con deseo de superar dificultades.',
                'border-teal-500',
              ),
            ],
          },
          {
            tipo: 'hoja',
            texto: 'Antagonista',
            clase: 'w-32 border-orange-500',
            conectorHijos: { clase: 'stroke-orange-500' },
            hijos: [
              tarjetaPersonaje(
                '/img/i1_p15_act_personajes.png',
                'Antagonista',
                'Personaje que se opone al protagonista y crea los obstáculos. Suele ser malvado y con deseo de poder o venganza.',
                'border-orange-500',
              ),
            ],
          },
        ],
      },
      {
        tipo: 'hoja',
        texto: 'Personajes<br />secundarios',
        clase: 'w-40 border-sky-500',
        conectorHijos: { clase: 'stroke-sky-500' },
        hijos: [
          tarjetaPersonaje(
            '/img/i2_p15_act_personajes.png',
            'Personajes secundarios',
            'Pueden ser aliados o enemigos del protagonista.',
            'border-sky-500',
          ),
        ],
      },
    ],
  },
});

// Construyo mi aprendizaje
crearRutinasPensamiento(4, {
  rutinas: [
    {
      iconoTamano: 70,
      icono: '/img/ico_pienso_cerebro.png',
      titulo: 'Pienso',
      texto: '¿Qué sé sobre los cuentos clásicos?',
      color: '#16A34A',
    },
    {
      iconoTamano: 70,
      icono: '/img/ico_me_interesa_cerebro.png',
      titulo: 'Me interesa',
      texto: '¿Qué me gustaría aprender de los cuentos clásicos?',
      color: '#EA580C',
    },
    {
      iconoTamano: 70,
      icono: '/img/ico_investigo_cerebro.png',
      titulo: 'Investigo',
      texto: '¿Dónde puedo encontrar información sobre los cuentos clásicos?',
      color: '#0284C7',
    },
  ],
});

// Revelado de la página a nivel general: un bloque completo por vez,
// controlado con la barra fija de abajo.
crearRevelador([
  { el: document.getElementById('paso1')! },
  { el: document.getElementById('paso2')! },
  { el: document.getElementById('paso3')!, organizador: mapaEstructura },
  { el: document.getElementById('paso4')!, organizador: mapaPersonajes },
  { el: document.getElementById('paso5')! },
]);
