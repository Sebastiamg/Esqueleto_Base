export type EstiloLinea = 'continuo' | 'discontinuo' | 'punteado';

export interface ConectorConfig {
  /** Clases de Tailwind para el trazo, ej. 'stroke-violet-400'. */
  clase?: string;
  estilo?: EstiloLinea;
  /** Grosor en px. Por defecto 2. */
  grosor?: number;
  /** Círculo en el extremo que sale del nodo de origen. */
  marcadorInicio?: boolean;
  /** Círculo en el extremo que llega al nodo destino. */
  marcadorFin?: boolean;
  /** Palabra de enlace sobre la línea (ej. "es", "se divide en"). */
  etiqueta?: string;
  /** Clases de Tailwind del texto de la etiqueta (ej. 'fill-slate-600 text-sm'). */
  claseEtiqueta?: string;
}

/**
 * Preset visual de un nodo. 'libre' no aplica ningún preset: todo el aspecto
 * sale de `clase`.
 */
export type TipoNodo = 'raiz' | 'rama' | 'hoja' | 'nota' | 'tarjeta' | 'libre';

export interface NodoMapa {
  /** Texto del nodo (admite HTML). En 'tarjeta' es el cuerpo. */
  texto?: string;
  /** Solo 'tarjeta': encabezado de color (admite HTML). */
  titulo?: string;
  tipo?: TipoNodo;
  /** Clases de Tailwind que se suman al preset del tipo. */
  clase?: string;
  /** Solo 'tarjeta': clases del encabezado. */
  claseTitulo?: string;
  /** Solo 'tarjeta': clases del cuerpo. */
  claseTexto?: string;
  /** HTML a la izquierda del texto (un <svg>, un emoji, un <span> con clases…). */
  icono?: string;
  /** URL de una imagen a la izquierda del texto. */
  imagen?: string;
  imagenAlt?: string;
  /** Fuerza el paso de la presentación en el que aparece (0 = desde el inicio). */
  paso?: number;
  /** Línea que llega a este nodo (pisa `conectorHijos` del padre). */
  conector?: ConectorConfig;
  /** Línea por defecto hacia todos los hijos, la nota y el nodo de convergencia. */
  conectorHijos?: ConectorConfig;
  hijos?: NodoMapa[];
  /** Nodo que cuelga debajo de este, conectado con un codo. */
  nota?: NodoMapa;
  /** Nodo a la derecha de los hijos, conectado desde cada uno (ej. una característica común). */
  converge?: NodoMapa;
}

export interface DatosOrganizador {
  raiz: NodoMapa;
  /**
   * 'auto' (por defecto): horizontal si cabe; si no, esquema vertical.
   * 'siempre' / 'nunca' fuerzan el modo compacto.
   */
  compacto?: 'auto' | 'siempre' | 'nunca';
  /** Muestra los botones de presentación. Por defecto true. */
  controles?: boolean;
  /** Paso inicial (por defecto 0: solo la raíz). */
  pasoInicial?: number;
  /** Se llama cada vez que cambia el paso (útil para sincronizar narración, etc.). */
  alCambiarPaso?: (paso: number, total: number) => void;
}

export interface Organizador {
  readonly paso: number;
  readonly totalPasos: number;
  siguiente(): void;
  anterior(): void;
  reiniciar(): void;
  irAPaso(paso: number): void;
  mostrarTodo(): void;
  destruir(): void;
}
