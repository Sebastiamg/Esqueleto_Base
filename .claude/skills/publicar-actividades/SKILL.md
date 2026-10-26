---
name: publicar-actividades
description: Registra y publica las actividades HTML de los libros digitales de Prolipa (Sinapsis y otros) con el programa Publicador — Excel de control (control_publicacion.xlsx), íconos-enlace en el proyecto de Flip PDF Professional (.flb), publicación en la carpeta compartida con main.js y Ejecutar_Config.bat, y registro en la plataforma por API (GET de libros y temas, POST registroActividadPublico). Úsala cuando pidan registrar, publicar o subir las actividades de un libro, generar sus enlaces o el menú, poner íconos en Flip, o revisar y corregir estados del Excel de control. No sirve para construir las actividades en sí (eso lo cubre GUIA_GENERAL.md).
---

# Registrar y publicar las actividades de un libro

Esta skill son instrucciones para Claude: no ejecuta nada por sí sola ni maneja
programas. El trabajo lo hace el programa **Publicador**: Claude lo usa por línea
de comandos (Bash) y el usuario, por su ventana (`Publicador.exe`). Las reglas
completas (Excel, estados, páginas, URL, Flip, API) están en
[referencia.md](referencia.md), copia de la sección "Publicación" de
`GUIA_GENERAL.md`. Léela antes de interpretar un estado o corregir datos.

## Requisitos externos (no los trae la skill)

| Requisito | Dónde | Para qué |
|---|---|---|
| Programa Publicador | `C:\Users\PROLIPA\Desktop\Funciones\Publicador` (`dist\Publicador.exe`) | Todo el proceso |
| Python 3 con `openpyxl`, `Pillow` y `pywin32` | `requirements.txt` del Publicador | Solo los comandos; el `.exe` ya los incluye |
| Node.js y `scripts/registro.mjs` en el repo del libro | Repo del libro (`npm run registro`) | Leer las actividades del código. Si falta, instalarlo como dice `GUIA_GENERAL.md` → "Instalar el script" (copia de `C:\Users\PROLIPA\Desktop\Funciones\Esqueleto_Base\scripts\registro.mjs`, línea `"registro"` en `package.json`, `typescript` en devDependencies); si ya existe, no se toca |
| Flip PDF Professional 2.4.x en español | `C:\Program Files (x86)\Flip PDF Professional\` | Publicar el libro |
| Acceso a `\\jreyes\DepartamentoC_Compartida` | Credenciales de Windows del usuario | Publicar y leer el `main.js` modelo |
| Conexión a `server1.prolipadigital.com.ec` | Red | API de la plataforma |
| `id_usuario` de quien registra | Lo da el usuario | Campo del POST |

Si falta alguno, decirlo y detenerse en ese paso; no improvisar sustitutos.

## Procedimiento

Comandos desde `C:\Users\PROLIPA\Desktop\Funciones\Publicador`, con la forma
`python -m publicador <acción> "<repo del libro>"`:

1. `importar`: corre `npm run registro` y crea o actualiza
   `control_publicacion.xlsx` en la raíz del repo. Mostrar al usuario los avisos `!`.
2. Completar Config con `config "<repo>" <parámetro> <valor>`: `carpeta`
   (ej. `SinapsisLengua9_V2`), `ruta_flb` e `id_usuario` (siempre el que diga
   el usuario). Después volver a `importar` para que se calculen las URL.
3. `libro "<repo>" --nombre "<nombre>"`. Si responde con varias opciones,
   preguntar al usuario cuál es y usar `--id N`.
4. `temas "<repo>"`. Informar los REVISAR y TEMA_NO_EXISTE con su observación.
5. `flip "<repo>"`: genera `<proyecto>_PUBLICADOR.flb` y `revision_flip/`.
   Mirar algunas imágenes de `revision_flip/` y pedir al usuario que abra la
   copia en Flip antes de publicar.
6. `publicar "<repo>"` muestra el plan. Mostrar la carpeta de destino al
   usuario y solo con su confirmación ejecutar `publicar "<repo>" --confirmar`.
7. `plataforma "<repo>"` simula. Mostrar los cuerpos que se enviarían y solo
   con su confirmación ejecutar `plataforma "<repo>" --enviar` (para una prueba
   controlada: `--solo <archivo>` o `--max N`).
8. Recordar los pasos manuales: dejar la copia `_PUBLICADOR.flb` como proyecto
   oficial, copiar `dist/` a `animaciones/` de la carpeta compartida y avisar al
   compañero que sube los archivos al servidor.

## Reglas que no se negocian

- Ningún POST real ni publicación en la carpeta compartida sin mostrar antes la
  simulación o el plan y recibir un "sí" explícito del usuario en el chat. Una
  aprobación vale para ese envío o esa publicación, no para los siguientes.
- Nunca reenviar un registro OK, INCIERTO o con `id_item`: el backend acepta
  duplicados y no hay forma de borrarlos desde aquí.
- Nunca registrar libros PLUS, crear temas, ni elegir libro o tema "por
  parecido": ante la duda, dejarlo en REVISAR y preguntar.
- Nunca modificar el `.flb` original ni `Ejecutar_Config.bat`.
- Si Flip ya está abierto, pedir que lo cierren antes de `publicar --confirmar`.
- El Excel de control debe estar cerrado al correr comandos que escriben.
- La página es siempre la IMPRESA; el desfase a la página física lo calcula el
  programa.
- Anotar el `id_item` de cualquier registro de prueba: los borra backend.

## Si algo falla

Leer la observación de la fila (`flip_obs`, `plat_obs` en la hoja Registros) y
el Historial antes de reintentar, y seguir la tabla de estados de
[referencia.md](referencia.md). Si se cambia el código del Publicador, correr
sus pruebas (`python -m unittest discover -s tests`) y reconstruir el `.exe` con
`construir.bat`.
