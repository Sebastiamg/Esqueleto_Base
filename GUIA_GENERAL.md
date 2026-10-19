# Guía general — digitalizar un libro de texto (plantilla reutilizable)

Contexto para pegar en un chat nuevo de Claude Code cuando se vaya a digitalizar
otro libro siguiendo este mismo framework. Da el/los PDF(s) de la unidad +
este archivo y pide que construya las actividades "al pie de la letra" según
lo de acá. Actualizada tras construir "Sinapsis Lengua 4" completo (6
unidades) sobre la base de "Folleto base" (Física).

## Qué es este proyecto

Proyecto Vite + TypeScript + Tailwind, sin backend. Cada SECCIÓN de un tema
de un libro impreso es un HTML standalone (autocalificable o no, según la
sección):

```
src/actividades/<archivo>.html    <- HTML de la actividad (Tailwind)
src/contenido/<archivo>.ts        <- lógica: crea widgets, arma onCalificar/total()
src/entries/<archivo>.entry.ts    <- entrypoint que importa estilos/vendor/contenido
```

`vite.config.ts` descubre las entradas automáticamente por glob de
`src/actividades/*.html` (ver `scripts/entradas.mjs`) — no hay que registrar
la actividad en ningún manifiesto central. `index.html` (en la raíz) es un
índice manual de enlaces a todas las actividades — agregar ahí cada archivo
nuevo, separando "lo real" de archivos de prueba.

`npm run dev` sirve ese índice en `/`. `npm run build` compila cada
actividad como UN solo archivo HTML (`vite-plugin-singlefile`) dentro de
`dist/`.

## Nomenclatura de archivos: `uni{U}_tem{T}_{seccion}`

A diferencia de "Folleto base" (`uniXactY`, una actividad = una pregunta de
examen), un libro de texto completo (Lengua, Naturales, Sociales…) se
digitaliza por **unidad → tema → sección pedagógica**. Cada tema de cada
unidad se parte en varios archivos, uno por sección:

| Sección | Qué contiene | ¿Se califica? |
|---|---|---|
| `experiencia` | La lectura/presentación inicial del tema (cuento, texto, diálogo…) + una primera pregunta de experiencia personal. | No — contenido/respuesta personal. |
| `reflexion` | Las preguntas de comprensión sobre esa lectura (literal, inferencial, crítico-valorativa). | Sí — `calificarActividad`. |
| `conceptualizacion` | La teoría del tema: definiciones, organizadores conceptuales, rutina de pensamiento ("Construyo mi aprendizaje"). | No. |
| `taller` | Práctica de producción (escritura, dibujo, exposición oral) + a veces una lista de verificación. | Mixto: la lista de verificación autocalifica, el resto lo revisa el docente (`c-d` / renglones). |
| `red_sinaptica` | Solo UNA vez por unidad (no por tema): mapa-resumen de TODOS los temas de la unidad, con un organizador por tema. | No. |

Mismo patrón de triplete de archivos que antes, solo cambia el nombre base:
`src/actividades/uni{U}_tem{T}_{seccion}.html` + `.ts` + `.entry.ts`.

## Flujo de trabajo (seguir en orden)

1. **Estudiar el PDF de la sección nueva** (renderizar páginas a PNG con
   PyMuPDF y leerlas con el tool de lectura de imágenes — ver sección
   "Extraer contenido del PDF" abajo). El PDF suele ser la edición CON
   respuestas (edición docente): el texto de las respuestas aparece ya
   escrito/resaltado en un color distinto — eso es la clave de calificación,
   no contenido a ocultar ni a copiar tal cual en el HTML.
2. **Estudiar 1-2 archivos YA construidos de la MISMA sección** (ej. otro
   `*_reflexion.ts` si estás por construir una `reflexion` nueva) — leer
   tanto el `.html` como el `.ts` completos, no solo fragmentos. Replicar
   esa estructura "al pie de la letra": mismas clases Tailwind, misma
   convención de ids, mismo patrón de `crearMenu`/`onCalificar`/`total()`.
3. **Resolver de una vez cualquier ambigüedad de nombres de archivo** con
   `AskUserQuestion` en vez de adivinar — en especial si el usuario menciona
   un nombre de actividad que ya existe con contenido real (no crear un
   archivo "de referencia" encima sin confirmar), o si pide algo cuyo
   formato de salida (Excel, JSON, nombres de columna) no está 100%
   especificado — mejor preguntar que inventar un esquema que rompa un
   importador externo.
4. **Elegir el widget correcto** para cada pregunta del PDF (ver catálogo
   abajo) y armar el plan de contenido completo ANTES de escribir código.
5. **Extraer imágenes reales embebidas en el PDF** (fotos, diagramas) que
   la actividad digitalizada deba mostrar — no inventar ni omitir si el
   original las trae. Ver convención de nombres y técnica de extracción
   abajo.
6. Escribir el triplete de archivos (`.html`, `.ts`, `.entry.ts`).
7. Verificar: `npx tsc --noEmit`, luego probar en el navegador de verdad
   (ver sección "Verificación" — el dev-server normal de este entorno puede
   apuntar al proyecto equivocado, hay una salida alternativa documentada).
8. `npm run build` para confirmar que compila como actividad standalone.
9. Limpiar: borrar `dist/`, detener cualquier servidor de desarrollo que se
   haya levantado a mano, borrar PNGs temporales del scratchpad.

## La estructura "PROPUESTA 4" (HTML) — copiar exactamente esta forma

```html
<!doctype html>
<html>
  <head>
    <title>Nombre del libro — Sección</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body class="bg-stone-50">
    <div class="book-page">
      <div class="book-card">
        <div class="book-card__body">
          <div id="encabezado" class="mb-8"></div>

          <!-- --- inicio --- -->

          <div class="mb-6 rounded-2xl border-2 border-violet-200 bg-linear-to-r from-violet-50 via-white to-violet-50 px-6 py-4 text-center">
            <strong class="text-lg font-black uppercase tracking-wide text-violet-700 sm:text-xl">
              Título de la sub-actividad 1
            </strong>
          </div>

          <!-- Preg 1 -->
          <!-- Pregunta 1 -->
          <div class="py-4 sm:py-5 print:py-3 flow-root">
            <!-- P1 punto# c-d -->
            <div class="p1 punto5"></div>
            <!-- Enunciado -->
            <div class="text-slate-800 text-base leading-relaxed mt-5 sm:mt-5">
              <span class="text-blue-600 font-bold text-lg mr-1.5">1.</span>
              <b>Verbo</b> el resto del enunciado tal como aparece en el libro.
            </div>
            <div class="w-full mt-6">
              <div id="p1act" class="w-full"></div>
            </div>
          </div>

          <!-- --- fin --- -->
        </div>
      </div>
    </div>

    <script type="module" src="/src/entries/<archivo>.entry.ts"></script>
  </body>
</html>
```

Reglas de esta estructura:

- Cada "Pregunta N" lleva SIEMPRE, arriba del todo, un comentario corto
  `<!-- Preg N -->` (solo el número, p.ej. `<!-- Preg 1 -->`, `<!-- Preg
  2 -->`) justo antes del comentario descriptivo `<!-- Pregunta N -->` que
  ya existía — sirve para ubicar una pregunta rápido con buscar-texto sin
  depender del título largo.
- Cada "Pregunta N" es un `div.py-4.sm:py-5.print:py-3.flow-root` que
  contiene, EN ESTE ORDEN: el badge de puntaje (`pN puntoX [c-d]`) — SOLO si
  esa pregunta se autocalifica o la corrige el docente con puntaje; una
  sección 100% de contenido/respuesta libre (`experiencia`,
  `conceptualizacion`, `red_sinaptica`) no necesita badge en absoluto —, el
  enunciado (con el número en `<span class="text-blue-600 font-bold
  text-lg mr-1.5">N.</span>` seguido de texto con `<b>` en el/los verbos
  de instrucción), y el/los `div` de montaje del widget.
- Cada sub-actividad distinta dentro del mismo archivo lleva su propia
  tarjeta de título ANTES de su "Pregunta", alternando el color de acento
  (violeta, naranja, y seguir con otros tonos de Tailwind si hay una
  tercera/cuarta sub-actividad: ámbar, esmeralda, etc.).
- El badge `pN puntoX [c-d]` lo genera `etiquetas.ts` en tiempo de
  ejecución a partir de esa clase — `X` es el puntaje total de ESA
  pregunta (puede cubrir más de un widget si van agrupados), `c-d` es
  opcional y marca "corrección docente" (no autocalificable, p.ej. un
  dibujo libre o renglones de texto libre): si está presente, ese widget
  NUNCA se llama dentro de `total()`.
- Toda imagen de apoyo centrada usa:
  ```html
  <div class="w-full flex justify-center">
    <img src="/img/iN_pPP_actQ.png" style="border-radius: 10px; width: 60%" />
  </div>
  ```
- **El contenedor de widget SIEMPRE va envuelto en un `<div class="w-full
  mt-6">...</div>`** — nunca lleva su propio margen/top (nada de `mt-3`,
  `mt-4` directo en el `id="pNact"`): ese espaciado de separación respecto
  al enunciado lo pone SIEMPRE el `div` envoltorio, no el widget. El propio
  `#pNact` nunca lo crea la función del catálogo, solo lo busca por id:
  ```html
  <div class="w-full mt-6">
    <div id="pNact" class="w-full"></div>
  </div>
  ```
  Si bajo esa misma pregunta hay contenido estático ADEMÁS del widget (una
  imagen, una tabla fija, renglones sueltos), ese contenido también va
  DENTRO de ese mismo envoltorio `w-full mt-6`, junto al `#pNact` (o varios
  `#pN_Mact`) que corresponda — el envoltorio es por PREGUNTA, no por
  widget individual.

## Convención de imágenes extraídas del PDF

`public/img/i{n}_p{página impresa}_act{N}.png` (o `.jpg` para fotos/fondos
grandes, más liviano que PNG), donde:
- `n` = índice de la imagen dentro de esa página (1, 2, 3…).
- `página impresa` = número de página tal como aparece impreso en el PDF
  (no el índice de página del PDF ni el nombre del archivo).
- `act{N}` = a qué "Pregunta"/sección de la actividad pertenece esa imagen.

Extraer SIEMPRE la imagen real embebida en el PDF (no un placeholder, no
una versión reescalada a mano) usando PyMuPDF (ver sección siguiente),
ignorando imágenes puramente decorativas de fondo de página (texturas,
iconos repetidos del layout editorial) — solo fotos/diagramas/personajes
que la actividad digitalizada necesita mostrar.

## Extraer contenido del PDF (Python + PyMuPDF)

Renderizar cada página a PNG para poder leerla con el tool de lectura de
imágenes:

```bash
python -c "
import fitz
doc = fitz.open(r'RUTA_AL_PDF.pdf')
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(2.5, 2.5))
    pix.save(f'pagina_{i+1}.png')
"
```

Extraer imágenes embebidas reales (fotos/diagramas) de una página, UNIENDO
su máscara de transparencia (smask) si la trae — si solo se extrae el
xref base, un recorte con fondo transparente se guarda con fondo NEGRO:

```bash
python -c "
import fitz
doc = fitz.open(r'RUTA_AL_PDF.pdf')
page = doc[0]  # página 0-indexed
for xref, smask, *_ in page.get_images(full=True):
    pix = fitz.Pixmap(doc, xref)
    if pix.n - pix.alpha >= 4:
        pix = fitz.Pixmap(fitz.csRGB, pix)
    if smask:
        pix = fitz.Pixmap(pix, fitz.Pixmap(doc, smask))  # combina color + alfa real
    print(xref, pix.width, pix.height, pix.alpha)
    pix.save(f'img_{xref}.png')
"
```

Filtrar por dimensiones/xref para descartar texturas de fondo de página
(suelen ser una imagen enorme cubriendo toda la página, presente en TODAS
las páginas con el mismo tamaño) — las fotos/diagramas/personajes de
contenido son las que cambian de una pregunta a otra.

**Si un personaje/ícono viene recortado SOBRE FONDO BLANCO (no transparente)
y hay que ponerlo dentro de una tarjeta/mapa con otro fondo**: no hay
`smask` que combinar — hay que QUITAR el blanco a mano con un flood-fill
desde las 4 esquinas (deja intacto el blanco que sí es parte del dibujo,
ej. los ojos):

```python
from PIL import Image
import numpy as np
from collections import deque

def transparente(path, tol=18):
    im = Image.open(path).convert('RGBA'); a = np.array(im); h, w = a.shape[:2]
    vis = np.zeros((h, w), bool); q = deque([(0,0),(0,w-1),(h-1,0),(h-1,w-1)])
    def claro(p): return p[0] > 255-tol and p[1] > 255-tol and p[2] > 255-tol
    while q:
        y, x = q.popleft()
        if y<0 or x<0 or y>=h or x>=w or vis[y,x]: continue
        vis[y,x] = True
        if not claro(a[y,x]): continue
        a[y,x,3] = 0
        q.extend([(y+1,x),(y-1,x),(y,x+1),(y,x-1)])
    out = Image.fromarray(a); bb = out.getbbox()
    return out.crop(bb) if bb else out
```

Guardar los renders/extracciones en el directorio de scratchpad de la
sesión (nunca en el repo) y copiar a `public/img/` solo el resultado final
ya procesado; borrar los temporales al terminar.

## Catálogo de widgets (`src/vendor/funciones/index.d.ts`) — leer el `.d.ts`
## exacto antes de usarlo, esto es solo un resumen para elegir cuál sirve

Todas las funciones `crear*` siguen la firma
`crear*(id, datos, puntaje?)` y devuelven una instancia con `revisar()`,
`obtenerResultado()` y `reiniciar()`. Ninguna crea su propio contenedor:
buscan el `div#p{id}act` que ya debe existir en el HTML (excepto
`crearRenglones()` sin argumentos — ver abajo).

| Función | Para qué sirve | `.revisar()` expone `.nota`? |
|---|---|---|
| `crearRellenarEspacios` | Párrafo(s) con espacios en blanco, banco de palabras (`modo:'select'`) o texto libre (`modo:'input'`). | Sí |
| `crearRelacionarLiteral` | Relacionar término (columna izq., se le asigna letra sola) con enunciado (columna der.), sin dibujar líneas. | Sí |
| `crearRelacionar` | Igual pero dibujando cuerdas/líneas entre las dos columnas — ancla cada línea a un punto redondo (`.rounded-full`) DENTRO de cada tarjeta, no al borde; al imprimir recalcula sola vía su propio listener de `beforeprint` (ver gotcha de impresión abajo). | Sí |
| `crearCompletarTabla` | Tabla real con columnas, celdas fijas (`{etiqueta}`) y celdas editables (string/number). | **No** — solo `{correctas, total, porcentaje}` |
| `crearSeleccionMultipleSinEnunciado` | Marcar VARIAS opciones de una lista (checkbox), sin enunciado propio — para usar como "fila" repetida bajo un enunciado/tabla común. | **No** — solo `{correctas, total, porcentaje}` |
| `crearSeleccionSimpleSinEnunciado` / `ConEnunciado` | Igual pero una sola opción correcta (excluyente). | comprobar `.d.ts` |
| `crearVerdaderoFalso` | Lista de enunciados con Verdadero/Falso. | comprobar `.d.ts` |
| `crearResaltarPalabras` | Marcar palabras dentro de un texto corrido. | comprobar `.d.ts` |
| `crearListaVerificacion` | Rúbrica simple "Indicador → Sí/No" para autoevaluación (ej. al final de un taller de escritura). | comprobar `.d.ts` |
| `crearLienzo` | Uno o más `<canvas>` de dibujo libre. NUNCA autocalificable — siempre `c-d` en el badge, nunca se llama en `total()`. | n/a |
| `crearCoevaluacion` | Rúbrica de coevaluación entre estudiantes. | n/a — no aporta a `total()` |
| `crearPanelInformativo` | Bloque de contenido puro (título + texto + imagen opcional), sin calificación. | n/a |
| `crearRutinasPensamiento` | Tarjetas tipo "Pienso / Me interesa / Investigo" con franja de color + renglones de escritura debajo. Para el cierre "Construyo mi aprendizaje" de `conceptualizacion`. | n/a — no se califica |
| `crearRenglones()` **sin argumentos** | Modo automático: convierte TODO `<div class="bookText lnN">` del documento en un campo de renglones que crece solo. Usar este modo (no el de `id`+`config`) cuando los renglones van sueltos dentro de HTML a mano (talleres, respuestas abiertas dentro de un mapa). | n/a |

**IMPORTANTE — no asumir que todo trae `.nota`:** `crearRellenarEspacios`,
`crearRelacionarLiteral` y `crearRelacionar` sí exponen `.nota` (ya
ponderada 0–puntaje) directamente en el resultado de `.revisar()`.
`crearCompletarTabla` y `crearSeleccionMultipleSinEnunciado` (y
posiblemente otras — VERIFICAR el `.d.ts` de cada una antes de escribir
`total()`) **no** tienen `.nota`, solo `{correctas, total, porcentaje}` —
en esos casos hay que multiplicar a mano:
`resultado.porcentaje * puntajeDeEsaPregunta`.

### Patrón para una matriz/tabla de checkboxes (sin widget nativo de grilla)

Si el PDF trae una tabla "Situación × Tipo, marca con X" y no hay un
widget que soporte una grilla completa: usar UNA instancia de
`crearSeleccionMultipleSinEnunciado` POR FILA (una por situación),
`columna:false`, con su propio enunciado como texto plano justo antes del
`div` de montaje (`id="pN_Mact"`), y sumar el promedio de sus
`.porcentaje` en `total()`. No hace falta una fila de encabezado manual
con los nombres de las columnas — cada instancia ya muestra sus propias
opciones (`opciones: [...]`) como etiquetas visibles junto a cada
casilla, así que un encabezado aparte casi siempre queda desalineado con
las cajas reales del widget.

## Organizadores gráficos / mapas conceptuales (`src/organizadores/`)

Motor propio, reutilizable, para cualquier mapa conceptual/mental con
revelado paso a paso — NO depender de una librería externa (React Flow,
Mermaid, GoJS, etc. se evaluaron y se descartaron: o exigen meter un
framework entero para un puñado de nodos, o no permiten Tailwind dentro
de cada nodo, o no resuelven la impresión). Motor: HTML + SVG + Tailwind
puro, ~0 dependencias.

```ts
import { crearOrganizador, type NodoMapa } from '../organizadores';

crearOrganizador(2, {
  raiz: {
    tipo: 'rama', // 'raiz' | 'rama' | 'hoja' | 'nota' | 'tarjeta' | 'libre'
    texto: 'Estructura del cuento',
    clase: 'rounded-full bg-blue-700 text-white px-6', // Tailwind, pisa el preset del "tipo"
    conectorHijos: { clase: 'stroke-blue-700' }, // color de TODAS las líneas que bajan de este nodo
    hijos: [ /* más NodoMapa, anidables sin límite */ ],
  },
});
```

- `tipo:'tarjeta'` es el único con `titulo`+`texto` separados (franja de
  color arriba + cuerpo abajo) — para las típicas tarjetas "Inicio / Nudo /
  Final" o "Pienso / Me interesa / Investigo".
- Para meter una imagen real dentro de un nodo (ej. "Protagonista" con su
  ilustración), usar `tipo:'libre'` y poner el `<img>` directo dentro de
  `texto` (admite HTML completo).
- `conector.etiqueta` pone una palabra sobre la línea (ej. "es", "se divide
  en").
- Monta en `<div id="p{id}act">`, igual convención que el resto del
  catálogo.

### Integrarlo en el revelador de página (ver sección siguiente)

Si el mapa vive DENTRO de una secuencia de revelado general (lo normal),
pasarle `controles: false` (para que no traiga su propia barra, duplicada
con la de la página) y pasar la instancia devuelta a `crearRevelador(...)`
— sus nodos pasan a ser varios "pasos" más de la misma secuencia
automáticamente, sin código extra.

## Revelador de página (`src/app/revelador.ts`)

Para cualquier sección donde el contenido deba aparecer DE A POCO al
pulsar un único botón "Siguiente" general (lectura de un cuento, teoría de
`conceptualizacion`…), en vez de mostrar todo de golpe. Un bloque simple
(un párrafo, una imagen, una tarjeta) cuenta como 1 paso; un mapa
conceptual (`crearOrganizador` con `controles:false`) aporta tantos pasos
como nodos tenga — todo bajo UN SOLO contador y UNA sola barra fija abajo.

```ts
import { crearRevelador, type PasoRevelador } from '../app/revelador';

const parrafo = (html: string) => {
  const p = document.createElement('p');
  p.className = 'w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 text-center leading-relaxed text-slate-700 shadow-card sm:p-5';
  p.innerHTML = html;
  document.getElementById('p1act')!.append(p);
  return p;
};

const bloques = [parrafo('...'), parrafo('...') /* … */];

const pasos: PasoRevelador[] = [
  ...bloques.map(el => ({ el })),
  { el: document.getElementById('mapaWrapper')!, organizador: miMapa }, // mapa = varios pasos
  { el: document.getElementById('paso-final')! },
];
crearRevelador(pasos);
```

Notas clave:

- Cada `el` necesita existir en el HTML envuelto en su propio contenedor
  (`<div id="pasoN">`) si agrupa varias cosas, o puede ser el elemento
  suelto (un `<p>`, un `<figure>`) si es un bloque simple.
- El motor colapsa lo no revelado con `display:none` (no solo
  `opacity:0`) — así la página no reserva desde el inicio el alto de TODO
  lo que falta por aparecer; crece de a poco. Al volver a mostrarse, le
  devuelve su `display` UN FRAME antes de animar la entrada (si no, el
  navegador nunca pinta el estado "oculto" y la transición no se nota).
- Al pulsar "Siguiente" hace scroll suave hasta el bloque nuevo — SOLO al
  entrar a un bloque distinto, no en cada nodo interno de un mismo mapa
  (ya está a la vista).
- `crearCuento` (el widget del catálogo con su propio
  "Comenzar"/"Anterior"/"Siguiente") quedó DESCARTADO en este proyecto:
  traía su propia barra, duplicada con la del revelador de página. Para
  una lectura/cuento, armar los párrafos/imágenes A MANO (ver arriba) y
  dejar que el revelador los controle — no usar `crearCuento` si la
  sección ya tiene su propio revelador general.
- En impresión, CSS puro (`@media print`) fuerza todo visible y oculta la
  barra — no depende de JS ni de recalcular posiciones (a diferencia de
  las líneas de los mapas, que sí necesitan recalcularse en el iframe de
  impresión — ya resuelto en `print.ts`, no tocar esa parte).
- NO se usan en `uni_tem_reflexion` (esas preguntas se muestran todas de
  una, sin revelado progresivo) — es una decisión de este proyecto
  específico: confirmar con el usuario si aplica igual en uno nuevo.

## Patrón de `src/contenido/<archivo>.ts`

```ts
import { crearMenu } from '../app/menu';
import { crearEncabezado } from '../app/header';

const encabezado = crearEncabezado(document.getElementById('encabezado')!, {
  unidad: U,
  tema: 'Nombre del tema tal como aparece en el libro',
  pagina: PP, // número de página IMPRESO del libro
});

crearMenu({
  ayudas: [
    '<b class="text-blue-600">En la pregunta 1</b>, instrucción breve.',
    '<b class="text-blue-600">En la pregunta 2</b>, instrucción breve.',
  ],
  onCalificar: () => {
    const notaTotal = total();
    return notaTotal;
  },
  onNombreEstudiante: nombre => encabezado.mostrarAlumno(nombre),
});

const p1 = crearAlgunWidget(1, { /* datos */ }, 5);
const p2 = crearOtroWidget(2, { /* datos */ }, 5);

function total() {
  const total1 = p1.revisar().nota; // o `.porcentaje * puntaje` si el widget no trae `.nota`
  const total2 = p2.revisar().nota;
  return total1 + total2;
}
```

Si la sección NO se califica (`experiencia`, `conceptualizacion`,
`red_sinaptica`, y la mayor parte de `taller`): `onCalificar: () =>
undefined` — el menú igual pide el nombre del estudiante e imprime, solo
que no escribe ninguna nota.

Notas de este patrón:

- `crearMenu(...)` se llama ANTES de declarar `const p1 = ...` etc. Esto
  funciona porque `onCalificar`/`total()` solo se EJECUTAN al pulsar
  "Calificar" (mucho después de que el script terminó de correr
  top-to-bottom y ya asignó todas las `const`) — el closure sobre
  variables `const` declaradas más abajo en el archivo es válido en JS
  siempre que no se invoquen antes de esa línea.
- `total()` debe devolver un número 0–10 (la suma de los puntajes de
  cada pregunta, normalmente 5+5). Ese retorno es lo único que hace falta
  para que "Nota __ / 10" en el encabezado se actualice solo — no hay que
  llamar a `encabezado.mostrarNota(...)` a mano dentro de `total()`
  (`crearMenu` ya lo hace por medio de `mostrarNota` si `onCalificar`
  devuelve un `number`).
- Si una pregunta es de corrección docente (dibujo libre, renglones de
  texto libre, ensayo, etc.): el badge lleva `c-d` en el HTML y esa
  pregunta simplemente NO se incluye dentro de `total()` — no se registra
  ni se suma su resultado. Alternativa más simple para secciones enteras
  de corrección docente (ej. `taller`): usar `calificarActividad(document,
  encabezado)` como `onCalificar` directamente (ver `grading.ts`) — ya
  recorre todo lo `registrar()`ado y suma solo.

## `src/entries/<archivo>.entry.ts` (siempre igual, cambiar solo el import)

```ts
import '../styles/tailwind.css';
import '../vendor/funciones/funciones.css';
import '../vendor/funciones/index.js';
import '../contenido/<archivo>';
```

Si la sección usa mapas conceptuales, sumar
`import '../organizadores/organizadores.css';`. Si usa el revelador de
página, sumar `import '../app/revelador.css';`.

## Verificación

1. `npx tsc --noEmit` — debe pasar sin errores.
2. Prueba visual real en navegador. **Cuidado**: el dev-server preconfigurado
   en `.claude/launch.json` (`vite-dev`) puede quedar apuntando al cwd de
   una sesión/proyecto vieja si hay procesos vite huérfanos corriendo en
   otros puertos — si el preview muestra el proyecto equivocado o un
   listado de actividades que no incluye las nuevas, NO asumas que el
   archivo está mal: levantá un servidor vite manual desde la carpeta
   correcta del proyecto y navegá a ese puerto:
   ```bash
   npx vite --port 5599 --strictPort
   ```
   y abrir `http://localhost:5599/src/actividades/<archivo>.html` — abrir
   el archivo directo como `file://` no sirve porque los `<script
   type="module">` no cargan por CORS.
3. En el navegador: revisar consola (sin errores), completar al menos un
   campo de cada widget, pulsar "Calificar" (vía el menú hamburguesa,
   ícono verde ✓) y confirmar que la "Nota __ / 10" del encabezado
   coincide con la suma esperada de cada sub-pregunta.
4. `npm run build` — debe compilar la actividad nueva como parte del
   listado de "N actividad(es) compiladas en dist/".
5. Limpieza: `rm -rf dist`, matar el proceso de `npx vite --port 5599`
   levantado a mano, borrar PNGs temporales usados para leer el PDF.

## Errores ya conocidos a evitar

- **No asumir `.nota` en todos los widgets** — ver tabla del catálogo.
  `crearCompletarTabla` y `crearSeleccionMultipleSinEnunciado` solo traen
  `.porcentaje`.
- **No usar `position:absolute` para el badge de puntaje** — el badge de
  `etiquetas.ts` usa `float-right` a propósito para que el enunciado lo
  rodee como texto normal; si hace falta blindar el ancho de un widget
  contra el efecto lateral de ese float, la solución ya existe en
  `tailwind.css` (`[id$='act'] { clear: both; }`) — no hay que tocarla ni
  reinventarla.
- **Los `<canvas>` no sobreviven el clonado para imprimir por su cuenta**
  — ya está resuelto en `print.ts` (captura `toDataURL()` antes de
  clonar); no hay que replicar esa lógica al crear una nueva actividad,
  solo saber que existe si aparece un bug de "el dibujo no se imprime".
- **`crearRelacionar` (unir con líneas) puede imprimir las cuerdas
  cruzadas/mal ubicadas** si el estudiante respondió en un ancho de
  pantalla muy distinto al de impresión (816px) y el texto de las
  tarjetas envuelve distinto — `print.ts` ya trae un recálculo (margen
  fijo desde el borde de la tarjeta). Si vuelve a fallar, NO reinventar la
  fórmula a ciegas: inspeccionar primero `src/vendor/funciones/index.js`
  (el bundle minificado) para confirmar a qué punto exacto ancla la
  cuerda la versión ACTUAL del widget — ese bundle se regenera desde el
  proyecto hermano "funciones" y el punto de anclaje puede cambiar entre
  versiones sin aviso.
- **`crearRenglones()` en modo automático necesita su campo con
  `min-height`** — con `field-sizing: content` (fix de impresión en
  `tailwind.css`) un campo vacío mide 1 renglón aunque pida `lnN` más
  grande; ya está resuelto con reglas `textarea[data-lineas-minimas='N']
  { min-height: ... }` en `tailwind.css` hasta `ln8` — si se necesita un
  `lnN` más grande, agregar la regla que falte ahí, no en el archivo de
  la actividad.
- **La voz (botón "Escuchar" de Ayudas) debe fijar `lang`** —
  `SpeechSynthesisUtterance` sin `.lang` deja que el navegador elija idioma
  según el SISTEMA del estudiante, no el del libro (ya fijado a `es-ES` en
  `speech.ts`, no tocar). Y debe leer el `<li>` ya renderizado
  (`.textContent`), nunca las strings crudas de `ayudas` (que admiten HTML
  como `<b>`) — si no, lee las etiquetas en voz alta.
- **No inventar ambigüedades de nombres de archivo ni de formato de
  salida** — si el nombre de actividad que pide el usuario para el
  contenido NUEVO coincide con uno que ya tiene contenido real (posible
  referencia a estudiar), o si pide un export (Excel, JSON) cuyo esquema
  exacto no está especificado del todo, preguntar con `AskUserQuestion`
  antes de sobrescribir o inventar un formato.

## Impresión: por qué un widget "se ve bien en pantalla pero mal impreso"

`print.ts` SIEMPRE monta la actividad a imprimir en un ancho de **816px
fijos** (`ANCHO_IMPRESION_PX`), sin importar si el estudiante la respondió
en celular o en PC (ver el comentario de `imprimirActividad()` para el
porqué). Ese número — 816px — cae **entre** los breakpoints `md:`
(768px) y `lg:` (1024px) de Tailwind.

Consecuencia directa: **cualquier clase `lg:` (o cualquier breakpoint
≥1024px) en un widget del catálogo NUNCA se activa al imprimir**, aunque
en una pantalla de computadora normal (que sí suele pasar de 1024px) se
vea perfecto. Ya pasó con `crearRutinasPensamiento`: reparte sus tarjetas
en 3 columnas recién en `lg:`, así que al imprimir se quedaban en 2
columnas y la 3ª se caía a una hoja aparte — más hojas de las necesarias,
rompiendo la premisa de "la menor cantidad de hojas posibles". Se corrigió
SIN tocar el widget (es del proyecto hermano "funciones", vendido como
bundle) agregando en `tailwind.css`, dentro de `@media print`, una regla
que fuerza el ancho de 3 columnas apuntando a la clase exacta que usa esa
versión del widget — revisar siempre `src/vendor/funciones/index.js`
(bundle minificado) para confirmar la clase real ANTES de escribir la
regla, puede cambiar entre versiones del bundle.

**OJO al probar esto en el navegador de Claude Code**: `@media print`
SOLO se activa con una impresión de verdad (o con la emulación de medios
de DevTools) — ni `dispatchEvent(new Event('beforeprint'))` ni leer
`getComputedStyle(...)`/`getBoundingClientRect()` en el contexto normal
de pantalla lo disparan, así que una prueba así SIEMPRE va a mostrar el
layout de pantalla, aunque la regla esté bien escrita. Para confirmar que
la regla se compiló (sin poder ver el resultado final impreso), buscarla
en el `CSSOM` ya compilado:

```js
[...document.styleSheets].flatMap(s => {
  try { return [...s.cssRules]; } catch { return []; }
}).filter(r => r.media?.mediaText.includes('print'))
  .flatMap(r => [...r.cssRules])
  .map(r => r.cssText);
```

### Prompt para pedir una función nueva al proyecto "funciones" (vendor)

Si hay que pedir (en otro chat, sobre el proyecto "funciones") una función
nueva o un cambio a una existente, agregar siempre esta instrucción:

> Este widget se usa en un libro digital que SIEMPRE se imprime montado a
> un ancho fijo de 816px (ni celular ni pantalla grande — ese número
> exacto, sin importar el dispositivo real). Cualquier layout responsive
> dentro del widget (columnas, grillas, lo que sea que cambie según el
> ancho) tiene que verse completo y correcto a 816px — no uses un
> breakpoint `lg:` (1024px) ni mayor para decidir cuántas columnas/filas
> mostrar, porque a 816px nunca se activa y el layout se queda en la
> versión "angosta" también al imprimir. Si necesitás un breakpoint,
> usá como mucho `md:` (768px) o uno arbitrario tipo `min-[816px]:`, o
> mejor: que el layout final (el de pantallas grandes) sea el que se ve
> YA desde 768-816px en adelante, sin otro salto después.

Y como regla de verificación propia (no del widget): toda actividad nueva
que use columnas/grillas responsive debe probarse SIEMPRE con la ventana
emulada a 816px de ancho (no solo mobile/desktop por defecto) antes de
darla por terminada — es el ancho real al que se va a imprimir.
