import type { ConectorConfig, EstiloLinea } from './tipos';

const NS = 'http://www.w3.org/2000/svg';
const PATRON: Record<EstiloLinea, string | null> = {
  continuo: null,
  discontinuo: '6 5',
  // Trazos de largo ~0 con punta redonda = puntos.
  punteado: '0.1 6',
};

let secuencia = 0;

/** 'h': sale por la derecha y entra por la izquierda. 'v': baja por la izquierda y entra por la izquierda. */
export type Ruta = 'h' | 'v';

export interface OpcionesConexion {
  desde: HTMLElement;
  hasta: HTMLElement;
  ruta: Ruta;
  conector?: ConectorConfig;
  /** Origen alternativo cuando el mapa está en modo compacto. */
  desdeCompacto?: HTMLElement;
  paso: number;
  retraso: number;
}

export interface Conexion {
  grupo: SVGGElement;
  paso: number;
  retraso: number;
}

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, clase = ''): SVGElementTagNameMap[K] {
  const el = document.createElementNS(NS, tag);
  if (clase) el.setAttribute('class', clase);
  return el;
}

/**
 * Arma los elementos SVG de una conexión. La geometría (atributo "d",
 * marcadores, etiqueta) la calcula trazarConexiones() leyendo los data-*
 * de este grupo — así el mismo cálculo sirve en pantalla y en el iframe de
 * impresión, donde no hay objetos JS, solo DOM.
 */
export function crearConexion(svg: SVGSVGElement, opciones: OpcionesConexion): Conexion {
  const c = opciones.conector ?? {};
  const claseColor = c.clase ?? 'stroke-slate-400';
  const id = `org-mascara-${++secuencia}`;

  const grupo = svgEl('g', 'org-conexion');
  grupo.dataset.desde = opciones.desde.dataset.orgId;
  grupo.dataset.hasta = opciones.hasta.dataset.orgId;
  grupo.dataset.ruta = opciones.ruta;
  if (opciones.desdeCompacto) grupo.dataset.desdeCompacto = opciones.desdeCompacto.dataset.orgId;

  // La línea se "dibuja" animando una máscara sólida, no el trazo visible:
  // así el efecto funciona igual en líneas punteadas/discontinuas, cuyo
  // stroke-dasharray ya está ocupado por el patrón.
  const mask = svgEl('mask');
  mask.id = id;
  mask.setAttribute('maskUnits', 'userSpaceOnUse');
  mask.setAttribute('x', '-5000');
  mask.setAttribute('y', '-5000');
  mask.setAttribute('width', '20000');
  mask.setAttribute('height', '20000');
  mask.append(svgEl('path', 'org-mascara'));
  const defs = svgEl('defs');
  defs.append(mask);

  const trazo = svgEl('path', `org-trazo ${claseColor}`);
  trazo.setAttribute('stroke-width', String(c.grosor ?? 2));
  const patron = PATRON[c.estilo ?? 'continuo'];
  if (patron) trazo.setAttribute('stroke-dasharray', patron);
  trazo.setAttribute('mask', `url(#${id})`);
  grupo.append(defs, trazo);

  const marcador = (extremo: 'inicio' | 'fin') => {
    const circulo = svgEl('circle', `org-marcador org-marcador-${extremo} fill-white ${claseColor}`);
    circulo.setAttribute('r', '3.5');
    circulo.setAttribute('stroke-width', '1.5');
    grupo.append(circulo);
  };
  if (c.marcadorInicio) marcador('inicio');
  if (c.marcadorFin) marcador('fin');

  if (c.etiqueta) {
    const etiqueta = svgEl('text', `org-etiqueta ${c.claseEtiqueta ?? 'fill-slate-600 text-sm font-semibold'}`);
    etiqueta.textContent = c.etiqueta;
    etiqueta.setAttribute('dominant-baseline', 'middle');
    grupo.append(etiqueta);
  }

  svg.append(grupo);
  return { grupo, paso: opciones.paso, retraso: opciones.retraso };
}
