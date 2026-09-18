# Espacio × Tiempo

Visualizador web 3D que convierte un clip de video en un volumen temporal: cada fotograma se coloca a una altura distinta y el eje vertical representa el tiempo.

## Archivos

- `index.html` — interfaz.
- `style.css` — diseño.
- `app.js` — Three.js, captura de fotogramas, modos de render y deformación.

## Novedades de esta versión

- Modo **Rebanadas**: capas semitransparentes con el fotograma actual casi sólido.
- Modo **Sólido**: cada fotograma tiene grosor temporal; los laterales muestran los bordes de los fotogramas apilados para que el volumen siga siendo visible de perfil.
- El fotograma de `0.0 s` ya aparece visible desde el inicio.
- Brillo del video ajustable entre 50 % y 220 %.
- Cuadrícula 3D con interruptor y opacidad ajustable de 0 % a 100 %.
- Hasta 160 rebanadas para un perfil temporal más suave.
- Mayor subdivisión geométrica para que la deformación alrededor de la esfera sea más limpia.

## GitHub Pages

Sube `index.html`, `style.css` y `app.js` juntos a la raíz del repositorio. En GitHub Pages usa la rama `main` y la carpeta `/(root)`.

La página carga Three.js desde jsDelivr, por lo que necesita conexión a internet para iniciar.
