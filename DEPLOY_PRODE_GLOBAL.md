# Deploy VPS - Prode Global

Esta carpeta esta preparada para publicarse en:

```txt
http://179.43.123.103/prode/global
```

La carga privada de resultados queda en:

```txt
http://179.43.123.103/prode/global/resultados
```

## Variables

No subas secretos reales a GitHub publico. En el VPS crea un archivo `.env` copiando `.env.vps.example` y reemplazando:

- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `SMTP_PASS`
- `RESULTS_ADMIN_PASSWORD`

## Mercado Pago

Configura el webhook en Mercado Pago:

```txt
http://179.43.123.103/prode/global/api/mercadopago-webhook?secret=TU_SECRET
```

Con credenciales de prueba podes probar:

- crear preferencia de pago desde el flujo normal;
- redireccion al Checkout Pro;
- pago aprobado con tarjeta de prueba;
- webhook marcando el pago como aprobado;
- guardar el primer prode solo despues del pago.

## Arranque

```bash
npm start
```

La app corre por defecto en el puerto interno `3010` para no pisar otros servicios.

Si usas Nginx como reverse proxy, agrega una regla parecida a esta dentro del server de `179.43.123.103`:

```nginx
location /prode/global/ {
  proxy_pass http://127.0.0.1:3010/prode/global/;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

No reemplaces la config existente: agrega solo este bloque.
