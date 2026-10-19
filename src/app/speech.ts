export interface ControlDeVoz {
  /** true si el navegador soporta lectura en voz alta (SpeechSynthesis). */
  soportado: boolean;
  iniciar(): void;
  detener(): void;
}

/** Lector de voz para el panel de Ayudas (botones Escuchar/Detener). */
export function crearControlDeVoz(texto: string): ControlDeVoz {
  const synth = window.speechSynthesis as SpeechSynthesis | undefined;
  if (!synth) {
    return { soportado: false, iniciar() {}, detener() {} };
  }

  let utterance: SpeechSynthesisUtterance | null = null;

  return {
    soportado: true,
    iniciar() {
      utterance = new SpeechSynthesisUtterance(texto);
      // Sin esto, el navegador elige la voz según el idioma del SISTEMA del
      // estudiante, no el del libro — en un dispositivo en inglés leería
      // (mal) el texto en español con una voz en inglés.
      utterance.lang = 'es-ES';
      synth.speak(utterance);
    },
    detener() {
      synth.cancel();
    },
  };
}
