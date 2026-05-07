# Paquete para Git y VPS

Esta carpeta tiene dos proyectos separados para subir a GitHub o al VPS.

## Carpetas

- `prode_mundial/`: sistema del Prode Mundial multiempresa.
- `pagina_web/`: web institucional estatica de NBF Soft.

## Recomendacion de deploy

Opcion simple con subdominios:

- `https://nbfsoft.com/` -> contenido de `pagina_web/`
- `https://prode.nbfsoft.com/` -> app Node de `prode_mundial/`

El Prode necesita Node.js y PM2. La web institucional puede servirse como sitio estatico con Nginx.

## Importante

El paquete del Prode incluye `data/live-results.json`, pero no copia `data/prode-store.json` para evitar subir datos reales de participantes.
