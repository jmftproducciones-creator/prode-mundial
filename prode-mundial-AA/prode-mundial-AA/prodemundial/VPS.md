# Despliegue en VPS

## Requisitos

- Node.js 18 o superior.
- Git.
- Un reverse proxy como Nginx si queres usar dominio y HTTPS.

## Clonar e instalar

```bash
git clone URL_DEL_REPO
cd prode-mundial-AA/prodemundial
npm install
```

Si el repo queda con una carpeta intermedia, entra a la carpeta donde esta `server.js`.

## Datos persistentes

Los prodes se guardan en JSON. En produccion conviene guardarlos fuera del repo:

```bash
sudo mkdir -p /var/lib/prode-mundial
sudo chown -R $USER:$USER /var/lib/prode-mundial
cp data/prode-store.example.json /var/lib/prode-mundial/prode-store.json
cp data/live-results.json /var/lib/prode-mundial/live-results.json
```

## Variables de entorno

Crea un archivo de entorno en el VPS:

```bash
sudo nano /etc/prode-mundial.env
```

Contenido minimo:

```bash
PORT=3000
NODE_ENV=production
APIFOOTBALL_KEY=tu_api_key
DATA_DIR=/var/lib/prode-mundial
CLAUSURA_ACTIVE_ROUND=17
LIVE_RESULTS_PROVIDER=local
```

Cuando avance la fecha del Clausura, cambia `CLAUSURA_ACTIVE_ROUND` a la jornada abierta.

## Probar manualmente

```bash
set -a
. /etc/prode-mundial.env
set +a
npm start
```

Abrir:

```txt
http://IP_DEL_VPS:3000
```

## Servicio systemd

Crear el servicio:

```bash
sudo nano /etc/systemd/system/prode-mundial.service
```

Contenido:

```ini
[Unit]
Description=Prode Mundial
After=network.target

[Service]
Type=simple
WorkingDirectory=/ruta/al/repo/prodemundial
EnvironmentFile=/etc/prode-mundial.env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Activar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now prode-mundial
sudo systemctl status prode-mundial
```

Ver logs:

```bash
journalctl -u prode-mundial -f
```

## Nginx basico

```nginx
server {
    server_name tu-dominio.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Despues podes activar HTTPS con Certbot.

## Importante antes de subir a Git

No subas:

- `config.json`
- `.env`
- `data/prode-store.json`
- logs
- `node_modules`

Ya estan en `.gitignore`. Si alguno ya estaba trackeado por Git, sacalo del index sin borrarlo localmente:

```bash
git rm --cached config.json data/prode-store.json
```
