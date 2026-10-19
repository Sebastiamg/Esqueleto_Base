import type { ConectorConfig, NodoMapa } from './tipos';
import { crearNodo } from './nodo';
import { crearConexion, type Conexion, type Ruta } from './conectores';
import type { ElementoPaso } from './presentacion';

const ESCALON_MS = 90;
const ESPERA_LINEA_MS = 260;

// Identifica cada nodo en el DOM (data-org-id) para que las conexiones lo
// encuentren también en el iframe de impresión. Global: único aunque haya
// varios organizadores en la misma página.
let secuenciaNodos = 0;

export interface ArbolConstruido {
  raiz: HTMLElement;
  nodos: ElementoPaso[];
  conexiones: Conexion[];
}

interface NodoColocado {
  el: HTMLElement;
  paso: number;
  escalon: number;
}

/**
 * Orden por defecto de la presentación: los hijos de la raíz aparecen de a
 * uno; dentro de cada rama, primero su nota, luego todos sus hijos juntos y
 * al final su nodo de convergencia. `nodo.paso` pisa cualquier valor.
 */
function calcularPasos(raiz: NodoMapa): Map<NodoMapa, number> {
  const pasos = new Map<NodoMapa, number>();
  let contador = 0;
  const fijar = (n: NodoMapa, p: number) => pasos.set(n, n.paso ?? p);

  const desplegar = (n: NodoMapa, hijosDeUnoEnUno: boolean) => {
    if (n.nota) fijar(n.nota, ++contador);
    const hijos = n.hijos ?? [];
    if (hijosDeUnoEnUno) {
      for (const h of hijos) {
        fijar(h, ++contador);
        desplegar(h, false);
      }
    } else if (hijos.length) {
      const p = ++contador;
      hijos.forEach(h => fijar(h, p));
      hijos.forEach(h => desplegar(h, false));
    }
    if (n.converge) {
      fijar(n.converge, ++contador);
      desplegar(n.converge, false);
    }
  };

  fijar(raiz, 0);
  desplegar(raiz, true);
  return pasos;
}

function div(clase: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = clase;
  return el;
}

export function construirArbol(raiz: NodoMapa, svg: SVGSVGElement): ArbolConstruido {
  const pasos = calcularPasos(raiz);
  const nodos: ElementoPaso[] = [];
  const conexiones: Conexion[] = [];
  const entrantesPorPaso = new Map<number, number>();

  const colocar = (n: NodoMapa, conEntrada: boolean): NodoColocado => {
    const el = crearNodo(n);
    el.dataset.orgId = `n${++secuenciaNodos}`;
    const paso = pasos.get(n) ?? 0;
    const indice = entrantesPorPaso.get(paso) ?? 0;
    entrantesPorPaso.set(paso, indice + 1);
    const escalon = indice * ESCALON_MS;
    nodos.push({ el, paso, retraso: (conEntrada ? ESPERA_LINEA_MS : 0) + escalon });
    return { el, paso, escalon };
  };

  const conectar = (
    desde: HTMLElement,
    hasta: NodoColocado,
    ruta: Ruta,
    conector: ConectorConfig | undefined,
    desdeCompacto?: HTMLElement,
  ) => {
    conexiones.push(
      crearConexion(svg, { desde, hasta: hasta.el, ruta, conector, desdeCompacto, paso: hasta.paso, retraso: hasta.escalon }),
    );
  };

  const fila = (n: NodoMapa, conEntrada: boolean): { contenedor: HTMLElement; propio: NodoColocado } => {
    const contenedor = div('org-fila');
    const cabeza = div('org-cabeza');
    const propio = colocar(n, conEntrada);
    cabeza.append(propio.el);
    contenedor.append(cabeza);

    if (n.nota) {
      const conector = n.nota.conector ?? n.conectorHijos;
      // Con palabra de enlace, la nota se separa más para dejarle lugar.
      const envoltorio = div(conector?.etiqueta ? 'org-nota org-nota--etiquetada' : 'org-nota');
      const nota = colocar(n.nota, true);
      envoltorio.append(nota.el);
      cabeza.append(envoltorio);
      conectar(propio.el, nota, 'v', conector);
    }

    const hijosEl: HTMLElement[] = [];
    if (n.hijos?.length) {
      const columna = div('org-hijos');
      for (const h of n.hijos) {
        const hijo = fila(h, true);
        columna.append(hijo.contenedor);
        conectar(propio.el, hijo.propio, 'h', h.conector ?? n.conectorHijos);
        hijosEl.push(hijo.propio.el);
      }
      contenedor.append(columna);
    }

    if (n.converge) {
      const envoltorio = div('org-converge');
      const destino = fila(n.converge, true);
      envoltorio.append(destino.contenedor);
      contenedor.append(envoltorio);
      const conector = n.converge.conector ?? n.conectorHijos;
      for (const origen of hijosEl.length ? hijosEl : [propio.el]) {
        conectar(origen, destino.propio, 'h', conector, propio.el);
      }
    }

    return { contenedor, propio };
  };

  return { raiz: fila(raiz, false).contenedor, nodos, conexiones };
}
