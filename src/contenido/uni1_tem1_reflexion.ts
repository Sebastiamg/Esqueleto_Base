import { crearMenu } from '../app/menu';
import { crearEncabezado } from '../app/header';
import { calificarActividad } from '../app/grading';
import { registrar } from '../app/registry';

const encabezado = crearEncabezado(document.getElementById('encabezado')!, {
  unidad: 1,
  tema: 'El cuento clásico',
  pagina: 14,
});

crearMenu({
  ayudas: [
    '<b class="text-blue-600">Preguntas 1 y 2</b>, encierra los personajes y subraya las expresiones.',
    '<b class="text-blue-600">Pregunta 3</b>, une cada imagen con su característica.',
    '<b class="text-blue-600">Preguntas 4 a 6</b>, contesta, colorea la respuesta correcta y explica tu elección.',
  ],
  onCalificar: () => calificarActividad(document, encabezado),
  onNombreEstudiante: nombre => encabezado.mostrarAlumno(nombre),
});

const personaje = (src: string, alt: string) =>
  `<img src="${src}" alt="${alt}" class="mx-auto h-28 w-auto object-contain" />`;
const imagen = (src: string, alt: string) =>
  `<img src="${src}" alt="${alt}" class="h-auto w-28 max-w-full rounded-md object-contain" />`;

// 1. Encierra los personajes del cuento
registrar(
  crearSeleccionMultipleSinEnunciado(
    1,
    {
      opciones: [
        personaje('/img/i1_p14_act1.png', 'Emperador'),
        personaje('/img/i2_p14_act1.png', 'Niña con capa roja'),
        personaje('/img/i3_p14_act1.png', 'Niño'),
        personaje('/img/i4_p14_act1.png', 'Ogro'),
        personaje('/img/i5_p14_act1.png', 'Soldado'),
      ],
      correctas: [0, 2, 4],
      variante: 'circulo',
      columna: false,
      aleatorio: false,
    },
    2,
  ),
);

// 2. Subraya las expresiones de susto y asombro del primer ministro
registrar(
  crearSeleccionMultipleSinEnunciado(
    2,
    {
      opciones: ['¡Qué sucedió!', '¡Dios nos ampare!', '¡No puede ser!', '¡No veo nada!'],
      correctas: [1, 3],
      variante: 'subrayar',
      columna: false,
      aleatorio: false,
    },
    1,
  ),
);

// 3. Relaciona imágenes y características
registrar(
  crearRelacionar(
    3,
    {
      pares: [
        { respuesta: imagen('/img/i1_p14_act3.png', 'Niño que señala'), item: 'Inocente' },
        { respuesta: imagen('/img/i2_p14_act3.png', 'Tela'), item: 'Finas' },
        { respuesta: imagen('/img/i3_p14_act3.png', 'Emperador'), item: 'Vanidoso' },
        { respuesta: imagen('/img/i4_p14_act3.png', 'Ministro'), item: 'Asustado' },
        { respuesta: imagen('/img/i5_p14_act3.png', 'Bandidos'), item: 'Mentiroso' },
      ],
    },
    2,
  ),
);

// 4 y 6: respuestas abiertas (renglones) — las califica el docente.
crearRenglones();

// 5. Colorea la respuesta correcta
registrar(
  crearSeleccionSimpleConEnunciado(
    5,
    {
      items: [
        {
          enunciado: '¿Qué buscaba siempre el emperador?',
          opciones: ['Un castillo', 'Un sastre', 'Un traje nuevo'],
          correcta: 2,
        },
        {
          enunciado: '¿Qué le vendieron al emperador?',
          opciones: [
            'Un traje maravilloso de hermosos colores.',
            'La idea sobre un traje que solo los sabios podían ver.',
          ],
          correcta: 1,
        },
      ],
      aleatorio: false,
    },
    2,
  ),
);

// 6. Respuesta abierta (R. A.): se marca y se explica; la califica el docente.
crearSeleccionMultipleSinEnunciado(6, {
  opciones: ['amistad', 'sinceridad', 'respeto', 'humildad', 'vanidad'],
  correctas: [],
  variante: 'pintar',
  columna: false,
  aleatorio: false,
});
