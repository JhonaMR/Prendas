# Add PostgreSQL to Windows PATH
# Run this script as Administrator

$postgresPath = "C:\Program Files\PostgreSQL\18\bin"

# Check if path already exists
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")

if ($currentPath -like "*PostgreSQL*") {
    Write-Host "✅ PostgreSQL is already in PATH" -ForegroundColor Green
    exit 0
}

# Add PostgreSQL to PATH
$newPath = $currentPath + ";" + $postgresPath
[Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")

Write-Host "✅ PostgreSQL added to PATH" -ForegroundColor Green
Write-Host "📍 Path: $postgresPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Please restart PowerShell or Command Prompt for changes to take effect" -ForegroundColor Yellow
