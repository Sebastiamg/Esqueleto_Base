import './organizadores.css';
import type { DatosOrganizador, Organizador } from './tipos';
import { construirArbol } from './arbol';
import { ajustarOrganizadoresParaImprimir, trazarConexiones } from './trazado';
import { crearControles } from './controles';
import { aplicarPaso, type ElementoPaso } from './presentacion';

export type * from './tipos';

function resolverContenedor(id: IdentificadorActividad): HTMLElement {
  if (id instanceof HTMLElement) return id;
  const el = document.getElementById(`p${id}act`) ?? document.getElementById(String(id));
  if (!el) throw new Error(`crearOrganizador: no existe el contenedor "p${id}act".`);
  return el;
}

/**
 * Organizador gráfico jerárquico con presentación paso a paso. Mismo
 * contrato de id que el resto del catálogo: `crearOrganizador(1, …)` monta
 * en `<div id="p1act">`.
 */
export function crearOrganizador(id: IdentificadorActividad, datos: DatosOrganizador): Organizador {
  const host = resolverContenedor(id);
  host.replaceChildren();
  host.classList.add('org-host');
  host.tabIndex = 0;
  host.setAttribute('aria-roledescription', 'organizador gráfico');

  const lienzo = document.createElement('div');
  lienzo.className = 'org-lienzo';
  const arbol = document.createElement('div');
  arbol.className = 'org-arbol org-sin-transicion';
  const orientacion = datos.orientacion ?? 'horizontal';
  arbol.classList.toggle('org-vertical', orientacion === 'vertical');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'org-lineas');
  svg.setAttribute('aria-hidden', 'true');
  arbol.append(svg);

  const construido = construirArbol(datos.raiz, svg);
  arbol.append(construido.raiz);
  lienzo.append(arbol);
  host.append(lienzo);

  const elementos: ElementoPaso[] = [
    ...construido.nodos,
    ...construido.conexiones.map(c => ({ el: c.grupo, paso: c.paso, retraso: c.retraso })),
  ];
  const total = Math.max(...elementos.map(e => e.paso)) + 1;
  let paso = Math.min(Math.max(datos.pasoInicial ?? 0, 0), total - 1);

  const controles =
    datos.controles === false
      ? null
      : crearControles(host, {
          anterior: () => ir(paso - 1),
          siguiente: () => ir(paso + 1),
          reiniciar: () => ir(0),
        });

  function ir(destino: number): void {
    const nuevo = Math.min(Math.max(destino, 0), total - 1);
    const anterior = paso;
    paso = nuevo;
    aplicarPaso(elementos, paso, anterior);
    controles?.actualizar(paso, total);
    datos.alCambiarPaso?.(paso, total);
  }

  // Modo según el espacio: se mide el ancho natural del mapa en su
  // orientación; si un horizontal no cabe se prueba el vertical, y si
  // tampoco cabe, esquema compacto. Medir es sincrónico (cambiar clase y leer
  // offsetWidth), así que no se ve ningún salto.
  //
  // El espacio nunca se toma mayor que el de una hoja impresa: así el mapa
  // ya se ve en pantalla como va a salir en papel (un horizontal que no
  // cabría en la hoja arranca vertical) y al imprimir no hay que rearmarlo.
  // 814 = los 700 px de anchoHoja (trazado.ts) / 0,86 de la letra impresa.
  const ANCHO_HOJA_EN_PANTALLA = 814;
  function evaluarModo(): void {
    const modo = datos.compacto ?? 'auto';
    arbol.classList.remove('org-compacto');
    arbol.classList.toggle('org-vertical', orientacion === 'vertical');
    if (modo === 'siempre') {
      arbol.classList.add('org-compacto');
      return;
    }
    if (modo === 'nunca') return;
    const disponible = Math.min(lienzo.clientWidth, ANCHO_HOJA_EN_PANTALLA);
    if (arbol.offsetWidth <= disponible) return;
    if (orientacion === 'horizontal') {
      arbol.classList.add('org-vertical');
      if (arbol.offsetWidth <= disponible) return;
      arbol.classList.remove('org-vertical');
    }
    arbol.classList.add('org-compacto');
  }

  let cuadro = 0;
  let imprimiendo = false;
  function redibujar(): void {
    cancelAnimationFrame(cuadro);
    cuadro = requestAnimationFrame(() => {
      if (imprimiendo) return;
      evaluarModo();
      // Sin transiciones mientras se recalculan largos: si no, una línea
      // oculta "parpadea" al cambiar su largo.
      arbol.classList.add('org-sin-transicion');
      trazarConexiones(arbol);
      void arbol.offsetWidth;
      requestAnimationFrame(() => arbol.classList.remove('org-sin-transicion'));
    });
  }

  aplicarPaso(elementos, paso, paso);
  controles?.actualizar(paso, total);

  const observador = new ResizeObserver(redibujar);
  observador.observe(lienzo);
  observador.observe(arbol);
  document.fonts?.ready.then(redibujar);

  // Ctrl+P directo sobre la página (el botón "Imprimir" del menú usa un
  // iframe aparte, ver print.ts). "beforeprint" llega con los estilos de
  // impresión ya aplicados, así que se mide el layout real de la hoja.
  const antesDeImprimir = () => {
    imprimiendo = true;
    ajustarOrganizadoresParaImprimir(document, trazarConexiones);
  };
  const despuesDeImprimir = () => {
    imprimiendo = false;
    arbol.style.transform = '';
    arbol.style.marginBottom = '';
    redibujar();
  };
  window.addEventListener('beforeprint', antesDeImprimir);
  window.addEventListener('afterprint', despuesDeImprimir);

  host.addEventListener('keydown', evento => {
    const acciones: Record<string, () => void> = {
      ArrowRight: () => ir(paso + 1),
      ArrowLeft: () => ir(paso - 1),
      Home: () => ir(0),
      End: () => ir(total - 1),
    };
    const accion = acciones[evento.key];
    if (!accion) return;
    evento.preventDefault();
    accion();
  });

  return {
    get paso() {
      return paso;
    },
    get totalPasos() {
      return total;
    },
    siguiente: () => ir(paso + 1),
    anterior: () => ir(paso - 1),
    reiniciar: () => ir(0),
    irAPaso: ir,
    mostrarTodo: () => ir(total - 1),
    destruir() {
      observador.disconnect();
      cancelAnimationFrame(cuadro);
      controles?.destruir();
      window.removeEventListener('beforeprint', antesDeImprimir);
      window.removeEventListener('afterprint', despuesDeImprimir);
      host.replaceChildren();
    },
  };
}
