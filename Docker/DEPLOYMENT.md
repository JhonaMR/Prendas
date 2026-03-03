# 🚀 Guía de Despliegue - Proyecto Prendas

## Despliegue en Servidor Linux

### 1. Preparar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Agregar usuario actual al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Instalar Nginx
sudo apt install -y nginx

# Instalar Certbot para SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Clonar Proyecto

```bash
# Crear directorio
mkdir -p /opt/prendas
cd /opt/prendas

# Clonar repositorio
git clone <tu-repositorio> .

# O descargar ZIP y extraer
```

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp backend/.env.example backend/.env

# Editar con valores de producción
nano backend/.env
```

Valores importantes para producción:

```env
NODE_ENV=production
JWT_SECRET=<generar-con-node>
DB_PASSWORD=<contraseña-fuerte>
CORS_ORIGIN=https://tu-dominio.com,https://www.tu-dominio.com
DB_SSL=true
LOG_LEVEL=warn
```

Generar JWT_SECRET seguro:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Configurar Nginx

```bash
# Copiar configuración de ejemplo
sudo cp nginx.conf.example /etc/nginx/sites-available/prendas

# Editar con tu dominio
sudo nano /etc/nginx/sites-available/prendas

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/prendas /etc/nginx/sites-enabled/

# Deshabilitar sitio por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

### 5. Obtener Certificado SSL

```bash
# Obtener certificado Let's Encrypt
sudo certbot certonly --nginx -d tu-dominio.com -d www.tu-dominio.com

# Renovación automática (ya está configurada)
sudo systemctl enable certbot.timer
```

### 6. Levantar Servicios

```bash
# Usar configuración de producción
docker-compose -f docker-compose.prod.yml up -d

# Verificar estado
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 7. Verificar Funcionamiento

```bash
# Health check
curl http://localhost:3000/api/health

# Acceder a la aplicación
# https://tu-dominio.com
```

## Mantenimiento

### Backups Automáticos

```bash
# Crear script de backup
sudo nano /usr/local/bin/prendas-backup.sh
```

```bash
#!/bin/bash
cd /opt/prendas
BACKUP_DIR="./backups/daily"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres inventory | gzip > "$BACKUP_DIR/inventory-$TIMESTAMP.sql.gz"
# Mantener solo últimos 30 días
find "$BACKUP_DIR" -name "inventory-*.sql.gz" -mtime +30 -delete
```

```bash
# Hacer ejecutable
sudo chmod +x /usr/local/bin/prendas-backup.sh

# Agregar a crontab (backup diario a las 2 AM)
sudo crontab -e
```

Agregar línea:

```
0 2 * * * /usr/local/bin/prendas-backup.sh
```

### Monitoreo

```bash
# Ver uso de recursos
docker stats

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Logs específicos
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Actualizaciones

```bash
# Actualizar código
cd /opt/prendas
git pull origin main

# Reconstruir imágenes
docker-compose -f docker-compose.prod.yml build

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart

# Verificar
docker-compose -f docker-compose.prod.yml ps
```

## Troubleshooting

### Nginx no redirige a HTTPS

```bash
# Verificar configuración
sudo nginx -t

# Recargar
sudo systemctl reload nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log
```

### Base de datos no conecta

```bash
# Ver logs de PostgreSQL
docker-compose -f docker-compose.prod.yml logs postgres

# Reiniciar
docker-compose -f docker-compose.prod.yml restart postgres

# Verificar conexión
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres
```

### Certificado SSL expira

```bash
# Renovar manualmente
sudo certbot renew

# Recargar Nginx
sudo systemctl reload nginx
```

## Seguridad

### Firewall

```bash
# Instalar UFW
sudo apt install -y ufw

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Habilitar firewall
sudo ufw enable
```

### Actualizaciones de Seguridad

```bash
# Actualizar sistema regularmente
sudo apt update && sudo apt upgrade -y

# Actualizar imágenes Docker
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Backups Remotos

```bash
# Copiar backup a servidor remoto
scp backup.sql usuario@servidor-remoto:/backups/

# O usar rsync
rsync -avz ./backups/ usuario@servidor-remoto:/backups/prendas/
```

## Monitoreo Avanzado

### Instalar Portainer (Interfaz Web para Docker)

```bash
docker run -d -p 8000:8000 -p 9000:9000 \
  --name=portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

Acceder a: http://localhost:9000

### Logs Centralizados

```bash
# Instalar ELK Stack (Elasticsearch, Logstash, Kibana)
# O usar servicios como Datadog, New Relic, etc.
```

## Escalado

### Múltiples Instancias del Backend

```yaml
# En docker-compose.prod.yml
backend:
  deploy:
    replicas: 3
```

### Load Balancer

Usar Nginx como load balancer:

```nginx
upstream backend {
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;
}
```

## Checklist de Despliegue

- [ ] Docker instalado en servidor
- [ ] Repositorio clonado
- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET generado y único
- [ ] DB_PASSWORD fuerte
- [ ] Nginx configurado
- [ ] Certificado SSL obtenido
- [ ] Servicios levantados
- [ ] Health check pasando
- [ ] Backups configurados
- [ ] Firewall habilitado
- [ ] Monitoreo configurado
- [ ] Dominio apuntando al servidor

---

**¡Listo para producción!** 🚀
