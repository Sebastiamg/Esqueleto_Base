import { crearMenu } from '../app/menu';
import { crearEncabezado } from '../app/header';
import { crearRevelador, type PasoRevelador } from '../app/revelador';

const encabezado = crearEncabezado(document.getElementById('encabezado')!, {
  unidad: 1,
  tema: 'El cuento clásico',
  pagina: 12,
});

crearMenu({
  ayudas: [
    '<b class="text-blue-600">En la pregunta 1</b>, lee el cuento. Pulsa "Siguiente" para avanzar.',
    '<b class="text-blue-600">En la pregunta 2</b>, encierra las emociones que has sentido.',
  ],
  // Lectura y respuesta personal: nada se califica.
  onCalificar: () => undefined,
  onNombreEstudiante: nombre => encabezado.mostrarAlumno(nombre),
});

const glosa = (palabra: string, significado: string) =>
  `<b class="text-violet-700" title="${significado}">${palabra}</b>`;

// 1. Experiencia — el cuento ya no usa crearCuento() (traía su propia
// barra Anterior/Siguiente, duplicada con la del revelador de página): cada
// párrafo e imagen se arma a mano y se revela como un paso más de
// crearRevelador, junto con el resto de la página.
const historia = document.getElementById('p1act')!;

function parrafo(html: string): HTMLElement {
  const p = document.createElement('p');
  p.className =
    'w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 text-center leading-relaxed text-slate-700 shadow-card sm:p-5';
  p.innerHTML = html;
  historia.append(p);
  return p;
}

function imagen(src: string, alt: string): HTMLElement {
  const figura = document.createElement('figure');
  figura.className = 'w-full max-w-md';
  figura.innerHTML = `<img src="${src}" alt="${alt}" class="w-full rounded-2xl shadow-card" />`;
  historia.append(figura);
  return figura;
}

const bloquesCuento: HTMLElement[] = [
  parrafo(
    'Hace muchos años, en un reino lejano, vivía un emperador vanidoso que gastaba todo su dinero en lucir siempre trajes nuevos. Cuentan que tenía un traje para cada ocasión y hora del día.',
  ),
  parrafo(
    'Una mañana se presentaron dos bandidos que se hacían pasar por tejedores, asegurando tejer las telas más finas con colores y dibujos originales, y le convencieron de que poseían una tela que solo los sabios podían ver. El emperador quedó fascinado e inmediatamente entregó a los dos bandidos un buen adelanto en oro para que se pusieran manos a la obra cuanto antes.',
  ),
  parrafo(
    'Los ladrones montaron un telar y simularon que trabajaban. Pero el emperador, ansioso por ver las telas, envió al ministro a la sala ocupada por los dos supuestos tejedores. Al entrar en el cuarto, el ministro se llevó un buen susto: “¡Dios nos ampare! ¡No veo nada!”. Pero no dijo ni una palabra.',
  ),
  parrafo(
    'Los dos bandidos le rogaron que se acercase y le preguntaron si encontraba magníficos los colores y los dibujos.',
  ),
  imagen(
    '/img/i1_p12_act1.jpg',
    'El emperador ríe sentado mientras los bandidos le presentan la tela invisible.',
  ),
  parrafo(
    'El hombre, asustado, acabó por decir que le parecía todo muy bonito, maravilloso y que le diría al emperador que le había gustado todo. Y así lo hizo. Los mentirosos estafadores pidieron más oro y se lo concedieron. Poco después, el emperador envió a otro ministro para inspeccionar el trabajo de los dos bandidos. Y le ocurrió lo mismo que al primero.',
  ),
  parrafo(
    `El emperador quiso ver la maravilla con sus propios ojos. Seguido por su ${glosa('comitiva', 'Acompañantes.')}, se encaminó a la casa de los estafadores. Al entrar, no vio nada. Los bandidos le preguntaron sobre el admirable trabajo y el emperador pensó:`,
  ),
  parrafo(
    '“¡Cómo! Yo no veo nada. Eso es terrible. ¿Estaré ciego o acaso no sirvo para emperador? Sería espantoso”. Con miedo de perder su trono, el emperador dijo:',
  ),
  parrafo('—Oh, sí, es muy bonita. Me gusta mucho. Estrenaré los vestidos en el desfile.'),
  parrafo(
    'Afuera, la gente lo esperaba. El emperador salió y caminó por las calles del pueblo sin llevar ningún traje. Nadie decía una sola palabra, para que los demás no se dieran cuenta de que tampoco veían nada, hasta que de pronto un niño exclamó:',
  ),
  parrafo('—¡Pero si no lleva nada!'),
  parrafo(
    '—¡Dios bendito, escuchen la voz de la inocencia! —dijo su padre; y todo el mundo fue repitiendo lo que acababa de decir el pequeño.',
  ),
  parrafo(
    `Aquello inquietó al emperador, pues sospechaba que el pueblo tenía razón y que había sido engañado; mas pensó: “Hay que aguantar hasta el fin”. Y siguió más ${glosa('altivo', 'Orgulloso, soberbio.')} que antes.<span class="mt-3 block text-right text-sm italic text-slate-500">Hans Christian Andersen, 1837 (adaptación).</span>`,
  ),
  imagen(
    '/img/i2_p13_act1.jpg',
    'El emperador desfila sin traje mientras el pueblo lo mira sorprendido y un niño lo señala.',
  ),
];

// 2. Mi emoción cuenta — respuesta personal, sin opción correcta: no se
// registra para calificar.
const emocion = (imagen: string, nombre: string) =>
  `<span class="flex flex-col items-center gap-1.5"><img src="${imagen}" alt="" class="h-16 w-16 object-contain" /><span class="font-semibold">${nombre}</span></span>`;

crearSeleccionMultipleSinEnunciado(2, {
  opciones: [
    emocion('/img/i1_p13_act2.png', 'Felicidad'),
    emocion('/img/i2_p13_act2.png', 'Ira'),
    emocion('/img/i3_p13_act2.png', 'Sorpresa'),
    emocion('/img/i4_p13_act2.png', 'Tristeza'),
  ],
  correctas: [],
  variante: 'circulo',
  columna: false,
  aleatorio: false,
});

// Revelado de la página a nivel general: cada párrafo y cada imagen del
// cuento aparece con su propio "Siguiente", luego el glosario y, al final,
// "Mi emoción cuenta".
const pasos: PasoRevelador[] = [
  ...bloquesCuento.map(el => ({ el })),
  { el: document.getElementById('glosario')! },
  { el: document.getElementById('paso2')! },
];
crearRevelador(pasos);
