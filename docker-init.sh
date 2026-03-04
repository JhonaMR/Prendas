#!/bin/bash

# 🐳 Script de Inicialización Docker - Proyecto Prendas (Multi-Instancia)
# Este script configura y levanta el proyecto en Docker con Plow y Melas

set -e

echo "🐳 Inicializando Proyecto Prendas con Docker (Plow + Melas)..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado. Por favor instala Docker Desktop.${NC}"
    exit 1
fi

# Verificar que Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker y Docker Compose detectados${NC}"
echo ""

# Crear carpetas de backups si no existen
echo -e "${YELLOW}📁 Creando carpetas de backups...${NC}"
mkdir -p backend/backups/plow/images
mkdir -p backend/backups/melas/images
echo -e "${GREEN}✓ Carpetas de backups creadas${NC}"
echo ""

# Verificar archivos .env
echo -e "${YELLOW}🔐 Verificando configuración de instancias...${NC}"

if [ ! -f ".env.prendas" ]; then
    echo -e "${RED}❌ Archivo .env.prendas no encontrado${NC}"
    exit 1
fi

if [ ! -f ".env.melas" ]; then
    echo -e "${RED}❌ Archivo .env.melas no encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✓ .env.prendas encontrado (Plow)${NC}"
echo -e "${GREEN}✓ .env.melas encontrado (Melas)${NC}"
echo ""

echo -e "${YELLOW}🔨 Construyendo imágenes Docker...${NC}"
docker-compose build

echo ""
echo -e "${YELLOW}🚀 Levantando servicios...${NC}"
docker-compose up -d

echo ""
echo -e "${YELLOW}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 15

# Verificar que los servicios están corriendo
echo ""
echo -e "${YELLOW}🔍 Verificando estado de los servicios...${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}✅ ¡Proyecto iniciado correctamente!${NC}"
echo ""
echo -e "${BLUE}📍 ACCESO A LAS APLICACIONES:${NC}"
echo ""
echo -e "${YELLOW}PLOW (Instancia 1):${NC}"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000/api"
echo "   Health:   http://localhost:3000/api/health"
echo ""
echo -e "${YELLOW}MELAS (Instancia 2):${NC}"
echo "   Frontend: http://localhost:5174"
echo "   Backend:  http://localhost:3001/api"
echo "   Health:   http://localhost:3001/api/health"
echo ""
echo -e "${BLUE}📋 COMANDOS ÚTILES:${NC}"
echo ""
echo "Ver logs:"
echo "   docker-compose logs -f                    # Todos"
echo "   docker-compose logs -f plow-backend       # Solo Plow backend"
echo "   docker-compose logs -f melas-frontend     # Solo Melas frontend"
echo ""
echo "Gestión de servicios:"
echo "   docker-compose ps                         # Ver estado"
echo "   docker-compose restart                    # Reiniciar todo"
echo "   docker-compose down                       # Detener todo"
echo ""
echo "Backups:"
echo "   docker-compose exec plow-backend npm run backup:manual   # Backup Plow"
echo "   docker-compose exec melas-backend npm run backup:manual  # Backup Melas"
echo ""
echo "Base de datos:"
echo "   docker-compose exec postgres psql -U postgres -d inventory_plow"
echo "   docker-compose exec postgres psql -U postgres -d inventory_melas"
echo ""
echo -e "${BLUE}📖 DOCUMENTACIÓN:${NC}"
echo "   Lee: DOCKER_MULTI_INSTANCE.md"
echo ""
