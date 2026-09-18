# Espacio × Tiempo

Visualizador WebGL conceptual de un video como volumen de espacio-tiempo.

- X visual = tiempo, de abajo hacia arriba.
- Y/Z = las dos dimensiones espaciales del fotograma.
- El video se muestrea en rebanadas temporales y se empaqueta en un solo atlas de textura.
- Las rebanadas se dibujan mediante instancing para reducir draw calls.
- La esfera opcional deforma directamente la geometría de los fotogramas alrededor de un radio local. No usa líneas verdes para fingir la deformación.
- Cuadrícula 3D neutra, opcional y apagada por defecto.
- Rotar con un dedo/ratón; pellizcar para zoom; dos dedos para zoom + paneo.
- Barra inferior para avanzar y retroceder por el clip.

## Uso

Abre `index.html` desde un servidor estático (GitHub Pages, Live Server, `python -m http.server`, etc.).
Three.js se carga desde jsDelivr.

La deformación es pedagógica/intuitiva, no una solución numérica de las ecuaciones de Einstein.
