#!/bin/bash

# 🐳 Script de Backup - Proyecto Prendas
# Realiza backup de la base de datos y archivos importantes

set -e

BACKUP_DIR="./backups/docker-backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/inventory-backup-$TIMESTAMP.sql"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

echo "🔄 Iniciando backup de la base de datos..."
echo "📁 Ubicación: $BACKUP_FILE"

# Hacer backup de PostgreSQL
docker-compose exec -T postgres pg_dump -U postgres inventory > "$BACKUP_FILE"

# Comprimir el backup
gzip "$BACKUP_FILE"
BACKUP_FILE="$BACKUP_FILE.gz"

# Obtener tamaño del archivo
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo "✅ Backup completado exitosamente"
echo "📦 Tamaño: $SIZE"
echo "📁 Archivo: $BACKUP_FILE"

# Limpiar backups antiguos (mantener últimos 7 días)
echo ""
echo "🧹 Limpiando backups antiguos (más de 7 días)..."
find "$BACKUP_DIR" -name "inventory-backup-*.sql.gz" -mtime +7 -delete

echo "✅ Limpieza completada"
echo ""
echo "💡 Para restaurar este backup:"
echo "   gunzip $BACKUP_FILE"
echo "   docker-compose exec -T postgres psql -U postgres inventory < ${BACKUP_FILE%.gz}"
