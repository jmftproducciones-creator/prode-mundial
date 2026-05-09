# Comandos VPS

Ejecutar en el VPS despues de subir la carpeta `vps_prode_global`.

```bash
cd /ruta/donde/subiste/vps_prode_global
npm install
node --check server.js
node --check app.js
```

Si usas PM2:

```bash
pm2 start server.js --name prode-global
pm2 save
```

Si ya existia:

```bash
pm2 restart prode-global
```

Probar internamente:

```bash
curl -I http://127.0.0.1:3010/prode/global/
curl http://127.0.0.1:3010/prode/global/api/templates
```

Agregar el bloque de `nginx-prode-global.conf` dentro del server actual de Nginx y validar:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Probar publico:

```bash
curl -I http://179.43.123.103/prode/global/
curl http://179.43.123.103/prode/global/api/templates
```

URLs:

```txt
http://179.43.123.103/prode/global/
http://179.43.123.103/prode/global/resultados
```
