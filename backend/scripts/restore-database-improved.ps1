# Script mejorado para restaurar la base de datos PostgreSQL desde el backup
# Uso: .\restore-database-improved.ps1 -BackupFile "inventory-backup-2026-02-26-15-53-39.sql"

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupFile,
    
    [Parameter(Mandatory=$false)]
    [string]$DbHost = "localhost",
    
    [Parameter(Mandatory=$false)]
    [string]$DbPort = "5433",
    
    [Parameter(Mandatory=$false)]
    [string]$DbUser = "postgres",
    
    [Parameter(Mandatory=$false)]
    [string]$DbName = "inventory"
)

# Colores para output
$colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
}

function Write-Status {
    param([string]$Message, [string]$Type = "Info")
    $color = $colors[$Type]
    Write-Host $Message -ForegroundColor $color
}

function Test-PostgresConnection {
    param([string]$Host, [string]$Port, [string]$User, [string]$Password)
    
    try {
        $env:PGPASSWORD = $Password
        $output = psql -U $User -h $Host -p $Port -c "SELECT 1" 2>&1
        Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
        
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
        return $false
    } catch {
        return $false
    }
}

function Validate-BackupFile {
    param([string]$FilePath)
    
    Write-Status "`n🔍 Validando archivo de backup..." "Info"
    
    if (-not (Test-Path $FilePath)) {
        Write-Status "❌ Archivo no encontrado: $FilePath" "Error"
        return $false
    }
    
    $content = Get-Content $FilePath -Raw
    $sizeInMB = ([System.IO.FileInfo]$FilePath).Length / 1MB
    
    Write-Status "   Tamaño: $([math]::Round($sizeInMB, 2)) MB" "Info"
    
    # Verificar que contiene SQL válido
    if (-not ($content -match "CREATE TABLE")) {
        Write-Status "   ⚠️  No contiene CREATE TABLE" "Warning"
    }
    
    if ($content -match "\\restrict") {
        Write-Status "   ⚠️  Contiene líneas corruptas (\restrict)" "Warning"
        Write-Status "   🔧 Limpiando archivo..." "Info"
        
        $cleaned = $content -replace '\\restrict.*?\n', ''
        $cleaned = $cleaned -replace '[\x00-\x08\x0B-\x0C\x0E-\x1F]', ''
        
        Set-Content -Path $FilePath -Value $cleaned -Encoding UTF8
        Write-Status "   ✅ Archivo limpiado" "Success"
    }
    
    Write-Status "   ✅ Validación completada" "Success"
    return $true
}

function Create-SecurityBackup {
    param([string]$User, [string]$Password, [string]$Host, [string]$Port, [string]$DbName)
    
    Write-Status "`n💾 Creando backup de seguridad del estado actual..." "Info"
    
    $timestamp = Get-Date -Format "yyyy-MM-dd-HH-mm-ss"
    $backupPath = "backend/backups/security-backup-$timestamp.sql"
    
    try {
        $env:PGPASSWORD = $Password
        
        # Usar pg_dump con opciones mejoradas
        & pg_dump --encoding=UTF8 --clean --if-exists --no-password `
            -U $User -h $Host -p $Port -d $DbName -F p `
            -o $backupPath 2>&1
        
        Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
        
        if ($LASTEXITCODE -eq 0 -and (Test-Path $backupPath)) {
            $sizeInMB = ([System.IO.FileInfo]$backupPath).Length / 1MB
            Write-Status "   ✅ Backup de seguridad creado: $backupPath ($([math]::Round($sizeInMB, 2)) MB)" "Success"
            return $backupPath
        } else {
            Write-Status "   ❌ Error al crear backup de seguridad" "Error"
            return $null
        }
    } catch {
        Write-Status "   ❌ Error: $_" "Error"
        return $null
    }
}

function Restore-Database {
    param(
        [string]$BackupPath,
        [string]$User,
        [string]$Password,
        [string]$Host,
        [string]$Port,
        [string]$DbName
    )
    
    Write-Status "`n📥 Restaurando base de datos..." "Info"
    Write-Status "   Base de datos: $DbName" "Info"
    Write-Status "   Host: $Host`:$Port" "Info"
    
    try {
        $env:PGPASSWORD = $Password
        
        # Restaurar usando psql
        $content = Get-Content $BackupPath -Raw
        $content | psql -U $User -h $Host -p $Port -d $DbName 2>&1 | Out-Null
        
        Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
        
        if ($LASTEXITCODE -eq 0) {
            Write-Status "   ✅ Restauración completada exitosamente" "Success"
            return $true
        } else {
            Write-Status "   ❌ Error durante la restauración" "Error"
            return $false
        }
    } catch {
        Write-Status "   ❌ Error: $_" "Error"
        Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
        return $false
    }
}

function Verify-Restoration {
    param([string]$User, [string]$Password, [string]$Host, [string]$Port, [string]$DbName)
    
    Write-Status "`n✔️  Verificando restauración..." "Info"
    
    try {
        $env:PGPASSWORD = $Password
        
        # Contar tablas
        $tableCount = psql -U $User -h $Host -p $Port -d $DbName -t -c `
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>&1
        
        # Obtener lista de tablas
        $tables = psql -U $User -h $Host -p $Port -d $DbName -t -c `
            "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;" 2>&1
        
        Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
        
        Write-Status "   📊 Total de tablas: $tableCount" "Info"
        Write-Status "   📋 Tablas creadas:" "Info"
        
        $tables | ForEach-Object {
            if ($_.Trim()) {
                Write-Status "      - $_" "Info"
            }
        }
        
        if ([int]$tableCount -gt 0) {
            Write-Status "   ✅ Restauración verificada correctamente" "Success"
            return $true
        } else {
            Write-Status "   ❌ No se encontraron tablas" "Error"
            return $false
        }
    } catch {
        Write-Status "   ❌ Error al verificar: $_" "Error"
        Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
        return $false
    }
}

# ============================================================================
# MAIN
# ============================================================================

Write-Status "`n╔════════════════════════════════════════════════════════════╗" "Info"
Write-Status "║     RESTAURACIÓN MEJORADA DE BASE DE DATOS POSTGRESQL      ║" "Info"
Write-Status "╚════════════════════════════════════════════════════════════╝" "Info"

# Seleccionar archivo de backup si no se proporciona
if (-not $BackupFile) {
    Write-Status "`n📁 Archivos de backup disponibles:" "Info"
    $backups = Get-ChildItem "backend/backups/*.sql" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    
    if ($backups.Count -eq 0) {
        Write-Status "❌ No hay archivos de backup disponibles" "Error"
        exit 1
    }
    
    for ($i = 0; $i -lt $backups.Count; $i++) {
        $size = [math]::Round($backups[$i].Length / 1MB, 2)
        Write-Host "   $($i + 1). $($backups[$i].Name) ($size MB)" -ForegroundColor Cyan
    }
    
    $selection = Read-Host "`nSelecciona el número del backup"
    $BackupFile = $backups[[int]$selection - 1].FullName
}

# Validar archivo de backup
if (-not (Validate-BackupFile $BackupFile)) {
    exit 1
}

# Solicitar contraseña
$password = Read-Host "`n🔐 Ingresa la contraseña de PostgreSQL" -AsSecureString
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($password))

# Verificar conexión
Write-Status "`n🔌 Verificando conexión a PostgreSQL..." "Info"
if (-not (Test-PostgresConnection $DbHost $DbPort $DbUser $plainPassword)) {
    Write-Status "❌ No se puede conectar a PostgreSQL" "Error"
    Write-Status "   Host: $DbHost`:$DbPort" "Error"
    Write-Status "   Usuario: $DbUser" "Error"
    exit 1
}
Write-Status "   ✅ Conexión exitosa" "Success"

# Crear backup de seguridad
$securityBackup = Create-SecurityBackup $DbUser $plainPassword $DbHost $DbPort $DbName
if (-not $securityBackup) {
    Write-Status "`n⚠️  No se pudo crear backup de seguridad, continuando de todas formas..." "Warning"
}

# Restaurar base de datos
if (-not (Restore-Database $BackupFile $DbUser $plainPassword $DbHost $DbPort $DbName)) {
    Write-Status "`n❌ La restauración falló" "Error"
    if ($securityBackup) {
        Write-Status "💡 Puedes restaurar desde el backup de seguridad: $securityBackup" "Info"
    }
    exit 1
}

# Verificar restauración
if (-not (Verify-Restoration $DbUser $plainPassword $DbHost $DbPort $DbName)) {
    Write-Status "`n⚠️  La verificación falló, pero la restauración puede haber sido parcial" "Warning"
}

Write-Status "`n✅ ¡Proceso completado exitosamente!" "Success"
Write-Status "Puedes comenzar a trabajar con la base de datos." "Success"

if ($securityBackup) {
    Write-Status "`n💡 Backup de seguridad guardado en: $securityBackup" "Info"
}

Write-Status "`n" "Info"
