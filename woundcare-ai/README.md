# WoundCare AI – Demo

## Requisitos
- macOS/Linux/Windows con Python 3.8+
- Navegador moderno (soporte ES Modules)

## Ejecutar
1. Abrir terminal en la carpeta del repo.
2. Iniciar servidor (sirve `public/`):
   ```bash
   python3 server.py
   ```
   Verás: `Serving public at http://localhost:9000`
3. Abrir en el navegador: `http://localhost:9000`

## Funcionalidades
- Modo oscuro, componentes HTML inyectados dinámicamente.
- Formulario de evaluación con sliders 0–5 (clicables en toda la pista).
- Carga de imágenes con previsualización y compresión.
- Botón “Rellenar Demo” para completar campos al azar.
- Recomendaciones con motor de productos (etiquetas/contraindicaciones) y tips de cuidado (incluye técnica de "crusting").

## Recomendaciones de Tratamiento
- Motor en `public/assets/js/recommendation.js`.
- Catalogo con `tags` (indicaciones) y `contraindications` para filtrar productos según evaluación: exudado (bajo/moderado/alto), dolor/olor/sangrado, infección, borde, riesgo de maceración, tejido.
- Ejemplos:
  - Hidrogel: contraindicado en `exudado-alto`.
  - Hidrocoloide: evitar en `infeccion-si` o `exudado-alto`.
  - Espuma superabsorbente: para `exudado-alto`/`maceracion-riesgo`.
- Técnica de "Crusting": sugerida cuando hay `maceracion-riesgo`.

## Desarrollo
- Código principal: `public/assets/js/main.js` y `ui.js`.
- Componentes HTML: `public/components/`.
- Estilos: Tailwind CDN + `public/assets/css/app.css`.

## Problemas comunes
- Pantalla en blanco: revisa consola; refresca con `Cmd+Shift+R`.
- Puerto ocupado: cierra procesos previos y reinicia.
- Componentes no cargan: revisa que el server se inició desde `server.py`.

## Exponer públicamente (opcional)
- Cloudflared:
  ```bash
  brew install cloudflare/cloudflare/cloudflared
  cloudflared tunnel --url http://localhost:9000
  ```
- Localtunnel:
  ```bash
  npx localtunnel --port 9000
  ```

