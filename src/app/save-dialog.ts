import { iconoAlumno, iconoCerrar } from './icons';

/**
 * Diálogo "Guarda tu actividad": pide el nombre del estudiante y, al
 * confirmar, llama a `onGuardar(nombre)` (el llamador decide qué hacer con
 * el nombre — normalmente incrustarlo en el encabezado— y luego imprime).
 */
export function abrirDialogoGuardar(onGuardar: (nombre: string) => void): void {
  const overlay = document.createElement('div');
  overlay.className =
    'fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-entrada print:hidden';
  overlay.innerHTML = `
    <div class="relative w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-card-hover animate-pop sm:p-8">
      <button
        type="button"
        data-cerrar-dialogo
        aria-label="Cerrar"
        class="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >${iconoCerrar}</button>

      <div class="mb-6 flex flex-col items-center">
        <div class="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500 shadow-sm">
          ${iconoAlumno}
        </div>
        <h3 class="m-0 text-center text-lg font-black text-slate-900">Guarda tu actividad</h3>
        <p class="m-0 mt-1.5 text-center text-sm font-medium text-slate-500">
          Ingresa tu nombre para registrar tu progreso.
        </p>
      </div>

      <div class="mb-2 w-full">
        <label class="mb-2 block font-bold text-slate-700" for="dialogo-nombre">¿Cómo te llamas?</label>
        <input
          id="dialogo-nombre"
          type="text"
          placeholder="Escribe tu nombre aquí..."
          class="m-0 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 font-bold text-slate-800 outline-none transition-all placeholder-slate-400 focus:border-brand-500 focus:bg-white"
        />
        <p data-error class="mt-1.5 hidden text-xs font-semibold text-danger-600">Por favor ingresa tu nombre.</p>
      </div>

      <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
        <button
          type="button"
          data-cerrar-dialogo
          class="w-full cursor-pointer rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 font-black text-slate-600 transition-colors hover:bg-slate-50"
        >Cerrar</button>
        <button
          type="button"
          data-guardar
          class="w-full cursor-pointer rounded-xl bg-brand-500 px-5 py-3.5 font-black text-white shadow-sm transition-colors hover:bg-brand-600"
        >Guardar</button>
      </div>
    </div>`;
  document.body.append(overlay);

  const input = overlay.querySelector<HTMLInputElement>('#dialogo-nombre')!;
  const error = overlay.querySelector<HTMLElement>('[data-error]')!;
  const botonGuardar = overlay.querySelector<HTMLButtonElement>('[data-guardar]')!;

  function cerrar(): void {
    overlay.remove();
  }

  overlay.querySelectorAll('[data-cerrar-dialogo]').forEach(boton => boton.addEventListener('click', cerrar));

  function confirmar(): void {
    const nombre = input.value.trim();
    if (!nombre) {
      error.classList.remove('hidden');
      input.classList.add('border-danger-400');
      input.focus();
      return;
    }
    cerrar();
    onGuardar(nombre);
  }

  botonGuardar.addEventListener('click', confirmar);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') confirmar();
  });
  input.addEventListener('input', () => {
    error.classList.add('hidden');
    input.classList.remove('border-danger-400');
  });

  requestAnimationFrame(() => input.focus());
}
