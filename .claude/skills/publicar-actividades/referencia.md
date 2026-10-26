# Referencia: registro y publicación de actividades

Copia textual de la sección "Publicación: Excel de control, Flip PDF y plataforma" de `GUIA_GENERAL.md` (repo Sinapsis Lengua 9 V2, 21-10-2026). Si cambia una regla, actualizar ambos.

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
| 11 | Copiar los HTML | a mano | `npm run build` y copiar el contenido de `dist/` a `<carpeta compartida del libro>\animaciones\`. |
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
