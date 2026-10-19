/**
 * Atajo de HTML para no repetir a mano, en cada pregunta, el bloque
 * flotante de "puntaje + nota del docente" (input + "/ N pts" + leyenda
 * "Califica tu docente"). En vez de escribir todo ese markup, en el HTML
 * de la actividad basta con un solo div con dos o tres clases:
 *
 *   <div class="p4 punto2_5 c-d"></div>
 *
 * - "puntoN" / "puntoN_D" define el puntaje ("punto3" -> "3 pts",
 *   "punto2_5" -> "2,5 pts").
 * - "c-d" (opcional) indica que la pregunta la califica el docente: si
 *   está, se ve la leyenda "Califica tu docente"; si no está, la leyenda
 *   sigue existiendo (para no romper el espaciado del bloque) pero se
 *   pinta "text-white" para que quede invisible.
 * - "pN" indica el número de pregunta de la actividad: el catálogo de
 *   funciones (crearRenglones, crearCoevaluacion, etc.) busca el input de
 *   nota por su id ("pre{N}a") para incrustar ahí el resultado — por eso
 *   el <input> generado adentro de este bloque se crea con `id="pre{N}a"`.
 *   Si falta la clase "pN", en vez de adivinar se incrusta un aviso en
 *   rojo bien visible para que no pase desapercibido en pantalla/print.
 *
 * `expandirEtiquetas()` busca esos divs y los reemplaza por el bloque
 * completo. Se llama sola desde `crearMenu()`, así que no hace falta
 * invocarla a mano en cada actividad.
 */
const PUNTO_REGEX = /^punto(\d+)(?:_(\d+))?$/;
const PREGUNTA_REGEX = /^p(\d+)$/;

const CLASE_ETIQUETA_DOCENTE =
  'inline-block text-[11px] w-full text-center sm:text-xs text-slate-400 italic font-medium print:text-slate-600';
const CLASE_ETIQUETA_OCULTA =
  'inline-block text-[11px] w-full text-center sm:text-xs text-white print:text-slate-600';

function bloquePuntaje(
  puntosTexto: string,
  esDocente: boolean,
  numeroPregunta: string | null,
): HTMLDivElement {
  const claseEtiqueta = esDocente
    ? CLASE_ETIQUETA_DOCENTE
    : CLASE_ETIQUETA_OCULTA;
  const idInput = numeroPregunta ? `id="pre${numeroPregunta}a"` : '';
  // El ancho del input de nota va en px fijo (no "w-8"/--spacing): al
  // imprimir, --spacing y el font-size raíz se achican (fixes de impresión
  // #8 y #10), así que un ancho basado en la escala de espaciado se encoge
  // con todo el resto de la página y termina cortando la nota escrita
  // ("0.0" -> "0."). Un ancho literal en px queda inmune a esa compactación.
  const aviso = numeroPregunta
    ? ''
    : `<div class="mt-1 text-right text-[11px] font-bold text-red-600">
        Falta la clase (p#)
       </div>`;

  // "float-right": necesitamos que el ENUNCIADO (el texto que sigue justo
  // después de este badge) lo rodee como un párrafo normal — eso SOLO lo
  // hace un elemento flotante, "position: absolute" no reserva espacio ni
  // hace que el texto lo esquive, así que el texto le pasaba por encima.
  // El float SÍ tiene el efecto secundario de afectar el ancho de
  // cualquier hermano posterior en el mismo contexto de bloque (por eso el
  // widget que sigue se veía apretado) — pero eso ya no pasa: se blindó
  // específicamente a los contenedores de widgets (cualquier id "pNact")
  // en tailwind.css con "clear: both", así que solo el enunciado queda
  // expuesto al float (que es lo que queremos) y todo lo demás queda
  // protegido.
  const bloque = document.createElement('div');
  bloque.className = 'float-right ml-4';
  bloque.innerHTML = `
    <span class="${claseEtiqueta}">
      Califica tu docente
      ${aviso}
    </span>
    <div class="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-slate-200 rounded-lg shadow-sm transition-all focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 print:border-slate-400 print:shadow-none print:border">
      <input
        readonly
        type="text"
        ${idInput}
        placeholder="--"
        class="w-[36px]! text-center text-slate-800 font-bold bg-transparent border-none p-0 focus:outline-none focus:ring-0 print:placeholder-transparent"
      />
      <div class="flex items-center">
        <span class="text-slate-300 font-bold text-lg leading-none print:text-slate-400">/</span>
        <span class="text-slate-700 font-bold whitespace-nowrap print:text-slate-800 ml-1">${puntosTexto} pts</span>
      </div>
    </div>
  `;
  return bloque;
}

export function expandirEtiquetas(raiz: ParentNode = document): void {
  raiz.querySelectorAll<HTMLElement>('.c-d, [class*="punto"]').forEach(el => {
    const clases = el.classList;
    const esDocente = clases.contains('c-d');
    let puntosTexto = '--';
    let numeroPregunta: string | null = null;

    for (const clase of clases) {
      const coincidenciaPunto = clase.match(PUNTO_REGEX);
      if (coincidenciaPunto) {
        const [, entero, decimal] = coincidenciaPunto;
        puntosTexto = decimal ? `${entero},${decimal}` : entero!;
        continue;
      }
      const coincidenciaPregunta = clase.match(PREGUNTA_REGEX);
      if (coincidenciaPregunta) {
        numeroPregunta = coincidenciaPregunta[1]!;
      }
    }

    el.replaceWith(bloquePuntaje(puntosTexto, esDocente, numeroPregunta));
  });
}
