# Prode Mundial 2026

Esta carpeta esta preparada como version **solo global**. No crea ni usa las versiones de empresa `sur`, `norte` o `acme`; los datos se guardan en `sistema_global/data/prode-store.json`.

Web para pronosticar grupos y cruces del Mundial 2026, guardar prodes por torneo y mostrar leaderboards globales o privados.

## Carga manual de resultados reales

Para que una persona cargue los resultados que calculan el leaderboard sin tocar JSON ni endpoints, entra a:

```txt
http://179.43.123.103/prode/global/resultados
```

La pantalla pide la contraseña `RESULTS_ADMIN_PASSWORD` y despues muestra el formulario visual de resultados reales. Si no configuras la variable, la contraseña local por defecto es:

```txt
resultados2026
```

En produccion cambiala en `.env`:

```bash
RESULTS_ADMIN_PASSWORD=una-clave-tuya
```

## Uso local

```bash
npm start
```

Despues abri:

```txt
http://179.43.123.103/prode/global
```

## Funciones

- Completar nombre y email del jugador.
- Ordenar los 12 grupos.
- Elegir ganadores de los cruces hasta la final.
- Adivinar marcadores para sumar puntos extra.
- Cerrar la carga de prodes con una fecha limite configurable.
- Ver una pestana de resultados en vivo desde `/api/live-results`.
- Crear torneos privados separados del ranking global.
- Elegir plantilla del torneo: Mundial 2026, Champions, Libertadores, Sudamericana, Liga Argentina y las 5 grandes ligas europeas.
- Crear una plantilla custom con equipos o jugadores propios, por ejemplo f5, padel, torneo de amigos o torneo interno de una cancha.
- Definir modo base del torneo: grupos + cruces, fixture o liga.
- Configurar reglas de puntaje por torneo.
- Ver leaderboard por torneo.
- Guardar prodes y respuestas en `data/prode-store.json`.
- Descargar un PDF como comprobante opcional.
- Enviar el PDF por correo si SMTP esta configurado.
- Cargar resultados reales del torneo desde el leaderboard.
- Guardar pronosticos por fecha/ronda y continuar con un link privado.

## Puntaje

- 1 punto por cada posicion exacta en fase de grupos.
- 3 puntos por cada ganador acertado en cruces.
- 2 puntos extra por cada marcador exacto.
- 10 puntos extra por acertar el campeon.

Estos valores son los predeterminados. Al crear un torneo privado se pueden cambiar desde la pagina.

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

Si no configuras SMTP, el boton de correo descarga el comprobante PDF y abre el cliente de email del usuario. Los avisos automaticos para continuar la proxima fecha tambien necesitan SMTP.

## Pronostico por fecha

El selector **Fecha a pronosticar** permite guardar una etapa puntual:

- Fecha 1: fase de grupos.
- Fecha 2: fase de grupos.
- Fecha 3: fase de grupos.
- 16avos.
- 8avos.
- 4tos.
- Semis.
- Final.
- 3er puesto.

En las fechas de grupos se muestran solo los 24 partidos de esa jornada. Al guardar, el usuario no ve un link en pantalla: cuando el administrador carga resultados reales desde `/prode/global/resultados`, el sistema envia por email el link privado `/prode/global/continuar/...` de la proxima fecha. Cuando el administrador carga resultados reales, las rondas eliminatorias se arman con esos cruces reales.

Para mandar recordatorios automaticos un dia antes de una fase, configura un cron externo que llame:

```txt
POST /api/send-phase-reminders?secret=tu_secreto
```

Variables de entorno:

```bash
REMINDER_SECRET=tu_secreto
PUBLIC_BASE_URL=http://179.43.123.103/prode/global
APP_BASE_PATH=/prode/global
PRODE_PHASE_SCHEDULE=[{"id":"group2","startAt":"2026-06-17T12:00:00-03:00"},{"id":"r32","startAt":"2026-06-28T12:00:00-03:00"}]
```

`PRODE_PHASE_SCHEDULE` acepta los ids `group1`, `group2`, `group3`, `r32`, `r16`, `qf`, `sf`, `final` y `third`. El endpoint envia correo solo si SMTP esta configurado.

## Pago Mercado Pago global

En esta version global, el primer pronostico de cada email puede exigir pago con Checkout Pro. Luego ese usuario puede continuar y guardar nuevas fechas sin volver a pagar.

Configura la integracion con:

```bash
PAYMENT_REQUIRED_GLOBAL=true
PAYMENT_AMOUNT_GLOBAL=1
PAYMENT_TITLE_GLOBAL=Inscripcion Prode Mundial
PAYMENT_CURRENCY_GLOBAL=ARS
MERCADOPAGO_ACCESS_TOKEN=APP_USR...
MERCADOPAGO_WEBHOOK_SECRET=un-secreto-largo
PUBLIC_BASE_URL=http://179.43.123.103/prode/global
APP_BASE_PATH=/prode/global
```

Si estas probando con el `.env` viejo de ACME, esta version global tambien acepta `PAYMENT_AMOUNT_ACME`, `PAYMENT_TITLE_ACME` y `PAYMENT_CURRENCY_ACME` como fallback.

Flujo:

- El frontend llama `POST /api/create-payment`.
- El servidor crea una preferencia en Mercado Pago con `external_reference`.
- Mercado Pago redirige al usuario al checkout.
- Mercado Pago notifica `POST /api/mercadopago-webhook`.
- El servidor consulta `/v1/payments/{id}` y marca el pago como `approved`.

En Mercado Pago Developers, configura tambien la URL de notificacion:

```txt
https://tu-dominio.com/api/mercadopago-webhook?secret=un-secreto-largo
```

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

Tambien podes cargar resultados en vivo manualmente sobre ese JSON local:

```txt
POST /api/live-results?secret=tu_secreto
```

```json
{
  "source": "Carga manual",
  "matches": [
    {
      "id": "A-0-1",
      "date": "2026-06-11",
      "stage": "Fecha 1 - Grupos",
      "group": "A",
      "home": "Mexico",
      "away": "Corea del Sur",
      "homeScore": 2,
      "awayScore": 1,
      "status": "finalizado"
    }
  ]
}
```

Configura `LIVE_RESULTS_SECRET` para proteger esa carga manual. Para recalcular rankings, usa el panel **Torneos > Cargar resultados**, que guarda los resultados reales del torneo aunque la API externa no funcione.

## Torneos y leaderboard

Los datos se guardan en:

```txt
data/prode-store.json
```

Ese archivo contiene:

- Torneos creados.
- Clave de cada torneo privado.
- Email del creador y clave interna de creador para administrar resultados.
- Plantilla, modo y reglas de puntaje de cada torneo.
- Prodes enviados por cada jugador.
- Resultados reales guardados para cada torneo.

El torneo `Global` existe siempre. Los torneos privados no afectan el leaderboard global.
Los torneos privados no aparecen en el listado publico: se muestran solo si el usuario se une con nombre exacto y clave.

Las plantillas de ligas/copas y las custom generan una planilla de partidos con selector de ganador/campeon, marcadores y puntos por aciertos. El Mundial mantiene su editor completo de grupos, mejores terceros y cruces.

Las planillas no Mundial generan un fixture simple con los equipos cargados. Mas adelante se puede reemplazar esa generacion automatica por calendarios reales importados desde una API o cargados desde una base de datos.

Nota para Render: si usas el plan gratis sin disco persistente, los archivos JSON pueden perderse al redeploy o reinicio del servicio. Para uso real conviene agregar un disco persistente de Render o migrar estos datos a una base de datos.

## Publicacion en Render

El proyecto ya incluye `render.yaml`, `npm start` y `/healthz`.

Los pasos detallados estan en `RENDER.md`.
