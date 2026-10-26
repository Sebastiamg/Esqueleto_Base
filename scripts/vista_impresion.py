"""Vista previa de IMPRESIÓN de actividades (sin diálogo de impresión).

Hace lo mismo que el botón "Imprimir PDF" del menú (print.ts arma un clon de
la página en un iframe de 816 px y lo imprime), pero en lugar de abrir el
diálogo guarda el PDF y cada hoja como PNG para revisarla a ojo.

Requisitos: el servidor de desarrollo corriendo (npm run dev) y Python con
playwright (`pip install playwright`) y pymupdf; usa el Chrome o el Edge
instalados.

Uso:
    python scripts/vista_impresion.py uni1_tem3_taller [otro_archivo ...]
        [--puerto 5480] [--salida <carpeta>]

Deja <salida>/<archivo>.pdf y <salida>/<archivo>_p1.png, _p2.png, …
(por defecto en ./revision_impresion, que no se publica).
"""
import argparse
import asyncio
from pathlib import Path

import pymupdf
from playwright.async_api import async_playwright

# Intercepta el iframe de impresión: deja que print.ts lo arme y corra sus
# scripts (líneas de "Relacionar", organizadores), pero sin abrir el diálogo.
CAPTURAR = """
() => new Promise(resolve => {
  const mo = new MutationObserver(ms => {
    for (const m of ms) for (const n of m.addedNodes) {
      if (n.tagName !== 'IFRAME') continue;
      mo.disconnect();
      n.addEventListener('load', () => {
        n.contentWindow.print = () => {};
        setTimeout(() => resolve(n.srcdoc), 900);
      });
    }
  });
  mo.observe(document.body, { childList: true });
  document.querySelector('[data-accion="imprimir"]').click();
})
"""


async def imprimir(navegador, base: str, archivo: str, salida: Path) -> list[Path]:
    pagina = await navegador.new_page(viewport={'width': 1280, 'height': 900})
    await pagina.goto(f'{base}/src/actividades/{archivo}.html', wait_until='networkidle')
    await pagina.wait_for_timeout(800)
    clon = await pagina.evaluate(CAPTURAR)
    await pagina.close()

    hoja = await navegador.new_page(viewport={'width': 816, 'height': 1056})
    await hoja.goto(f'{base}/', wait_until='domcontentloaded')
    await hoja.set_content(clon.replace('<head>', f'<head><base href="{base}/">', 1), wait_until='networkidle')
    await hoja.wait_for_timeout(1200)  # scripts del clon (recalculan líneas a los 200 ms)
    pdf = salida / f'{archivo}.pdf'
    await hoja.pdf(path=str(pdf), prefer_css_page_size=True, print_background=True)
    await hoja.close()

    pngs = []
    with pymupdf.open(pdf) as doc:
        for i, p in enumerate(doc, 1):
            png = salida / f'{archivo}_p{i}.png'
            p.get_pixmap(dpi=80).save(png)
            pngs.append(png)
    return pngs


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('archivos', nargs='+')
    ap.add_argument('--puerto', type=int, default=5480)
    ap.add_argument('--salida', default='revision_impresion')
    args = ap.parse_args()
    salida = Path(args.salida)
    salida.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as pw:
        # Chrome o Edge instalados (no hace falta "playwright install").
        try:
            navegador = await pw.chromium.launch(channel='chrome')
        except Exception:
            navegador = await pw.chromium.launch(channel='msedge')
        for archivo in args.archivos:
            pngs = await imprimir(navegador, f'http://localhost:{args.puerto}', archivo, salida)
            print(f'{archivo}: {len(pngs)} hoja(s) -> {pngs[0].parent}')
        await navegador.close()


if __name__ == '__main__':
    asyncio.run(main())
