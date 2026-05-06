# copy_nit_to_cod_of.ps1
# Copia el valor de NIT a cod_of en todos los clientes donde cod_of esté vacío.
# Uso: .\copy_nit_to_cod_of.ps1 -DbName "nombre_bd" -DbUser "postgres" -DbHost "localhost"

param(
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432",
    [string]$DbUser = "postgres",
    [string]$DbName = "prendas_dev"
)

$sql = @"
UPDATE public.clients
SET cod_of = nit
WHERE cod_of IS NULL AND nit IS NOT NULL AND nit <> '';

SELECT COUNT(*) AS actualizados FROM public.clients WHERE cod_of IS NOT NULL;
"@

Write-Host "Conectando a $DbHost`:$DbPort/$DbName como $DbUser..." -ForegroundColor Cyan

$env:PGPASSWORD = Read-Host "Ingresa la contraseña de PostgreSQL" -AsSecureString | `
    ForEach-Object { [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }

$result = $sql | psql -h $DbHost -p $DbPort -U $DbUser -d $DbName

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Listo. Resultado:" -ForegroundColor Green
    Write-Host $result
} else {
    Write-Host "❌ Error al ejecutar el script." -ForegroundColor Red
}
