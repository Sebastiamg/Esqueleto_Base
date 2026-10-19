// Íconos de línea (estilo Heroicons outline, 24x24, trazo con currentColor)
// usados por el menú — sin depender de emojis ni de una fuente de íconos externa.
function svg(path: string, tamano = 'h-5 w-5'): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="inline-block ${tamano} align-[-4px]">${path}</svg>`;
}

/** Versión pequeña (16px) de un ícono ya creado con svg(), para usar dentro de un párrafo de texto. */
function enLinea(iconoGrande: string): string {
  return iconoGrande.replace('inline-block h-5 w-5', 'inline-block h-4 w-4').replace('align-[-4px]', 'align-[-3px]');
}

export const iconoHamburguesa = svg(
  '<path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16" />',
);

export const iconoAyudas = svg(
  '<path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.008v.008H12V18z" /><circle cx="12" cy="12" r="9" stroke-linecap="round" stroke-linejoin="round" />',
);

export const iconoImprimir = svg(
  '<path stroke-linecap="round" stroke-linejoin="round" d="M8 3.5h7.5a1 1 0 0 1 .707.293l1.5 1.5A1 1 0 0 1 18 6v13.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z" /><path stroke-linecap="round" stroke-linejoin="round" d="M8.5 3.5v4.5h6.25v-3M8.5 20.5v-6h7v6" />',
);

export const iconoRecargar = svg(
  '<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />',
);

export const iconoCalificar = svg(
  '<rect x="3.75" y="3.75" width="16.5" height="16.5" rx="3" stroke-linecap="round" stroke-linejoin="round" /><path stroke-linecap="round" stroke-linejoin="round" d="M8 12.5l2.5 2.5L16.5 8.5" />',
);

export const iconoInfo = svg(
  '<path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />',
);

export const iconoCerrar = svg('<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />');

export const iconoAltavoz = svg(
  '<path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.5a.75.75 0 0 1-.75-.75V9a.75.75 0 0 1 .75-.75h2.25Z" />',
);

export const iconoAlumno = svg(
  '<path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />',
);

export const iconoDetener = svg(
  '<rect x="7" y="7" width="10" height="10" rx="1.5" stroke-linecap="round" stroke-linejoin="round" />',
);

// Versiones de 16px para intercalar dentro de un párrafo (texto instructivo del panel de Ayudas).
export const iconoCalificarEnLinea = enLinea(iconoCalificar);
export const iconoRecargarEnLinea = enLinea(iconoRecargar);
export const iconoImprimirEnLinea = enLinea(iconoImprimir);
