/**
 * Glosario en línea. En el texto, cada palabra del glosario se marca así:
 *
 *   <span class="glosa" data-significado="Plancton marino o de aguas dulces.">zooplancton</span>
 *
 * y al final del .ts de la actividad (después de crear todo el contenido) se
 * llama activarGlosario(). Al pasar el mouse, tocar o enfocar la palabra
 * aparece su significado en una burbuja que se acomoda para no salirse nunca
 * de la pantalla (la tarjeta del libro tiene overflow:hidden, por eso no se
 * hace con CSS puro). Al imprimir, el significado va entre paréntesis (CSS
 * en tailwind.css).
 */
export function activarGlosario(raiz: ParentNode = document): void {
  const palabras = raiz.querySelectorAll<HTMLElement>('.glosa[data-significado]');
  if (palabras.length === 0) return;

  const burbuja = document.createElement('div');
  burbuja.id = 'glosa-burbuja';
  burbuja.setAttribute('role', 'tooltip');
  burbuja.className =
    'pointer-events-none fixed left-0 top-0 z-50 max-w-[18rem] rounded-xl bg-slate-800 px-3 py-2 text-sm leading-snug text-white opacity-0 shadow-card transition-opacity duration-150 print:hidden';
  document.body.appendChild(burbuja);

  let actual: HTMLElement | null = null;

  function posicionar(palabra: HTMLElement): void {
    const r = palabra.getBoundingClientRect();
    const b = burbuja.getBoundingClientRect();
    const margen = 8;
    const izquierda = Math.min(Math.max(margen, r.left + r.width / 2 - b.width / 2), window.innerWidth - b.width - margen);
    let arriba = r.top - b.height - margen;
    if (arriba < margen) arriba = r.bottom + margen; // sin lugar arriba: debajo de la palabra
    burbuja.style.transform = `translate(${Math.round(izquierda)}px, ${Math.round(arriba)}px)`;
  }

  function mostrar(palabra: HTMLElement): void {
    actual = palabra;
    burbuja.replaceChildren();
    const titulo = document.createElement('b');
    titulo.className = 'text-amber-300';
    titulo.textContent = `${palabra.textContent?.trim()}. `;
    burbuja.append(titulo, palabra.dataset.significado ?? '');
    burbuja.style.opacity = '1';
    palabra.setAttribute('aria-describedby', burbuja.id);
    posicionar(palabra);
  }

  function ocultar(): void {
    actual?.removeAttribute('aria-describedby');
    actual = null;
    burbuja.style.opacity = '0';
  }

  palabras.forEach((palabra) => {
    palabra.tabIndex = 0;
    palabra.addEventListener('mouseenter', () => mostrar(palabra));
    palabra.addEventListener('mouseleave', ocultar);
    palabra.addEventListener('focus', () => mostrar(palabra));
    palabra.addEventListener('blur', ocultar);
    // En pantallas táctiles no hay "hover": tocar la palabra abre o cierra la burbuja.
    palabra.addEventListener('click', () => (actual === palabra ? ocultar() : mostrar(palabra)));
  });
  window.addEventListener('scroll', () => actual && posicionar(actual), { passive: true });
  window.addEventListener('resize', () => actual && posicionar(actual));
}
