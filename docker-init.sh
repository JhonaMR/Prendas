#!/bin/bash

# 🐳 Script de Inicialización Docker - Proyecto Prendas
# Este script configura y levanta el proyecto en Docker

set -e

echo "🐳 Inicializando Proyecto Prendas con Docker..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Crear archivo .env si no existe
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}📝 Creando backend/.env...${NC}"
    cp backend/.env.example backend/.env
    
    # Generar JWT_SECRET seguro
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    # Reemplazar en el archivo
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/tu_secreto_super_seguro_cambialo_123456/$JWT_SECRET/" backend/.env
    else
        # Linux
        sed -i "s/tu_secreto_super_seguro_cambialo_123456/$JWT_SECRET/" backend/.env
    fi
    
    echo -e "${GREEN}✓ backend/.env creado con JWT_SECRET seguro${NC}"
else
    echo -e "${GREEN}✓ backend/.env ya existe${NC}"
fi

echo ""
echo -e "${YELLOW}🔨 Construyendo imágenes Docker...${NC}"
docker-compose build

echo ""
echo -e "${YELLOW}🚀 Levantando servicios...${NC}"
docker-compose up -d

echo ""
echo -e "${YELLOW}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 10

# Verificar que los servicios están corriendo
echo ""
echo -e "${YELLOW}🔍 Verificando estado de los servicios...${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}✅ ¡Proyecto iniciado correctamente!${NC}"
echo ""
echo "📍 Acceso a la aplicación:"
echo "   Frontend: http://localhost:3001"
echo "   Backend:  http://localhost:3000/api"
echo "   Health:   http://localhost:3000/api/health"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs:        docker-compose logs -f"
echo "   Detener:         docker-compose down"
echo "   Reiniciar:       docker-compose restart"
echo "   Acceder a BD:    docker-compose exec postgres psql -U postgres -d inventory"
echo ""
echo "📖 Para más información, lee DOCKER_SETUP.md"
echo ""
