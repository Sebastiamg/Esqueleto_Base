import { calificarTodo, type ResultadoActividad } from './registry';
import type { Encabezado } from './header';

/**
 * Corrige la actividad: llama revisar() en todas las instancias registradas
 * (crearPanelInformativo/crearRenglones aportan total=0, así que no
 * distorsionan la nota), muestra el resultado en el encabezado y bloquea
 * los campos para que no se sigan editando después de calificar.
 */
export function calificarActividad(raiz: ParentNode, encabezado?: Encabezado): ResultadoActividad {
  const resultado = calificarTodo();

  raiz
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select')
    .forEach(campo => {
      campo.disabled = true;
    });

  encabezado?.mostrarNota(resultado.nota);

  return resultado;
}
