import { crearMenu } from '../app/menu';
import { crearEncabezado } from '../app/header';
import { calificarActividad } from '../app/grading';
import { registrar } from '../app/registry';

const encabezado = crearEncabezado(document.getElementById('encabezado')!, {
  unidad: 1,
  tema: 'Taller de escritura creativa',
  pagina: 18,
});

crearMenu({
  ayudas: [
    '<b class="text-blue-600">En la pregunta 1</b>, elige el binomio de palabras para tu historia.',
    '<b class="text-blue-600">En las preguntas 2 a 5</b>, escribe tus ideas en los renglones y haz tu dibujo.',
    '<b class="text-blue-600">En la pregunta 6</b>, marca "Sí" o "No" en cada indicador.',
  ],
  onCalificar: () => calificarActividad(document, encabezado),
  onNombreEstudiante: nombre => encabezado.mostrarAlumno(nombre),
});

// 1. Binomio fantástico — elección personal, la revisa el docente.
const binomio = (a: string, b: string, color: string) =>
  `<span class="block text-lg font-semibold text-slate-800"><span class="${color} font-black">${a}</span> + ${b}</span>`;
crearSeleccionSimpleSinEnunciado(1, {
  opciones: [
    binomio('Aguja venenosa', 'Cobra real', 'text-amber-600'),
    binomio('Zapatos mágicos', 'Caballo salvaje', 'text-sky-600'),
    binomio('Castillo embrujado', 'Tiburón blanco', 'text-rose-600'),
    binomio('Alfombra voladora', 'Oso hormiguero', 'text-green-600'),
  ],
  correcta: 0,
  variante: 'check',
  columna: false,
  aleatorio: false,
});

// 2 a 5 y 7: renglones (div.bookText) — corrección docente.
crearRenglones();

// 5. Dibujo que acompaña el cuento.
crearLienzo('5_2', [{ ancho: 700, alto: 360 }]);

// 6. Lista de verificación (autoevaluación).
registrar(
  crearListaVerificacion(
    6,
    {
      titulo: 'Indicador',
      criterios: [
        'Un título creativo.',
        'Un inicio, un nudo o desarrollo y un final.',
        'Elementos fantásticos que dan vida al cuento.',
        'Oraciones completas y palabras bien escritas.',
      ],
    },
    1,
  ),
);
