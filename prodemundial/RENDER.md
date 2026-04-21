# Publicar en Render

## Opcion rapida desde GitHub

1. Subi la carpeta `prodemundial` a un repositorio de GitHub.
2. En Render, elegi **New +** y despues **Web Service**.
3. Conecta el repositorio.
4. Configura:
   - **Root Directory**: `prodemundial` si el repo contiene varias carpetas.
   - **Runtime**: Node.
   - **Build Command**: `npm install`.
   - **Start Command**: `npm start`.
   - **Health Check Path**: `/healthz`.
5. Publica el servicio.

## Variables recomendadas

La app funciona sin variables extra usando el JSON local.

Para resultados en vivo con WorldCupAPI:

```bash
LIVE_RESULTS_PROVIDER=worldcupapi
WORLDCUP_API_KEY=tu_api_key
```

Para TheSportsDB:

```bash
LIVE_RESULTS_PROVIDER=thesportsdb
THESPORTSDB_API_KEY=123
THESPORTSDB_LEAGUE_FILTER=World Cup
```

Para envio real de correo:

```bash
SMTP_HOST=smtp.tu-proveedor.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=tu_usuario
SMTP_PASS=tu_password
MAIL_FROM=Prode Mundial <tu_usuario@dominio.com>
```

## Notas

- En el plan gratis de Render el servicio puede dormir cuando no se usa.
- Si no configuras SMTP, el boton de correo descarga el PDF y abre el cliente de email del usuario.
- Si una API de resultados falla, el servidor responde con `data/live-results.json`.
