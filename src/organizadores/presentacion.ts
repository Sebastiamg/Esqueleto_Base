/** Cualquier elemento (nodo HTML o conexión SVG) que aparece en un paso dado. */
export interface ElementoPaso {
  el: HTMLElement | SVGElement;
  paso: number;
  /** ms de espera al entrar (escalona hermanos y deja que la línea se dibuje antes del nodo). */
  retraso: number;
}

export function aplicarPaso(elementos: ElementoPaso[], paso: number, pasoAnterior: number): void {
  for (const e of elementos) {
    const visible = e.paso <= paso;
    const entrando = visible && e.paso > pasoAnterior;
    e.el.style.setProperty('--org-retraso', `${entrando ? e.retraso : 0}ms`);
    e.el.classList.toggle('org-visible', visible);
    // inert: un nodo oculto con campos de escritura no debe recibir foco
    // con Tab ni leerse en lectores de pantalla.
    if (e.el instanceof HTMLElement) e.el.inert = !visible;
  }
}
