# Prode Mundial 2026

Web para pronosticar grupos y cruces del Mundial 2026, generar un PDF del jugador y validar ese mismo PDF contra resultados reales cargados despues.

## Uso local

```bash
npm start
```

Despues abri:

```txt
http://localhost:3000
```

## Funciones

- Completar nombre y email del jugador.
- Ordenar los 12 grupos.
- Elegir ganadores de los cruces hasta la final.
- Adivinar marcadores para sumar puntos extra.
- Cerrar la carga de prodes con una fecha limite configurable.
- Ver una pestana de resultados en vivo desde `/api/live-results`.
- Descargar un PDF con el prode.
- Enviar el PDF por correo si SMTP esta configurado.
- Cargar resultados reales cuando avance el Mundial.
- Subir el PDF del jugador y calcular puntaje.

## Puntaje

- 1 punto por cada posicion exacta en fase de grupos.
- 3 puntos por cada ganador acertado en cruces.
- 2 puntos extra por cada marcador exacto.

## Fecha limite

La fecha limite se cambia en `app.js`, dentro de `APP_CONFIG.entryDeadline`.

Por defecto esta configurada en:

```js
entryDeadline: "2026-06-11T12:00:00-03:00"
```

Cuando pasa esa fecha, la seccion de pronosticos queda bloqueada y no permite generar nuevos PDFs.

## Correo

Para envio automatico real, configura SMTP:

```bash
SMTP_HOST=smtp.tu-proveedor.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=tu_usuario
SMTP_PASS=tu_password
MAIL_FROM=Prode Mundial <tu_usuario@dominio.com>
```

Si no configuras SMTP, el boton de correo descarga el PDF y abre el cliente de email del usuario.

## Resultados en vivo

La pestana **Resultados en vivo** lee `/api/live-results`.

Por defecto usa `data/live-results.json`. Para conectarla a WorldCupAPI:

```bash
LIVE_RESULTS_PROVIDER=worldcupapi
WORLDCUP_API_KEY=tu_api_key
npm start
```

Tambien se puede usar TheSportsDB:

```bash
LIVE_RESULTS_PROVIDER=thesportsdb
THESPORTSDB_API_KEY=123
THESPORTSDB_LEAGUE_FILTER=World Cup
npm start
```

Si la API falla, el servidor vuelve automaticamente al JSON local.

## Publicacion en Render

El proyecto ya incluye `render.yaml`, `npm start` y `/healthz`.

Los pasos detallados estan en `RENDER.md`.
