# Script para restaurar la base de datos PostgreSQL desde el backup
# Uso: .\restore-database.ps1

# Configuración
$backupFile = "backend/backups/inventory-backup-2026-02-18.sql"
$cleanedBackupFile = "backend/backups/inventory-backup-cleaned.sql"
$dbHost = "localhost"
$dbPort = "5433"
$dbUser = "postgres"
$dbName = "inventory"

Write-Host "🔧 Iniciando proceso de restauración de base de datos..." -ForegroundColor Cyan

# Paso 1: Limpiar el backup (remover línea corrupta)
Write-Host "`n📝 Paso 1: Limpiando el archivo de backup..." -ForegroundColor Yellow
if (Test-Path $backupFile) {
    $content = Get-Content $backupFile -Raw
    # Remover la línea corrupta que comienza con \restrict
    $cleaned = $content -replace '\\restrict.*?\n', ''
    Set-Content -Path $cleanedBackupFile -Value $cleaned -Encoding UTF8
    Write-Host "✅ Backup limpiado exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ No se encontró el archivo de backup: $backupFile" -ForegroundColor Red
    exit 1
}

# Paso 2: Verificar conexión a PostgreSQL
Write-Host "`n🔌 Paso 2: Verificando conexión a PostgreSQL..." -ForegroundColor Yellow
try {
    $env:PGPASSWORD = Read-Host "Ingresa la contraseña de PostgreSQL"
    psql -U $dbUser -h $dbHost -p $dbPort -c "SELECT 1" | Out-Null
    Write-Host "✅ Conexión exitosa a PostgreSQL" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al conectar a PostgreSQL: $_" -ForegroundColor Red
    exit 1
}

# Paso 3: Crear la base de datos si no existe
Write-Host "`n🗄️  Paso 3: Creando base de datos '$dbName'..." -ForegroundColor Yellow
try {
    psql -U $dbUser -h $dbHost -p $dbPort -c "CREATE DATABASE $dbName;" 2>&1 | ForEach-Object {
        if ($_ -like "*already exists*") {
            Write-Host "⚠️  La base de datos ya existe, continuando..." -ForegroundColor Yellow
        } elseif ($_ -like "*ERROR*") {
            Write-Host "❌ Error: $_" -ForegroundColor Red
        }
    }
    Write-Host "✅ Base de datos lista" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al crear base de datos: $_" -ForegroundColor Red
}

# Paso 4: Restaurar el backup
Write-Host "`n📥 Paso 4: Restaurando datos desde el backup..." -ForegroundColor Yellow
try {
    Get-Content $cleanedBackupFile | psql -U $dbUser -h $dbHost -p $dbPort -d $dbName
    Write-Host "✅ Backup restaurado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al restaurar backup: $_" -ForegroundColor Red
    exit 1
}

# Paso 5: Verificar que las tablas se crearon
Write-Host "`n✔️  Paso 5: Verificando tablas creadas..." -ForegroundColor Yellow
$tables = psql -U $dbUser -h $dbHost -p $dbPort -d $dbName -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"
Write-Host "📊 Total de tablas: $tables" -ForegroundColor Cyan

Write-Host "`n✅ ¡Restauración completada exitosamente!" -ForegroundColor Green
Write-Host "Puedes comenzar a trabajar con la base de datos." -ForegroundColor Green

# Limpiar variable de contraseña
Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
