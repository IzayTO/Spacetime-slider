# Espacio × Tiempo

Visualizador 3D de un clip de video como volumen temporal.

## V7
- Al seleccionar un video desde el selector del sistema, se abre automáticamente un editor de recorte sencillo antes de procesarlo.
- El botón ✓ acepta la selección actual. Por defecto toma hasta 10 segundos desde el inicio.
- El mismo editor de recorte sigue disponible después dentro del panel de opciones para volver a ajustar el clip durante la sesión.
- Autoalinear, presets 2/4/5/6/8/10 s y ajuste libre continúan disponibles.

La visualización de curvatura es una metáfora pedagógica, no una solución numérica de relatividad general.

## V8 — rendimiento y editor de recorte
- Mientras se extraen los fotogramas, la escena 3D se oculta y el render WebGL se pausa. Sólo se actualiza el indicador de progreso y el volumen aparece de golpe al terminar.
- El panel principal se organizó en secciones plegables para reducir ruido visual. Esto es principalmente una mejora de interfaz; la ganancia de rendimiento real viene de pausar el render 3D durante el procesamiento.
- En el editor de recorte, al mover inicio/fin la vista previa del video sigue el tirador. El seek está limitado en frecuencia para no saturar Safari/iPhone.
- El recorte sigue admitiendo como máximo 10 s y conserva Autoalinear y presets.
