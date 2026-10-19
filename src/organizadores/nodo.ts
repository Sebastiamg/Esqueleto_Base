import type { NodoMapa } from './tipos';

// El aspecto por defecto de cada tipo vive en organizadores.css
// (.org-tipo-*, dentro de @layer components): así cualquier clase de
// Tailwind que llegue en `clase` siempre le gana al preset.
export function crearNodo(nodo: NodoMapa): HTMLElement {
  const tipo = nodo.tipo ?? 'hoja';
  const el = document.createElement('div');
  el.className = `org-nodo org-tipo-${tipo} ${nodo.clase ?? ''}`;

  if (tipo === 'tarjeta') {
    if (nodo.titulo) {
      const titulo = document.createElement('div');
      titulo.className = `org-tarjeta-titulo ${nodo.claseTitulo ?? ''}`;
      titulo.innerHTML = nodo.titulo;
      el.append(titulo);
    }
    const cuerpo = document.createElement('div');
    cuerpo.className = `org-tarjeta-texto ${nodo.claseTexto ?? ''}`;
    cuerpo.innerHTML = nodo.texto ?? '';
    el.append(cuerpo);
    return el;
  }

  if (nodo.icono) el.insertAdjacentHTML('beforeend', nodo.icono);
  if (nodo.imagen) {
    const img = document.createElement('img');
    img.src = nodo.imagen;
    img.alt = nodo.imagenAlt ?? '';
    img.className = 'h-12 w-12 shrink-0 object-contain';
    el.append(img);
  }
  if (nodo.texto) {
    // div (no span) para que el texto pueda contener bloques, ej. renglones.
    const texto = document.createElement('div');
    texto.className = 'min-w-0 flex-1';
    texto.innerHTML = nodo.texto;
    el.append(texto);
  }
  return el;
}
