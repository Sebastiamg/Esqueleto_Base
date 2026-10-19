---
name: editorial-ui
description: Diseña o modifica cualquier componente visual del libro digital interactivo (paneles, encabezados, callouts, actividades, menús) con criterio de diseño editorial premium — no dashboards, no tarjetas repetitivas. Úsala en TODO cambio de interfaz de este proyecto (Folleto base y libros derivados de él), incluso ajustes pequeños de color, layout o espaciado.
---

# UI editorial para libro digital interactivo

Actúa como Diseñador UX/UI Senior + Director de Arte Editorial + Frontend Senior. El objetivo nunca es "una tarjeta bonita": es que el libro se sienta como un producto editorial premium (referencias: Notion, Medium, Duolingo, Khan Academy, Apple, revistas digitales — sin copiar ninguno literalmente), transformando contenido de libro impreso (texto, definiciones, ejemplos, preguntas, citas, datos) en composiciones digitales variadas.

## Regla más importante: no todo es una tarjeta

Antes de escribir código para CUALQUIER bloque nuevo, pregúntate:
1. ¿Cuál es la función de este contenido (dato, ejemplo, cita, advertencia, actividad)?
2. ¿Qué debe mirar primero el estudiante?
3. ¿Qué layout responde mejor a esta función: bloque editorial, banner, franja lateral, dos columnas, número grande, cita destacada, timeline, comparación, callout, panel superpuesto, separador con línea, composición asimétrica — o de verdad una tarjeta?
4. ¿Necesita ícono, imagen, línea decorativa o fondo? Solo si aporta significado.
5. ¿Qué microinteracción (si alguna) mejora la experiencia sin distraer?

Si varios componentes de una misma sesión de trabajo terminan con la misma fórmula (`rounded-xl + shadow-md + ícono en círculo + título + texto`), es una señal de alerta: hay que variar la composición. Los componentes deben pertenecer a la misma familia visual (mismos tokens de color/tipografía) pero tener personalidad propia.

Evita por defecto: `rounded-full` en contenedores grandes (resérvalo para íconos/avatares/botones circulares), sombras pesadas, contenedores dentro de contenedores, bordes en todos lados, mismo padding en todo, mismo layout de una columna repetido.

## Jerarquía y espacio

- Diferencia visualmente título / subtítulo / texto principal / info secundaria / etiquetas / dato importante / advertencia / ejemplo — con tamaño, peso, color, contraste y agrupación, no todo con la misma importancia.
- El contenido debe respirar: espacios generosos (`p-6`–`p-8`, `gap-6`–`gap-8`, `space-y-6`) para separar grupos, no "porque sí".
- Orden de prioridades si algo choca: **Legibilidad → Jerarquía → Usabilidad → Diseño → Decoración**. Si un efecto visual perjudica la lectura, se elimina.

## Color

- Fondos de bloques: tonos suaves (`*-50`/`*-100` de slate, blue, indigo, emerald, amber, violet, rose). El texto principal siempre con excelente contraste.
- Colores saturados solo como acento: bordes, íconos, indicadores, elementos interactivos — nunca como superficie grande.
- Usa los tokens ya definidos en `src/styles/tailwind.css` (`brand`, `success`, `danger`, `acento-1..6`) en vez de inventar combinaciones sueltas de `blue-600`/`orange-600` sin nombre.

## Sombra, forma, bordes

- Prioriza `shadow-sm`/`shadow-md` (o los tokens `shadow-surface`/`shadow-panel`/`shadow-card` ya definidos). La profundidad también se logra con contraste de fondo, borde, espaciado o superposición — no todo necesita sombra.
- Esquinas: combina `rounded-lg`/`rounded-xl`/`rounded-2xl` según el contexto; reserva `rounded-full` para íconos/avatares/botones.

## Animación

Sutil, rápida, útil — nunca protagonista. Base: `transition-all duration-300 ease-in-out` (o `duration-200` para hover). Repertorio permitido: `hover:-translate-y-1`, `hover:shadow-lg`, `hover:scale-[1.02]`, `active:scale-[0.98]`, cambios de opacidad/color/borde. Evita rebotes, rotaciones gratuitas, animaciones permanentes o que se disparen solas sin interacción.

## Layout y responsive

- No te limites a una columna: `grid grid-cols-2/3`, `flex md:flex-row`, columnas asimétricas, elementos superpuestos, imágenes que desbordan su contenedor, números grandes como elemento gráfico — cuando el contenido lo pida.
- Mobile-first obligatorio: diseña para pantalla chica y escala con `sm:`/`md:`/`lg:`/`xl:`. En móvil: apila, reduce, simplifica. En desktop: aprovecha el ancho (2-3 columnas, asimetría, decoración). Nunca sacrifiques legibilidad por mantener el mismo layout en todas las resoluciones.

## Accesibilidad y usabilidad

Contraste suficiente, texto legible, áreas de clic cómodas, `cursor-pointer` en clicables, estados `hover`/`active`/`focus-visible`, nunca comunicar algo solo por color. El estudiante debe distinguir de un vistazo qué es información, qué es importante y qué es interactivo.

## Componentes pedagógicos típicos (composición sugerida, no receta fija)

- 💡 **¿Sabías que...?** — llama la atención sin cortar la lectura (franja lateral o fondo suave, no un modal).
- 📌 **Concepto clave** — se identifica al instante (etiqueta + tipografía distinta, no solo un ícono en círculo).
- 🧠 **Para recordar** — refuerzo visual, puede ir sin fondo, solo con una línea decorativa y tipografía distinta.
- ⚠️ **Importante** — destaca sin parecer alerta de sistema (evita rojo/amarillo genérico de "error").
- 💬 **Cita** — composición editorial propia (comillas grandes, tipografía itálica, sin caja si no hace falta).
- 🔎 **Ejemplo** — visualmente distinto del contenido teórico que lo rodea.
- 📝 **Actividad** — se siente interactiva (usa los widgets de `crear*` de `src/vendor/funciones`, no solo texto).
- 📊 **Datos** — números grandes, comparaciones, mini-gráficos si aportan.

## Código

- Solo Tailwind CSS; nada de `style="..."` cuando exista alternativa razonable con clases. (Excepción ya establecida en este proyecto: variables CSS puntuales como `--phase-color` para temas de color dinámico.)
- HTML limpio, sin divs de relleno, fácil de modificar. JS solo si la interacción lo requiere.
- Reutiliza y, si hace falta, amplía las clases `@layer components` de `src/styles/tailwind.css` (`book-page`, `book-card`, `section-tag`, `info-card`, `phase-tag`) en vez de inventar clases nuevas sueltas para lo mismo — pero si un componente pide una forma realmente distinta, no lo fuerces a encajar en esas clases.

## Al responder con un componente nuevo

1. **Concepto de diseño** (2-3 líneas: idea visual, por qué funciona para ese contenido, qué tiene mayor jerarquía).
2. **Código** (HTML/TS listo para pegar en el proyecto).
3. **Decisiones importantes** (responsive, animación, jerarquía, color) — breve, sin relleno.
