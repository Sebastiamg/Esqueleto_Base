// Lee src/actividades/*.html + src/contenido/*.ts (solo lectura) y genera
// registro.json: un grupo por HTML (= un registro en plataforma y un ícono
// en Flip) con sus miniactividades. Uso: node scripts/registro.mjs [raiz] [salida]
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const raiz = path.resolve(process.argv[2] ?? fileURLToPath(new URL('..', import.meta.url)));
const salida = path.resolve(process.argv[3] ?? path.join(raiz, 'registro.json'));

// tipo en plataforma: 0 = actividad, 1 = animación
const SECCIONES = {
  experiencia: 1,
  reflexion: 0,
  conceptualizacion: 1,
  taller: 0,
  aplico: 0,
  red_sinaptica: 1,
  sumativa: 0,
  diagnostica: 0,
};
const ORDEN = Object.keys(SECCIONES);
// Temas que en la plataforma existen con este nombre (sin número), uno por unidad.
const TEMA_FIJO = {
  red_sinaptica: 'Red sináptica de ideas',
  sumativa: 'Evaluación sumativa',
  diagnostica: 'Evaluación diagnóstica',
};
// Secciones cuyo encabezado trae el nombre real del tema (el taller trae su propio título).
const DAN_NOMBRE_TEMA = new Set(['experiencia', 'reflexion', 'conceptualizacion', 'aplico']);

const VARIANTES = {
  circulo: 'Encerrar respuesta',
  subrayar: 'Subrayar respuesta',
  pintar: 'Pintar ítem',
  cruz: 'Marcar con X',
  check: 'Marcar respuesta',
  resaltar: 'Resaltar respuesta',
};
const seleccion = v => VARIANTES[v] ?? 'Seleccionar respuesta';
const DESCRIPCIONES = {
  crearSeleccionMultipleSinEnunciado: seleccion,
  crearSeleccionMultipleConEnunciado: seleccion,
  crearSeleccionSimpleSinEnunciado: seleccion,
  crearSeleccionSimpleConEnunciado: seleccion,
  crearRelacionar: () => 'Unir líneas',
  crearRelacionarLiteral: () => 'Relacionar',
  crearRellenarEspacios: () => 'Completar espacios',
  crearCompletarTabla: () => 'Completar tabla',
  crearVerdaderoFalso: () => 'Verdadero o falso',
  crearResaltarPalabras: () => 'Resaltar palabras',
  crearLienzo: () => 'Dibujar',
  crearOrganizador: () => 'Mapa conceptual',
  crearRutinasPensamiento: () => 'Rutina de pensamiento',
  crearListaVerificacion: () => 'Lista de verificación',
  crearCoevaluacion: () => 'Coevaluación',
  crearPanelInformativo: () => 'Leer información',
  crearCuento: () => 'Leer cuento',
  crearSopaLetras: () => 'Sopa de letras',
  crearEtiquetarImagen: () => 'Etiquetar imagen',
  crearSubirImagen: () => 'Subir imagen',
  crearRenglones: () => 'Escribir respuesta',
  crearEscalaNivel: () => 'Pintar nivel',
  crearRelacionarTresColumnas: () => 'Unir líneas',
  crearElegirMayuscula: () => 'Elegir mayúscula o minúscula',
};
const SIN_ID = new Set(['crearMenu', 'crearEncabezado', 'crearRevelador', 'crearRenglones']);

const valor = n =>
  n && ts.isNumericLiteral(n) ? Number(n.text)
  : n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) ? n.text
  : undefined;

function propiedades(obj) {
  if (!obj || !ts.isObjectLiteralExpression(obj)) return {};
  return Object.fromEntries(
    obj.properties.filter(ts.isPropertyAssignment).map(p => [p.name.getText(), valor(p.initializer)]),
  );
}

function leerTs(archivo) {
  const texto = readFileSync(archivo, 'utf8');
  const fuente = ts.createSourceFile(archivo, texto, ts.ScriptTarget.Latest, true);
  // Preguntas armadas a mano en el .ts (sin widget del catálogo).
  const manuales = new Set([...texto.matchAll(/getElementById\(\s*['"`]p(\d+)/g)].map(m => Number(m[1])));
  const widgets = []; // { id, fn, variante, escribe }
  const auxiliares = new Map(); // const organizador = (id, ...) => crearOrganizador(id, ...)
  const avisos = [];
  let encabezado;

  function auxiliarDe(llamada, arg) {
    if (!ts.isIdentifier(arg)) return;
    for (let n = llamada.parent; n; n = n.parent) {
      if (ts.isArrowFunction(n) || ts.isFunctionExpression(n) || ts.isFunctionDeclaration(n)) {
        const indice = n.parameters.findIndex(p => p.name.getText() === arg.text);
        const decl = ts.isFunctionDeclaration(n) ? n : n.parent;
        if (indice >= 0 && decl?.name && ts.isIdentifier(decl.name)) return { nombre: decl.name.text, indice };
        return;
      }
    }
  }

  function visitar(n) {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression)) {
      const fn = n.expression.text;
      const [a0, a1] = n.arguments;
      if (fn === 'crearEncabezado') encabezado = propiedades(a1);
      else if (auxiliares.has(fn)) {
        const aux = auxiliares.get(fn);
        const id = valor(n.arguments[aux.indice]);
        if (id !== undefined) widgets.push({ id: String(id), fn: aux.fn, variante: aux.variante, escribe: /bookText/.test(n.getText()) });
      } else if (fn.startsWith('crear') && !(SIN_ID.has(fn) && !a0)) {
        const id = valor(a0);
        const variante = propiedades(a1).variante;
        if (id !== undefined) widgets.push({ id: String(id), fn, variante, escribe: /bookText/.test(n.getText()) });
        else if (id === undefined && !SIN_ID.has(fn)) {
          const aux = auxiliarDe(n, a0);
          if (aux) auxiliares.set(aux.nombre, { fn, variante, indice: aux.indice });
          else avisos.push(`${fn}: id no literal, no se pudo resolver`);
        }
      }
    }
    ts.forEachChild(n, visitar);
  }
  visitar(fuente);
  return { encabezado, widgets, manuales, avisos };
}

function leerHtml(archivo) {
  const html = readFileSync(archivo, 'utf8');
  // El verbo se busca en los 300 caracteres siguientes sin consumirlos: si no,
  // un enunciado pegado al anterior (a menos de 300) quedaba sin detectar.
  const enunciados = [...html.matchAll(/<span class="text-blue-600 font-bold text-lg mr-1\.5">\s*(\d+)\.\s*<\/span>/g)]
    .map(m => {
      const despues = html.slice(m.index + m[0].length, m.index + m[0].length + 300);
      return { n: Number(m[1]), pos: m.index, verbo: despues.match(/<b>\s*([^<]+?)\s*<\/b>/)?.[1] ?? '' };
    });
  const badges = new Map(
    [...html.matchAll(/class="p(\d+) punto(\d+)( c-d)?"/g)].map(m => [Number(m[1]), { puntaje: Number(m[2]), docente: !!m[3] }]),
  );
  const montajes = [...html.matchAll(/id="p(\d+)(?:_\w+)?act"/g)].map(m => ({ n: Number(m[1]), pos: m.index }));
  const paginas = [...html.matchAll(/data-pagina="(\d+)"/g)].map(m => ({ pos: m.index, pagina: Number(m[1]) }));
  const renglones = [...html.matchAll(/class="[^"]*\bbookText ln\d+/g)].map(m => m.index);
  const inicio = Math.max(0, html.indexOf('<!-- --- inicio --- -->'));
  const fin = html.indexOf('<!-- --- fin --- -->') >= 0 ? html.indexOf('<!-- --- fin --- -->') : html.length;
  return { html, inicio, fin, enunciados, badges, montajes, paginas, renglones };
}

const paginaEn = (paginas, pos, base) => paginas.filter(p => p.pos < pos).at(-1)?.pagina ?? base;

// Miniactividad = cada enunciado numerado del libro + cada montaje pNact cuyo N
// no tiene enunciado, en el orden en que aparecen en el HTML. Cuenta TODO lo que
// trae algo además del enunciado: un widget, renglones, una lectura, un cuento,
// una imagen, un mapa, un esquema, una lista de preguntas (aunque sea oral y no
// tenga campo ni puntaje). Solo NO cuenta el enunciado solo, sin nada más
// ("Repasen sus intervenciones…"): queda en "solo_enunciado".
// En conceptualización toda la teoría (paneles, mapas y esquemas de solo
// lectura, sin número) es UNA miniactividad, más cada actividad. En la red
// sináptica cada mapa es una.
const SOLO_LECTURA = new Set(['crearPanelInformativo', 'crearCuento', 'crearOrganizador']);

/** ¿Hay contenido real entre dos posiciones del HTML? (no cuentan comentarios, íconos ni títulos de sección) */
function contenidoEntre(html, desde, hasta) {
  let s = html.slice(desde, hasta);
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/<img\b[^>]*\bsrc="[^"]*\/ico_[^"]*"[^>]*>/gi, '');
  s = s.replace(/<img\b[^>]*\bdata-decorativa\b[^>]*>/gi, ''); // foto que solo acompaña, no es contenido
  s = s.replace(/<(strong|h[1-6])\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  s = s.replace(/<div class="p\d+ punto[^"]*"><\/div>/g, '');
  const imagen = /<img\b/i.test(s);
  const estructura = /<(table|ul|ol|li|svg|canvas|figure|blockquote|input|select|textarea)\b/i.test(s)
    || /id="p\d+(?:_\w+)?act"/.test(s) || /\bbookText\b/.test(s);
  const texto = s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  return { tiene: imagen || estructura || texto.length >= 15, imagen, texto };
}

function describirContenido(enunciado, c) {
  if (/^(le[eé]|disfruta)/i.test(enunciado.verbo)) return 'Leer texto';
  if (/^observa/i.test(enunciado.verbo) || (c.imagen && !c.texto)) return 'Observar imagen';
  if (/oralmente|^(comenta|conversen|dialoguen|expongan|debatan|socialicen|presenten)/i.test(`${enunciado.verbo} ${enunciado.texto}`)) {
    return 'Actividad oral';
  }
  return 'Leer información';
}

function miniactividades(h, t, paginaBase, avisos, seccion) {
  const numerados = new Set(h.enunciados.map(e => e.n));
  const sinNumero = [];
  for (const m of h.montajes) {
    if (!numerados.has(m.n) && !sinNumero.some(x => x.n === m.n)) sinNumero.push({ n: m.n, pos: m.pos, verbo: '', texto: '' });
  }
  const items = [
    ...h.enunciados.map(e => {
      // Fin del bloque del enunciado: el contenido de la pregunta empieza después.
      const cierre = h.html.indexOf('</div>', e.pos);
      const finEnunciado = cierre >= 0 ? cierre + 6 : e.pos;
      const texto = h.html.slice(e.pos, finEnunciado).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return { ...e, numerada: true, desde: finEnunciado, texto };
    }),
    ...sinNumero.map(e => ({ ...e, numerada: false, desde: e.pos })),
  ].sort((a, b) => a.pos - b.pos);

  const minis = [];
  const soloEnunciado = [];
  const teoria = []; // conceptualización: partes de teoría que se juntan en una
  if (seccion === 'conceptualizacion' && items.length) {
    const c = contenidoEntre(h.html, h.inicio, items[0].pos);
    if (c.tiene) teoria.push({ n: null, pos: h.inicio, descripcion: 'Leer información' });
  }

  items.forEach((e, i) => {
    const fin = Math.min(items[i + 1]?.pos ?? h.fin, h.fin);
    const widgets = t.widgets.filter(w => Number(w.id.split('_')[0]) === e.n);
    const responde = [];
    const lectura = [];
    for (const w of widgets) {
      if (SOLO_LECTURA.has(w.fn) && w.escribe) responde.push('Escribir respuesta'); // mapa o panel con renglones
      else {
        const d = DESCRIPCIONES[w.fn];
        if (!d) avisos.push(`${w.fn} (pregunta ${e.n}) no tiene descripción en DESCRIPCIONES`);
        (SOLO_LECTURA.has(w.fn) ? lectura : responde).push(d ? d(w.variante) : `REVISAR: ${w.fn}`);
      }
    }
    if (h.renglones.some(p => p > e.pos && p < fin)) responde.push('Escribir respuesta');
    const badge = h.badges.get(e.n);
    const contenido = contenidoEntre(h.html, e.desde, fin);

    if (!responde.length && !lectura.length) {
      if (t.manuales.has(e.n) && !/^(le[eé]|disfruta|observa)/i.test(e.verbo)) {
        responde.push('REVISAR');
        avisos.push(`Pregunta ${e.n} armada a mano en el .ts: describirla en el Excel`);
      } else if (contenido.tiene || !e.numerada) {
        lectura.push(describirContenido(e, contenido));
      } else {
        if (badge) avisos.push(`Pregunta ${e.n} tiene puntaje pero nada más que el enunciado`);
        soloEnunciado.push(e.n);
        return;
      }
    }
    const descripcion = [...new Set([...responde, ...lectura])].join(' + ');
    if (seccion === 'conceptualizacion' && !e.numerada && !responde.length) {
      teoria.push({ n: e.n, pos: e.pos, descripcion });
      return;
    }
    minis.push({
      n: e.n,
      numerada: e.numerada,
      pos: e.pos,
      pagina: paginaEn(h.paginas, e.pos, paginaBase),
      ...(badge ?? { puntaje: null, docente: false }),
      descripcion,
    });
  });

  if (teoria.length) {
    const primero = teoria.find(x => x.n !== null) ?? teoria[0];
    const usados = new Set(minis.map(m => m.n));
    let n = primero.n ?? 0;
    while (usados.has(n)) n += 1;
    minis.push({
      n,
      numerada: false,
      pos: teoria[0].pos,
      pagina: paginaEn(h.paginas, teoria[0].pos, paginaBase),
      puntaje: null,
      docente: false,
      descripcion: `Teoría: ${[...new Set(teoria.flatMap(x => x.descripcion.split(' + ')))].join(' + ')}`,
    });
  }
  minis.sort((a, b) => a.pos - b.pos);
  return { minis: minis.map(({ pos, ...m }) => m), soloEnunciado };
}

const dirHtml = path.join(raiz, 'src', 'actividades');
const dirTs = path.join(raiz, 'src', 'contenido');
const grupos = [];
const ignorados = [];

for (const archivo of readdirSync(dirHtml).filter(f => f.endsWith('.html')).sort()) {
  const nombre = archivo.slice(0, -5);
  // uni{U}_tem{T}_{seccion}; la red sináptica es una por unidad y no lleva tema: uni{U}_red_sinaptica.
  const m = nombre.match(/^uni(\d+)_(?:tem(\d+)_([a-z_]+)|(red_sinaptica))$/);
  if (!m) {
    ignorados.push(nombre);
    continue;
  }
  const unidad = Number(m[1]);
  const temaNum = m[2] ? Number(m[2]) : null;
  const seccion = m[3] ?? m[4];
  const avisos = [];
  if (temaNum !== null && seccion === 'red_sinaptica') avisos.push(`Nombre antiguo: renómbralo a uni${unidad}_red_sinaptica`);
  const rutaTs = path.join(dirTs, `${nombre}.ts`);
  if (!existsSync(rutaTs)) avisos.push(`Falta src/contenido/${nombre}.ts`);
  const t = existsSync(rutaTs) ? leerTs(rutaTs) : { encabezado: undefined, widgets: [], manuales: new Set(), avisos: [] };
  avisos.push(...t.avisos);
  const enc = t.encabezado ?? {};
  if (!t.encabezado) avisos.push('Sin crearEncabezado');
  if (enc.unidad !== undefined && enc.unidad !== unidad) avisos.push(`Encabezado dice unidad ${enc.unidad}, el archivo ${unidad}`);
  if (enc.pagina === undefined) avisos.push('Encabezado sin página');
  if (!(seccion in SECCIONES)) avisos.push(`Sección "${seccion}" desconocida: agrégala a SECCIONES`);

  const h = leerHtml(path.join(dirHtml, archivo));
  const { minis, soloEnunciado } = miniactividades(h, t, enc.pagina ?? null, avisos, seccion);
  const numeros = h.enunciados.map(e => e.n);
  if (numeros.some((n, i) => n !== i + 1)) avisos.push(`Numeración no correlativa: ${numeros.join(', ')}`);
  const sueltos = [...new Set(t.widgets.map(w => Number(w.id.split('_')[0])))].filter(n => !h.montajes.some(m => m.n === n));
  if (sueltos.length) avisos.push(`Widgets sin montaje en el HTML: ${sueltos.join(', ')}`);
  if (enc.pagina !== undefined && minis.some(x => x.pagina < enc.pagina)) avisos.push('Hay miniactividades con página menor a la del encabezado');

  grupos.push({
    archivo: nombre,
    unidad,
    tema_num: temaNum,
    seccion,
    tipo: SECCIONES[seccion] ?? null,
    tema: null,
    titulo_encabezado: enc.tema ?? null,
    pagina: enc.pagina ?? null,
    miniactividades: minis,
    solo_enunciado: soloEnunciado,
    avisos,
  });
}

// El taller toma el nombre del tema de sus hermanos (mismo uni/tem).
for (const g of grupos) {
  if (TEMA_FIJO[g.seccion]) {
    g.tema = TEMA_FIJO[g.seccion];
    continue;
  }
  const fuentes = DAN_NOMBRE_TEMA.has(g.seccion)
    ? [g]
    : grupos.filter(o => o.unidad === g.unidad && o.tema_num === g.tema_num && DAN_NOMBRE_TEMA.has(o.seccion));
  const nombres = [...new Set(fuentes.map(o => o.titulo_encabezado).filter(Boolean))];
  if (nombres.length > 1) g.avisos.push(`Nombres de tema distintos entre hermanos: ${nombres.join(' | ')}`);
  if (nombres.length) g.tema = `Tema ${g.tema_num}: ${nombres[0]}`;
  else g.avisos.push(`Sin nombre de tema ${g.tema_num}: se completa desde la API`);
}

grupos.sort((a, b) => a.unidad - b.unidad || (a.tema_num ?? 99) - (b.tema_num ?? 99) || ORDEN.indexOf(a.seccion) - ORDEN.indexOf(b.seccion));
const huerfanos = readdirSync(dirTs)
  .filter(f => f.endsWith('.ts') && !existsSync(path.join(dirHtml, f.replace(/\.ts$/, '.html'))));

writeFileSync(
  salida,
  JSON.stringify({ generado: new Date().toISOString(), grupos, ignorados, ts_sin_html: huerfanos }, null, 2) + '\n',
);

const conAvisos = grupos.filter(g => g.avisos.length);
console.log(`${grupos.length} grupo(s), ${grupos.reduce((n, g) => n + g.miniactividades.length, 0)} miniactividad(es) -> ${salida}`);
if (ignorados.length) console.log(`Ignorados (nombre fuera de uniX_temX_seccion / uniX_red_sinaptica): ${ignorados.join(', ')}`);
if (huerfanos.length) console.log(`.ts sin .html: ${huerfanos.join(', ')}`);
for (const g of conAvisos) console.log(`! ${g.archivo}: ${g.avisos.join(' · ')}`);
