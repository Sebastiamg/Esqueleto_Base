# Guía general — digitalizar un libro de texto (plantilla reutilizable)

Contexto para pegar en un chat nuevo de Claude Code cuando se vaya a digitalizar
otro libro siguiendo este mismo framework. Da el/los PDF(s) de la unidad +
este archivo y pide que construya las actividades "al pie de la letra" según
lo de acá. Actualizada tras construir "Sinapsis Lengua 4" completo (6
unidades) sobre la base de "Folleto base" (Física). La última sección
("Publicación: Excel de control, Flip PDF y plataforma") documenta lo que
sigue a construir las actividades: registro en Excel, íconos en Flip,
publicación y registro en la plataforma con el programa Publicador.

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

Para compilar una sola unidad: `npm run build:uni1` … `npm run build:uni6`
(`scripts/build.mjs` recibe el número de unidad). Cada uno compila los
archivos `uni{U}_*` de esa unidad **más todo lo que no empiece por
`uni1_`…`uni9_`**, que entra en todos los builds por unidad: así
`uni0_tem0_diagnostica` (y cualquier archivo sin prefijo de unidad, incluidos
los de prueba como `uniMapaExample`) sale siempre. Igual que `npm run build`,
vacía `dist/` antes de empezar: después de un `build:uni*`, `dist/` tiene
solo esa unidad. Si la unidad no tiene archivos, se detiene con un aviso.
Para otra unidad (7, 8…) basta copiar la línea en `package.json` cambiando
el número.

## Nomenclatura de archivos: `uni{U}_tem{T}_{seccion}` y `uni{U}_red_sinaptica`

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
| `red_sinaptica` | Solo UNA vez por unidad (no por tema): mapa-resumen de TODOS los temas de la unidad, con un organizador por tema. Siempre `uni{U}_red_sinaptica`, **sin número de tema** (se registra en el tema "Red sináptica de ideas" de su unidad; antes era `uni{U}_tem6_red_sinaptica` y `npm run registro` avisa si queda alguno con ese nombre). | No. |
| `aplico` | Actividades de Aplicación (ReflejArte, Rincón de expresión cultural, etc.). | Sí. |
| `sumativa` | Evaluación sumativa de la unidad. | Sí. |
| `diagnostica` | Evaluación diagnóstica del libro: `uni0_tem0_diagnostica`. | Sí. |

Mismo patrón de triplete de archivos que antes, solo cambia el nombre base:
`src/actividades/uni{U}_tem{T}_{seccion}.html` + `.ts` + `.entry.ts`
(la red sináptica: `uni{U}_red_sinaptica.html` + `.ts` + `.entry.ts`).
Los archivos históricos `uniXactY` (formato anterior) no se renombran.

Cada HTML es UN registro en la plataforma (un "grupo de actividades") y
UN ícono en Flip; cada pregunta dentro de él es una "miniactividad".
Tipo en plataforma según la sección: `experiencia`, `conceptualizacion` y
`red_sinaptica` = animación (1); `reflexion`, `taller`, `aplico`,
`sumativa` y `diagnostica` = actividad (0).

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
10. `npm run registro` y revisar sus avisos (`!`): confirma que están todas
    las miniactividades del PDF, con su página (ver "Registro de
    actividades"). Si el proyecto no tiene el script, instalarlo primero
    (ver "Instalar el script" en esa sección).
11. Con la unidad o el libro completo: registrar y publicar siguiendo la
    sección final "Publicación: Excel de control, Flip PDF y plataforma".

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

- Cada "Pregunta N" lleva SIEMPRE, arriba del todo, UN solo comentario
  corto `<!-- Preg N -->` (solo el número, p.ej. `<!-- Preg 1 -->`) — sirve
  para ubicar una pregunta rápido con buscar-texto. No se agrega otro
  `<!-- Pregunta N -->` (era un duplicado). Ningún comentario lo lee
  `npm run registro`: el número sale del `<span>` del enunciado.
- **Página impresa por pregunta (`data-pagina`)**: si una pregunta empieza
  en una página impresa distinta a la del encabezado (`pagina` de
  `crearEncabezado`), su `div` lleva `data-pagina="NN"`. Vale para esa
  pregunta y las siguientes hasta el próximo `data-pagina`; las que no
  cambian de página no lo llevan. No se ve en pantalla: lo lee
  `npm run registro`.
  ```html
  <div class="py-4 sm:py-5 print:py-3 flow-root" data-pagina="13">
  ```
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
| `crearRelacionarTresColumnas` | Lado ← centro → lado unidos con líneas (ej. tema principal / texto / intención del autor). Se imprime sin recalcular nada. | Sí |
| `crearEscalaNivel` | "Pinta el nivel" de "Mi emoción cuenta": baterías que se rellenan desde abajo. Respuesta personal. | n/a — no se califica |
| `crearSopaLetras` | Sopa de letras (la cuadrícula se genera sola con las palabras). | comprobar `.d.ts` |
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

## Funciones propias del libro (`src/funciones/`)

Si una pregunta del PDF no encaja en ningún widget del catálogo:

- **Función general** (sirve para cualquier libro: escala de nivel,
  sopa de letras…): se crea en el repo del catálogo
  (`C:\Users\PROLIPA\Desktop\Funciones\funciones`, siguiendo sus MD), se
  compila con `npm run build:index` y se copian los 3 archivos de
  `dist-funciones` (`index.js`, `index.d.ts`, `funciones.css`) a
  `src/vendor/funciones/` del libro.
- **Función específica** (solo tiene sentido en este libro): va en
  `src/funciones/<nombre>/index.ts` del propio libro, con el mismo
  contrato que el catálogo (`crearX(id, datos, puntaje)` busca `#p{id}act`
  y `#pre{id}a`, devuelve `{ revisar, obtenerResultado, reiniciar }` con
  `nota`). Se importa directo desde el `.ts` de contenido
  (`import { crearX } from '../funciones/x'`). Su encabezado explica cómo
  pasarla al catálogo si después se vuelve general.
  `tailwind.css` ya escanea esa carpeta (`@source '../funciones'`).

Lengua 9: `crearElegirMayuscula` (U1 T4: elegir mayúscula/minúscula;
Rellenar espacios NO distingue mayúsculas a propósito y no se modifica).
`crearRelacionarTresColumnas` nació aquí (U1 T3) y ya pasó al catálogo:
cuando una función específica resulta útil en general, se lleva al
catálogo (sus 3 MD + `meta` con demo), se compila, se copia al vendor y se
borra la copia del libro (el `.ts` de contenido la usa como global, sin
import).

**Antes de armar algo a mano, buscar en el catálogo.** Si el libro trae
una rutina de pensamiento, una lista de cotejo, una tabla para completar,
etc., se usa la función del catálogo (`crearRutinasPensamiento`,
`crearListaVerificacion`, `crearCompletarTabla`…) aunque haya que
adaptar títulos o colores; HTML a mano solo si de verdad no existe.

## Glosario en línea (`src/app/glosario.ts`)

Las palabras del glosario del libro NO van en una caja aparte: se resaltan
dentro del texto y su significado aparece en una burbuja al pasar el mouse
(o al tocarla / enfocarla con teclado). Al imprimir, el significado sale
entre paréntesis después de la palabra.

```html
<span class="glosa" data-significado="Plancton marino o de aguas dulces.">zooplancton</span>
```

Y en el `.ts`, DESPUÉS de crear todo el contenido (si un widget pinta el
texto, después de crear ese widget):

```ts
import { activarGlosario } from '../app/glosario';
activarGlosario();
```

Marcar solo la primera aparición de cada palabra, con la definición tal
como la trae el glosario del libro.

## Qué se digitaliza del libro y qué no

Sí: todo lo que el estudiante lee o responde, incluidas Prelectura y
Durante la lectura (preguntas dentro de la lectura). No: recuadros
"¡Ponte pilas!", "Ciudadano digital", "¿Sabías que…?" y los códigos de
destreza (LL.4.x, C.F., C.T.…).

## Estándar de calidad (detalles que se mantienen en todo el libro)

Lo que hace que la actividad se sienta "el libro, pero interactivo".
Revisar esta lista en cada sección nueva:

- **Idéntico al libro.** Mismo orden, mismos textos (sin corregir ni
  resumir; las erratas del libro se dejan), mismos colores de cajas y
  títulos, mismas imágenes recortadas del PDF, misma disposición
  (columnas, tarjetas, pastillas de color). Primero se mira la página
  renderizada y después se elige el widget.
- **Imagen con texto encima** (globos de diálogo, chat de celular,
  rótulos sobre una foto): el texto va como HTML posicionado ENCIMA de la
  imagen, en el mismo lugar que el libro y en todos los tamaños: contenedor
  `@container` + `position:relative`, cada globo `position:absolute` con
  `left/top/width` en % y `font-size` en `cqw` (escala con la imagen). CSS
  propio en el `<style>` de la actividad (ver "Errores ya conocidos").
  Revisar que ningún texto se desborde (`scrollHeight > clientHeight`).
- **Glosario** resaltado en el texto con burbuja al pasar el mouse (ver
  "Glosario en línea"), nunca una caja aparte.
- **Tablas anchas**: dentro de `<div class="overflow-x-auto">` con la
  tabla en `min-w-[40rem]` (o lo que pida): en celular se desliza la tabla
  y no la página; al imprimir el scroll se suelta solo (fix #1).
- **Íconos**: el de cada sección (Experiencia, Reflexión, Prelectura,
  Ideas mágicas…) como en el Tema 1 (`h-8`–`h-12`); los de habilidades
  cognitivas que van al lado (Atención, Percepción, Emoción, Memoria,
  Memoria de trabajo, Pensamiento, Flexibilidad cognitiva, Control
  inhibitorio) siempre `h-14`.
- **Toda pregunta lleva su renglón**: debajo de cada pregunta (cada
  "¿…?", también en tareas orales, viñetas de Prelectura/Durante la lectura
  o "Comenta oralmente") va al menos un `<div class="bookText ln1"></div>`.
  Es lo único que se agrega aunque el libro no dibuje líneas; fuera de eso
  no se inventan campos.
- **Prelectura y Durante la lectura** (sin número en el libro): montaje
  con un número libre mayor que los numerados (`p3act`, `p4act`…), así
  cada una es su propia miniactividad.
- **Funciones del catálogo antes que HTML a mano** (ver "Funciones propias
  del libro").
- **Mapas** con la orientación del libro (`orientacion: 'vertical'` si lo
  dibuja de arriba hacia abajo).
- **Impresión revisada de verdad** con `scripts/vista_impresion.py` (ver
  "Verificación"): nada cortado entre hojas, ninguna barra de scroll,
  palabras completas dentro de sus cajas.

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
  en"). Para palabras de enlace del libro que van entre dos cajas ("sus
  elementos son", "puede ser"), un nodo `libre` sin borde y con fondo
  blanco (`clase: 'bg-white px-1.5 text-sm text-slate-600'`) queda más
  parecido; el fondo blanco hace que la línea pase por detrás de la palabra.
- **Orientación** (`crearOrganizador(id, { orientacion, … })`):
  - `'horizontal'` (por defecto): raíz a la izquierda, hijos en columna.
  - `'vertical'`: árbol de arriba hacia abajo, raíz arriba y los hijos en
    fila debajo (ej. "Claves para identificar el tipo de texto": raíz +
    4 tarjetas). Usarlo cuando el libro lo dibuja así.
  - Con `compacto: 'auto'` (por defecto), si no cabe: un horizontal prueba
    primero el vertical y recién después el esquema compacto (sangría).
    "Cabe" se mide contra el espacio en pantalla pero nunca más ancho que
    una hoja impresa (814 px de pantalla ≈ 700 px de hoja): así el mapa ya
    se ve en pantalla como saldrá en papel. `compacto: 'siempre' | 'nunca'`
    lo fuerza.
- **Impresión** (no hace falta hacer nada): parte del modo que ya eligió
  la pantalla (casi siempre ya cabe y no se rearma nada); si no cabe,
  vertical, `scale()` hasta 85 % y si ni así, esquema compacto. Las líneas
  se imprimen sin la máscara SVG de la animación: con ella el navegador
  tardaba más de 10 s en mostrar la vista previa de una red sináptica. Nunca aparece una barra de scroll ni se corta un nodo entre
  dos hojas. Dentro del mapa el espaciado vuelve al normal para que las
  palabras quepan en sus cajas de ancho fijo (`w-36`…).
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

## Registro de actividades (`npm run registro`)

### Para qué sirve

`scripts/registro.mjs` lee el código del libro **sin modificar nada** y
genera `registro.json` en la raíz del repo: un **grupo por HTML** (= un
registro en la plataforma y un ícono en Flip) con sus **miniactividades**
(= filas de la hoja Actividades del Excel). Es la ÚNICA entrada del
Publicador: el paso 1 (Importar) lo ejecuta y vuelca el JSON al Excel de
control. Si el registro sale mal (un tema vacío, una página equivocada,
una pregunta que falta), todo lo que viene después sale mal: Excel, íconos
de Flip y registros en la plataforma.

El script **no entiende el libro**: reconoce textos exactos del nombre de
archivo, del `.ts` y del `.html`. Por eso las convenciones de esta sección
son obligatorias aunque en pantalla "se vea igual" hacerlo de otra forma.

### Instalar el script (solo si el proyecto no lo tiene)

Comprobar primero; **si las tres cosas ya están, no se crea ni se copia
nada** (no pisar un `registro.mjs` existente: puede tener `DESCRIPCIONES`
propias de ese libro):

1. ¿Existe `scripts/registro.mjs`?
2. ¿`package.json` tiene en `"scripts"` la línea
   `"registro": "node scripts/registro.mjs"`?
3. ¿`package.json` tiene `typescript` en `devDependencies` (el script usa
   el parser de TypeScript para leer los `.ts`)?

Lo que falte:

1. Copiar `scripts/registro.mjs` desde
   `C:\Users\PROLIPA\Desktop\Funciones\Esqueleto_Base\scripts\registro.mjs`
   (versión de referencia, siempre sincronizada con el último libro).
2. Agregar en `package.json`, dentro de `"scripts"`:
   `"registro": "node scripts/registro.mjs",`
3. Si falta TypeScript: `npm install -D typescript`.
4. Probar: `npm run registro`. Debe terminar con
   `N grupo(s), M miniactividad(es) -> …\registro.json`.

Requisitos: Node.js 18 o superior. Uso avanzado:
`node scripts/registro.mjs [raíz del libro] [ruta de salida]` (sirve para
generar el JSON fuera del repo y comparar sin tocar el `registro.json`
real). `registro.json` se regenera siempre: no se edita a mano.

### Lo imprescindible: qué lee exactamente

**1. Nombre del archivo** (`src/actividades/*.html`)

| Debe ser | Ejemplo | Qué obtiene |
|---|---|---|
| `uni{U}_tem{T}_{seccion}` | `uni2_tem3_taller` | unidad 2, tema 3, sección taller |
| `uni{U}_red_sinaptica` | `uni2_red_sinaptica` | unidad 2, red sináptica (sin número de tema) |

- Secciones válidas: `experiencia`, `reflexion`, `conceptualizacion`,
  `taller`, `aplico`, `red_sinaptica`, `sumativa`, `diagnostica`. La
  sección decide el **tipo** en la plataforma (animación = 1:
  experiencia, conceptualización, red sináptica; actividad = 0: el resto)
  y el orden en el Excel.
- Solo minúsculas, sin tildes ni espacios. Cualquier otro nombre
  (`uniMapaExample`, `uni1act3`) se **ignora** y sale en la línea
  "Ignorados".
- Cada HTML necesita su `src/contenido/<mismo nombre>.ts` (y su
  `src/entries/<mismo nombre>.entry.ts` para que compile).

**2. El `.ts`** (`src/contenido/<nombre>.ts`)

| Debe tener | Ejemplo | Qué obtiene |
|---|---|---|
| `crearEncabezado(…, { unidad, tema, pagina })` con valores escritos tal cual (no variables ni cuentas) | `{ unidad: 2, tema: 'El conversatorio', pagina: 64 }` | `pagina`: página IMPRESA donde empieza la sección (va al POST y al ícono de Flip). `tema`: nombre del tema en experiencia, reflexión, conceptualización y aplico. `unidad`: se compara con el nombre del archivo |
| Cada widget `crear*(id, {...})` con el id **literal**: el número de la pregunta o `'N_M'` | `crearRelacionar(3, …)`, `crearRellenarEspacios('4_2', …)` | Asocia el widget a la pregunta N y le pone la descripción ("Unir líneas", "Completar espacios"…) |
| `variante` escrita tal cual cuando el widget la usa | `variante: 'circulo'` | Descripción precisa ("Encerrar respuesta") |
| Funciones auxiliares que reciben el id como parámetro | `const org = (id, datos) => crearOrganizador(id, …)` y luego `org(2, …)` | También se resuelven |

- Una pregunta armada a mano (`document.getElementById('p5act')` sin
  widget del catálogo) sale con descripción **REVISAR**: se escribe la
  descripción a mano en el Excel (no se pisa al reimportar).
- Un widget con `bookText` dentro de su llamada (mapa o panel con
  renglones) cuenta como "Escribir respuesta".

**3. El `.html`**

| Texto exacto | Qué obtiene |
|---|---|
| `<!-- --- inicio --- -->` y `<!-- --- fin --- -->` | Límites del contenido. Lo que está antes del primer enunciado (después de "inicio") es la teoría de conceptualización |
| `<span class="text-blue-600 font-bold text-lg mr-1.5">N.</span>` | **Enunciado numerado N**. La clase va exactamente así, en ese orden, y el número con punto |
| `<b>Verbo</b>` dentro del enunciado, justo después del número | Descripción de lo que no tiene widget: *Lee/Disfruta* → "Leer texto"; *Observa* → "Observar imagen"; *Comenta, Conversen, oralmente…* → "Actividad oral" |
| `<div class="pN puntoX"></div>` o `<div class="pN puntoX c-d"></div>` | **Puntaje** X de la pregunta N y **corrección docente** (`c-d`). El `class` lleva solo eso, en ese orden |
| `id="pNact"` / `id="pN_Mact"` | Montaje de la pregunta N. Si N no tiene enunciado numerado (Prelectura, Durante la lectura), es una **miniactividad sin número** |
| `data-pagina="NN"` en el `div` de la pregunta | **Página impresa** de esa pregunta y de las siguientes, hasta el próximo `data-pagina`. Sin él, la página del encabezado |
| `class="bookText lnN"` (`bookText` seguido de `lnN`) | Renglones → "Escribir respuesta" |
| `<img … data-decorativa>` | Foto que solo acompaña: NO cuenta como contenido |

Lo que el script **ignora a propósito**: los comentarios (incluido
`<!-- Preg N -->`), los íconos `/img/ico_*`, los títulos en `<strong>` o
`<h1>`…`<h6>`, los badges vacíos y las imágenes `data-decorativa`.

### Cómo se cuentan las miniactividades

- Miniactividad = cada enunciado numerado + cada montaje `pNact` sin
  enunciado numerado, en el orden del HTML.
- **Cuenta todo lo que trae algo además del enunciado**, también en las
  animaciones (experiencia, conceptualización, red sináptica): un widget,
  renglones, una lectura o cuento, un poema, una imagen, un mapa, un
  esquema, una lista de preguntas o de información (aunque sea oral, sin
  campo ni puntaje). Para el script "contenido" es: `img`, `table`,
  `ul`/`ol`/`li`, `svg`, `canvas`, `figure`, `blockquote`, `input`,
  `select`, `textarea`, un montaje `pNact`, renglones `bookText`, o 15
  caracteres o más de texto.
- **Solo NO cuenta el enunciado solo, sin absolutamente nada más**
  ("Repasen sus intervenciones…", "Indaga…"): queda en `solo_enunciado`
  del JSON y no va al Excel. No se inventan campos que el libro no trae.
- **Conceptualización:** toda la teoría (panel, mapas y esquemas de solo
  lectura, sin número) es **una** miniactividad ("Teoría: …"), más cada
  actividad (ej. U1 T1: teoría + "Construyo mi aprendizaje" = 2).
- **Red sináptica:** cada mapa es una miniactividad.
- `crearPanelInformativo`, `crearCuento` y `crearOrganizador` son de
  lectura ("Leer información", "Leer cuento", "Mapa conceptual"); el resto
  de widgets son para responder.

### Nombre del tema y número de tema

- Experiencia, reflexión, conceptualización y aplico: el `tema` de su
  `crearEncabezado`, como `Tema {T}: {nombre}`.
- Taller: lo copia de sus hermanos (experiencia/reflexión/
  conceptualización del mismo `uni{U}_tem{T}`), porque su encabezado trae
  el título del taller.
- Red sináptica, sumativa y diagnóstica: nombre fijo ("Red sináptica de
  ideas", "Evaluación sumativa", "Evaluación diagnóstica"), igual al tema
  que existe en la plataforma. En la plataforma se buscan por ese nombre;
  el resto, por (unidad, número de tema).

### Qué hacer y qué no hacer

Hacer:
- Nombrar todo archivo nuevo con la convención (y el triplete `.html` +
  `.ts` + `.entry.ts` con el mismo nombre).
- Escribir en `crearEncabezado` la página IMPRESA donde empieza la sección.
- Poner `data-pagina` en la primera pregunta de cada página nueva.
- Dar a cada widget el número de SU pregunta (`3`, `'3_1'`, `'3_2'`).
- Copiar el enunciado con la clase exacta del `<span>` y el verbo en `<b>`.
- Marcar con `data-decorativa` la foto que no es contenido de ninguna
  pregunta.
- Correr `npm run registro` al terminar cada sección y resolver TODOS los
  avisos `!` antes de importar al Publicador.
- Si se usa una función nueva del catálogo, agregar su descripción en
  `DESCRIPCIONES` del script (si no, sale "REVISAR: crearX" y un aviso).
- Si aparece una sección nueva, agregarla en `SECCIONES` del script (y en
  `ORDEN_SECCION` de `Publicador/publicador/excel.py`).
- Al cambiar el script: copiarlo también a `Esqueleto_Base/scripts/`.

No hacer:
- No renombrar un archivo ya registrado en la plataforma: el link
  registrado deja de existir. Si hace falta, reimportar y avisar al
  usuario (la fila vieja queda "no vigente" y la nueva sale PENDIENTE).
- No cambiar la clase del `<span>` del número, ni del badge, ni el
  formato `pNact`: el script deja de verlos aunque en pantalla se vea igual.
- No calcular ids ni páginas (`crearX(n + 1)`, `pagina: base + 2`): solo
  valores escritos tal cual.
- No poner el número de otra pregunta en un montaje (`p4act` dentro de la
  pregunta 3).
- No numerar a mano lo que el libro no numera: Prelectura y Durante la
  lectura van como montaje sin enunciado, con un número mayor que los
  numerados (`p8act`, `p9act`…).
- No agregar campos falsos para que algo "cuente".
- No editar `registro.json` a mano.

### Adaptar un proyecto de esta plantilla que todavía no cumple

Para un libro hecho con la plantilla pero sin estos detalles (archivos con
otros nombres, ids calculados, sin páginas):

1. Instalar el script (ver arriba) y correr `npm run registro` para ver
   el estado: qué se ignora y qué avisos salen.
2. Renombrar cada actividad a `uni{U}_tem{T}_{seccion}` o
   `uni{U}_red_sinaptica` (los tres archivos) y actualizar el `<script
   src>` del HTML, el `import` del `.entry.ts` y los enlaces de
   `index.html`. Hacerlo ANTES de registrar nada en la plataforma.
3. En cada `.ts`: `crearEncabezado` con `unidad`, `tema` y `pagina`
   literales, y cada widget con el número de su pregunta como primer
   argumento literal.
4. En cada `.html`: marcadores `<!-- --- inicio --- -->` /
   `<!-- --- fin --- -->`, enunciados con el `<span>` exacto y el verbo en
   `<b>`, badges `pN puntoX [c-d]`, montajes `pNact` y `data-pagina` donde
   cambie la página.
5. Repetir `npm run registro` hasta que no quede ningún aviso `!` y
   comparar contra el PDF: cada miniactividad presente, con su página, y
   ninguna de más.
6. Recién entonces seguir con "Publicación: Excel de control, Flip PDF y
   plataforma".

### Avisos (`!`) y qué hacer

| Aviso | Qué hacer |
|---|---|
| `Falta src/contenido/X.ts` / `Sin crearEncabezado` / `Encabezado sin página` | Crear el `.ts` o completar `crearEncabezado` |
| `Encabezado dice unidad A, el archivo B` | Corregir el que esté mal |
| `Sección "X" desconocida` | Revisar el nombre o agregar la sección en `SECCIONES` |
| `Numeración no correlativa` | Falta o sobra un número de enunciado (se revisan todos, cuenten o no) |
| `Widgets sin montaje en el HTML: N` | El `.ts` monta en `pNact` pero ese id no está en el HTML |
| `crearX: id no literal` | Escribir el id tal cual |
| `crearX (pregunta N) no tiene descripción` | Agregar la función en `DESCRIPCIONES` |
| `Pregunta N tiene puntaje pero nada más que el enunciado` | Falta el widget o los renglones, o sobra el badge |
| `Pregunta N armada a mano en el .ts` | Escribir la descripción en el Excel |
| `Hay miniactividades con página menor a la del encabezado` | Revisar `data-pagina` y la `pagina` del encabezado |
| `Nombres de tema distintos entre hermanos` | Unificar el `tema` de experiencia/reflexión/conceptualización |
| `Sin nombre de tema T` | Ninguna sección del tema trae el nombre: lo completa el paso 3 del Publicador desde la plataforma |
| `Nombre antiguo: renómbralo a uniU_red_sinaptica` | Renombrar los tres archivos de la red |

### Qué contiene `registro.json`

`grupos`: uno por HTML con `archivo`, `unidad`, `tema_num` (vacío en la red
sináptica), `seccion`, `tipo`, `tema`, `titulo_encabezado`, `pagina`,
`miniactividades` (`n`, `numerada`, `pagina`, `puntaje`, `docente`,
`descripcion`), `solo_enunciado` y `avisos`. Además `ignorados` (HTML con
nombre fuera de la convención) y `ts_sin_html`.

Validado contra Sinapsis Lengua 4 completo (126 HTML) y Sinapsis Lengua 9
unidades 1 y 2: páginas, tipos y temas coinciden con lo publicado.

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
4. **Impresión real**, sin abrir el diálogo:
   `python scripts/vista_impresion.py uni1_tem1_taller [otros…]` (con el
   dev server corriendo; Python con `playwright` y `pymupdf`, usa el Chrome
   o Edge instalados). Hace lo mismo que el botón "Imprimir PDF" (clon en
   iframe de 816 px) y deja el PDF y cada hoja en PNG en
   `revision_impresion/` para mirarlas. La vista previa del iframe en
   pantalla NO sirve: ahí no aplica `@media print`.
5. `npm run build` — debe compilar la actividad nueva como parte del
   listado de "N actividad(es) compiladas en dist/".
6. Limpieza: `rm -rf dist`, matar el proceso de `npx vite --port 5599`
   levantado a mano, borrar PNGs temporales usados para leer el PDF.

## Errores ya conocidos a evitar

- **Variantes responsive que cambian display/position no funcionan**
  (`hidden sm:block`, `relative sm:absolute`…): `funciones.css` (vendor)
  trae sus propias utilidades base (`.hidden`, `.relative`…) y, al
  cargarse después, le ganan a la variante `sm:`. Usar la variante
  "solo celular" (`max-sm:hidden`) o CSS propio en el `<style>` de la
  actividad (como los globos de diálogo).
- **Una clase arbitraria nueva (`bg-[#…]`, `grid-cols-[…]`) no aparece en el
  servidor de desarrollo**: Vite a veces no recompila el CSS al crear un
  archivo nuevo. Guardar `src/styles/tailwind.css` sin cambios (o tocarlo)
  lo fuerza; el build no tiene ese problema. Si la vista de impresión sale
  con bordes negros o sin estilos, es esto: regenerarla.
- **Renglones (`bookText`) al imprimir**: el rayado es un gradiente
  repetido de 32px. En un renglón único (`ln1`) mide lo mismo que la caja
  y Chrome lo imprimía como una barra gris gruesa, corrida arriba o abajo,
  o no lo imprimía; en varios renglones se asomaba una línea extra arriba
  de la caja. `tailwind.css` (solo `@media print`) dibuja el `ln1` con un
  borde inferior y deja 1px libre bajo cada renglón en los demás. No se
  arregla por actividad.
- **Relacionar al imprimir**: en pantalla las dos columnas van 50/50;
  en la hoja (748 px útiles) eso dejaba media tarjeta vacía si un lado es
  corto y el otro se partía en más líneas, con todas las filas "gordas".
  `print.ts` (clon de impresión) mide con las reglas de impresión y, si un
  lado no llena su columna, le da solo el ancho que necesita y el otro
  lado gana el resto; las cuerdas se recalculan con las posiciones reales.
  Para verlo con cuerdas: conectar, calificar y usar la vista de impresión.
- **`min-width` en línea al imprimir** — el fix de impresión #1 suelta
  todos los `min-width` en línea menos los de Relacionar
  (`button[data-lado]`), que los usa para igualar el ancho de sus
  tarjetas. Si otro widget necesita conservarlo, agregarlo a esa
  excepción (también en la copia de `trazado.ts`).
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

## Publicación: Excel de control, Flip PDF y plataforma

Cuando las actividades de una unidad (o del libro) están listas, el registro
y la publicación se hacen con el programa **Publicador**
(`C:\Users\PROLIPA\Desktop\Funciones\Publicador`, ejecutable
`dist\Publicador.exe`). La skill de Claude `publicar-actividades` contiene
estas mismas reglas.

### Qué debe tener la carpeta del libro

Sin estos archivos el Publicador se detiene en el paso que los necesita
(dice cuál falta). Ejemplo real: `Sinapsis Lengua 9 V2`.

**1. Lo que pones tú (obligatorio)**

| Archivo / carpeta | Dónde | Para qué | Si falta |
|---|---|---|---|
| Código del proyecto: `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/`, `public/`, `scripts/` (`registro.mjs`, `build.mjs`, `entradas.mjs`, `flatten-dist.mjs`, `vista_impresion.py`), `GUIA_GENERAL.md` | Raíz | Las actividades, el build y el registro. Sale de `Esqueleto_Base` | Copiarlo del Esqueleto (ver "Instalar el script" para `registro.mjs`) |
| `node_modules/` | Raíz | Dependencias de Vite y TypeScript | `npm install` |
| **Proyecto Flip original** `<libro>.flb` (ej. `Sinapsis_Lengua9_SG_Neat.flb`) | Raíz (recomendado); su ruta va en `ruta_flb` de Config | Paso 4: el programa lee sus páginas y su texto (`files/search/searchN.xml`) para ubicar cada ícono, y escribe la copia `_PUBLICADOR.flb` a su lado. Paso 5: se publica esa copia | Paso 4 da "Falta ruta_flb" o "No existe el .flb". Pedirlo al equipo de diseño; debe ser el proyecto con el texto del libro (no un PDF escaneado) |
| **`Ejecutar_Config.bat`** | Raíz, con ese nombre exacto | Paso 5: se copia a la carpeta publicada y se ejecuta ahí; parchea `mobile\javascript\config.js` (menú y total de páginas). El programa verifica que `config.js` quede con `function getParameterByName` y `totalPageCount = unidades.paginaFinal;` | Paso 5 da "No existe …\Ejecutar_Config.bat". Copiarlo de `Esqueleto_Base` (los libros nuevos ya lo traen); **no se edita** |
| PDF de cada unidad (ej. `lengua9_unidad_3.pdf`) | Raíz | Solo para construir las actividades (texto, imágenes, páginas) | No se pueden digitalizar las unidades |

**2. Lo que está fuera de la carpeta (rutas en la hoja Config)**

| Qué | Ruta | Para qué |
|---|---|---|
| `main.js` modelo | `ruta_main_js` (por defecto `\\jreyes\…\ARCHIVOSEXTRA_MENUNUEVO\mobile\javascript\main.js`) | Paso 5: se copia al libro publicado |
| Carpeta de publicación | `ruta_publicacion` (por defecto `\\jreyes\…\LIBROS CON ENLACES\{carpeta}`) | Paso 5: ahí publica Flip. Debe terminar en el nombre de `carpeta` |
| Programa Publicador | `C:\Users\PROLIPA\Desktop\Funciones\Publicador\dist\Publicador.exe` | Todo el proceso |
| Flip PDF Professional 2.4.x (español), Node.js 18+, acceso a `\\jreyes` y a internet | Instalados en la computadora | Publicar, registro, carpeta compartida y API |

**3. Lo que genera el programa (no se crea a mano)**

| Archivo / carpeta | Lo crea | ¿Se puede borrar? |
|---|---|---|
| `registro.json` | `npm run registro` / paso 1 | Sí, se regenera |
| `control_publicacion.xlsx` | Paso 1 | **No**: guarda Config, estados de Flip y plataforma e `id_item`. Respaldarlo |
| `control_publicacion.anterior.xlsx` | Cada vez que el programa guarda el Excel | Sí (es la copia previa por si algo sale mal) |
| `publicador_post.log` | Paso 6, una línea por POST | **Nunca**: es lo que impide registrar dos veces lo mismo aunque el Excel se pierda |
| `<libro>_PUBLICADOR.flb` | Paso 4 (copia del original con los íconos) | Se regenera desde el original en cada paso 4 |
| `<libro>_PUBLICADOR.anterior.flb` | Paso 4, al reemplazar la copia anterior | Sí, cuando la nueva copia esté revisada |
| `revision_flip/` | Paso 4 (PNG de cada página con ícono) | Sí, se regenera |
| `dist/` | `npm run build` | Sí, se regenera (es lo que se copia a `animaciones/`) |

Reglas:
- **El `.flb` original nunca lo modifica el programa**: trabaja siempre
  sobre la copia `_PUBLICADOR.flb`. Recién cuando el libro esté publicado y
  revisado, la copia pasa a ser el proyecto oficial (paso 10 del proceso).
- **`Ejecutar_Config.bat` no se edita**: se usa tal cual, igual que a mano.
- Los `.flb` y los PDF pesan cientos de MB: no se suben a git, pero tienen
  que estar en la carpeta (o en la ruta de Config) en cada computadora.
- **Al pasar el proyecto a otra computadora** copiar la carpeta completa
  (con el `.flb` original, `Ejecutar_Config.bat`, `control_publicacion.xlsx`
  y `publicador_post.log`), correr `npm install`, tener el Publicador,
  Flip y Node instalados y acceso a `\\jreyes`. Si se pierde el Excel, el
  paso 1 lo recrea y el log evita reenvíos, pero los estados de Flip y la
  Config hay que volver a completarlos.

### Orden del proceso

| # | Paso | Dónde | Qué hace |
|---|---|---|---|
| 1 | Construir las actividades | este documento | Con `data-pagina` en las preguntas que empiezan en otra página. |
| 2 | Revisar el registro | `npm run registro` | Lista grupos y miniactividades; revisar los avisos `!`. |
| 3 | Importar actividades | Publicador → 1 | Regenera `registro.json` y crea o actualiza `control_publicacion.xlsx` en la raíz del repo. |
| 4 | Completar Config | Publicador, arriba | Nombre del libro en la plataforma, tu `id_usuario`, carpeta del libro en el servidor (ej. `SinapsisLengua9_V2`) y proyecto `.flb`. |
| 5 | Confirmar libro | Publicador → 2 | GET de libros; si el nombre coincide con varios, se elige de una lista. Guarda `idasignatura`. |
| 6 | Asignar temas | Publicador → 3 | GET de temas; asigna `id_tema` por (unidad, número de tema). |
| 7 | Íconos en Flip | Publicador → 4 | Inserta los íconos en una COPIA `<proyecto>_PUBLICADOR.flb` y deja vistas previas en `revision_flip/`. Abrir la copia en Flip y revisarla. |
| 8 | Publicar | Publicador → 5 | Publica la copia con Flip (HTML5) en la carpeta compartida del libro, copia `main.js`, ejecuta `Ejecutar_Config.bat` y verifica. |
| 9 | Registrar en la plataforma | Publicador → 6 | Muestra qué se enviará, pide confirmación y hace un POST por HTML. |
| 10 | Dejar la copia como proyecto oficial | a mano | Renombrar el `.flb` original a `.anterior.flb` y la copia `_PUBLICADOR.flb` al nombre original (o apuntar `ruta_flb` a la copia), para que la próxima vez se parta de ella. |
| 11 | Copiar los HTML | a mano | `npm run build` (o `npm run build:uni{U}` si solo cambió una unidad) y copiar el contenido de `dist/` a `<carpeta compartida del libro>\animaciones\`. |
| 12 | Subir al servidor | otro compañero | Sube la carpeta preparada a la plataforma. |

Registrar en la plataforma guarda solo los datos de la actividad: no
significa que el HTML ya esté en el servidor (pasos 11 y 12).

### Excel de control (`control_publicacion.xlsx`, en la raíz del repo del libro)

| Hoja | Contenido | Quién la escribe |
|---|---|---|
| Config | `nombre_libro`, `idasignatura`, `id_usuario`, `carpeta`, `carpeta_html` (animaciones), `url_base`, `api_base`, `ruta_flb`, `ruta_publicacion`, `ruta_main_js` | Tú, o la ventana del Publicador |
| Registros | Un registro por HTML (id = nombre del archivo): tema, sección, tipo, página, `link`, URL, `id_tema`, estado, observación y fecha de Flip y de la plataforma, `id_item` | El programa; tú solo las columnas de corrección |
| Actividades | Una fila por miniactividad (id = `archivo#N`): página, descripción, puntaje, corrección docente | El programa; puedes corregir `descripcion` |
| Menu | Unidad, tema, página, archivo y URL de cada HTML (reemplaza al Excel de enlaces) | El programa |
| Temas_API | Copia de los temas de la plataforma con la fecha de consulta | El programa |
| Historial | Cada importación, envío y publicación; solo se agregan filas | El programa |

- Nunca se borran filas: lo que desaparece del código queda con
  `vigente = NO`.
- Una fila registrada en la plataforma (`plat_estado` OK) no cambia desde
  el código. Sus miniactividades sí se siguen actualizando (no se envían a
  la plataforma: solo documentan el HTML en el Excel). Con solo el ícono de Flip OK se fijan
  página, link y URL (lo que define el ícono); tema, títulos y
  miniactividades se siguen actualizando. Lo que no se cambió se anota en
  Historial como `CAMBIO_TRAS_OK`.
- `publicador_post.log` (raíz del repo) guarda cada POST con su respuesta y
  **no se borra nunca**: antes de enviar, el programa lo consulta y no
  reenvía ningún link que ahí figure como OK o INCIERTO, aunque el Excel se
  haya borrado o recreado (el estado y el id_item se reponen solos).
  Borrar el Excel para "empezar de cero" es seguro solo mientras ese log
  siga en su lugar.
- Columnas para corregir a mano: `id_tema_manual` (tema correcto cuando
  quedó en REVISAR), `flip_y_manual` (altura del ícono, de 0 a 1, cuando no
  se encontró el título), `descripcion` de una miniactividad en REVISAR y
  `plat_estado` para resolver un INCIERTO.
- El Excel debe estar cerrado cuando el programa escribe; si está abierto,
  avisa y no escribe nada. Antes de reemplazarlo deja
  `control_publicacion.anterior.xlsx`.
- Cada POST queda además en `publicador_post.log` (por si el Excel no se
  pudo guardar justo después de un envío).

### Reglas de datos

- **Libro:** solo "Sinapsis - Lengua N", "Sinapsis - Lengua N (Segunda
  Edición)" (= V2) y "FOLLETO SINAPSIS LENGUA N". Los PLUS nunca: son
  copias. Si el nombre coincide con varios libros se elige a mano; nunca se
  adivina.
- **Un registro por HTML** (grupo de actividades). Las miniactividades solo
  van al Excel.
- **Tipo:** experiencia, conceptualización y red sináptica = animación
  (`tipo 1`, `gif_animacion.gif`, globo "ANIMACIÓN"); reflexión, taller y
  aplico = actividad (`tipo 0`, `gif_evaluacion.gif`, globo "ACTIVIDAD");
  sumativa y diagnóstica = actividad con globo "EVALUACIÓN".
- **Tema:** el nombre que va al Excel sale del libro (encabezado del `.ts`;
  el taller lo toma de sus hermanos del mismo tema). El `id_tema` de la
  plataforma se busca por (unidad, número de tema del archivo); red
  sináptica (`uni{U}_red_sinaptica`, sin número de tema), sumativa y diagnóstica se buscan por nombre ("Red sináptica
  de ideas" y "Evaluación sumativa" de su unidad, "Evaluación
  diagnóstica"), así que en la plataforma debe existir un tema "Red
  sináptica de ideas" por unidad (sin número). Si el nombre del libro no se parece al de la plataforma →
  REVISAR; si el tema no existe → TEMA_NO_EXISTE. El programa nunca crea
  temas.
- **Página:** la del encabezado (inicio de la sección, número IMPRESO) va
  al POST (`page`, como texto) y al ícono. La página física del `.flb` =
  impresa + desfase; el programa lee el desfase del número al pie en el
  texto del propio `.flb` (en Lengua 4 y Lengua 9 es 2).
- **URL:**
  `https://data.prolipadigital.com.ec/archivos/upload/libro/{carpeta}/animaciones/{archivo}.html`.
  Por ahora todo va a `animaciones/`; las `uniXactY` históricas siguen en
  `actividades/`. El `link` del POST es el nombre del archivo sin `.html`.

### Estados y qué hacer

Flip (`flip_estado`):

- **OK:** el ícono está en la copia (o ya estaba en el proyecto).
- **REVISAR:** no se encontró el título de la sección en esa página, el
  enlace ya está en otra página o no queda espacio en el margen. Revisar la
  página; si es correcta, poner la altura en `flip_y_manual` y repetir el
  paso 4 del Publicador.
- **ERROR:** falta la URL (completar `carpeta` en Config e importar de
  nuevo) o la página impresa no existe en el `.flb`.

Plataforma (`plat_estado`):

| Estado | Significa | Qué hacer |
|---|---|---|
| PENDIENTE | Listo para enviar (tiene `id_tema`) | Publicador → 6 |
| OK | Registrado; `id_item` guardado | Nada: nunca se reenvía |
| REVISAR | Tema ambiguo o con nombre distinto al del libro | Poner el id correcto en `id_tema_manual` y repetir Publicador → 3 |
| TEMA_NO_EXISTE | El tema no está creado en la plataforma | Crearlo y repetir Publicador → 3 |
| ERROR_VALIDACION | Faltan datos locales para el POST | Corregir y repetir Publicador → 6 |
| ERROR_COMUNICACION | No hubo conexión: no llegó al servidor | Se reintenta solo en el próximo envío |
| ERROR_SERVIDOR | El servidor lo rechazó (4xx o `status` distinto de 1) | Corregir según la observación; se reintenta |
| INCIERTO | Pudo haberse registrado (sin respuesta a tiempo, 5xx, corte) | Verificar en la plataforma: si está, poner OK; si no, PENDIENTE y borrar `id_item` |
| ENVIANDO | El programa se cortó mientras enviaba | En la próxima corrida pasa solo a INCIERTO |

El backend acepta duplicados y no hay un GET para verificar registros: por
eso un INCIERTO nunca se reenvía solo.

### Flip PDF Professional: reglas y trampas conocidas

- El `.flb` es un ZIP: los íconos están en `outlineLinkLanguage.xml` y el
  texto de cada página, con su posición, en `files/search/searchN.xml`. El
  programa nunca modifica el original: escribe `<proyecto>_PUBLICADOR.flb` y
  lo verifica antes de reemplazar nada.
- Posición del ícono: margen izquierdo (`x = 0.05`), tamaño
  `0.0856 × 0.0654` de la página, centrado en la altura del título de la
  sección. El título se reconoce porque su línea empieza sin la letra
  capital decorativa ("eflexión", "xperiencia", "onceptualización"); el
  taller, por su título (ej. "Laboratorio de edición"). Si la página es una
  imagen sin texto, queda en REVISAR.
- El diálogo de publicar de Flip muestra en "Carpeta de Salida" **la última
  carpeta usada en Flip**, no la del proyecto (ya pasó: al abrir Lengua 9
  aparecía `SinapsisLengua4_V2`). Al publicar a mano, revisar siempre ese
  campo. El programa lo escribe y lo verifica, y no publica si la carpeta
  no termina en la `carpeta` de Config.
- Publicar siempre como `*.html`, nombre `index`, secuencia de carga
  **"HTML5 solo"** (el proyecto de Lengua 9 venía en "Flash - HTML5") y con
  "Also Create Basic Html version" marcado.
- Al publicar sobre un libro ya publicado, Flip reescribe primero
  `config.js` y después pregunta si sobrescribe `index.html`: hay que
  responder Sí, o el libro queda a medias. No borra los demás archivos de
  la carpeta (`actividades/`, `animaciones/`, `index.php`…).
- Después de publicar: copiar `main.js` desde
  `\\jreyes\DepartamentoC_Compartida\LIBROS Y CUADERNOS\ARCHIVOS_EXTRA\ARCHIVOSEXTRA_MENUNUEVO\mobile\javascript\`
  y ejecutar `Ejecutar_Config.bat` en la carpeta publicada (agrega el bloque
  `unidades`, cambia a `totalPageCount = unidades.paginaFinal;` y traduce la
  ayuda). El programa hace las dos cosas y verifica `config.js` y `main.js`.
- En el equipo donde se probó, Flip está sin registrar (ventana "Try"). En
  la prueba no apareció marca de agua en las páginas, pero conviene
  confirmarlo a ojo en el libro publicado.
- Al cerrarse, esta versión de Flip queda colgada sin ventanas; el programa
  termina el proceso.

### API de la plataforma (pública, sin autenticación)

- `GET https://server1.prolipadigital.com.ec/librosRegistroActividades` →
  `[{"idasignatura", "nombreasignatura"}]`.
- `GET .../temasPorLibro/{idasignatura}` →
  `[{"id", "nombre_tema", "unidad", "id_asignatura", ...}]`. Un id sin temas
  responde 200 con `{"message": "El libro no tiene temas asociados",
  "data": []}`; un id no numérico, 422.
- `POST .../registroActividadPublico` con
  `{"id_usuario", "id_tema", "tipo", "link", "page"}` → éxito: HTTP 200
  `{"status": 1, "message": "Registro guardado correctamente", "data": {..., "id_item": N}}`.
  Solo se marca OK si el servidor devuelve lo mismo que se envió y un
  `id_item`.

### Lo que el programa no hace

Crear temas en la plataforma, borrar registros, copiar los HTML a la
carpeta compartida, subirlos al servidor ni registrar libros PLUS.

### Comandos (sin ventana; los usa Claude)

Desde `C:\Users\PROLIPA\Desktop\Funciones\Publicador`, con
`python -m publicador`:

- `importar "<repo>"` · `libro "<repo>" --nombre "..."` (o `--id N`) ·
  `temas "<repo>"` · `config "<repo>" <parámetro> <valor>`
- `flip "<repo>"` → copia `_PUBLICADOR.flb` y `revision_flip/`
- `publicar "<repo>"` muestra el plan; `publicar "<repo>" --confirmar`
  publica (opciones `--carpeta X`, `--sin-flip`)
- `plataforma "<repo>"` simula; `plataforma "<repo>" --enviar` envía
  (opciones `--solo ID`, `--max N`)

Pruebas del programa: `python -m unittest discover -s tests`. Reconstruir el
`.exe`: `construir.bat`.
