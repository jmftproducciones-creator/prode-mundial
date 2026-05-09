# Deploy en VPS

## 1. Requisitos

- Node.js 18 o superior.
- Un dominio o subdominio apuntando al VPS.
- Nginx como reverse proxy.
- PM2 para mantener el proceso vivo.

## 2. Subir archivos

Subi el proyecto completo al VPS, por ejemplo:

```bash
/var/www/prodemundial
```

Instala dependencias:

```bash
cd /var/www/prodemundial
npm install --omit=dev
```

## 3. Variables

Crea un archivo `.env` si queres cambiar rutas o puerto:

```bash
PORT=3000
DATA_DIR=/var/www/prodemundial/data
```

El sistema guarda torneos, resultados y participantes en `DATA_DIR/prode-store.json`.

## 4. PM2

Instala PM2:

```bash
npm install -g pm2
```

Inicia la app:

```bash
cd /var/www/prodemundial
PORT=3000 DATA_DIR=/var/www/prodemundial/data pm2 start server.js --name prodemundial
pm2 save
pm2 startup
```

Comandos utiles:

```bash
pm2 status
pm2 logs prodemundial
pm2 restart prodemundial
```

## 5. Nginx

Ejemplo de config:

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

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

Activa y recarga:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 6. Links de empresas

```text
https://tudominio.com/empresa/acme
https://tudominio.com/empresa/norte
https://tudominio.com/empresa/sur
```

Cada link usa su propio torneo/base dentro del mismo archivo de datos. Un pronostico cargado en `acme` no aparece en `norte` ni en la vista global.

## 7. Backup

El archivo importante para respaldar es:

```bash
/var/www/prodemundial/data/prode-store.json
```

Ejemplo:

```bash
cp /var/www/prodemundial/data/prode-store.json /var/backups/prode-store-$(date +%F).json
```
