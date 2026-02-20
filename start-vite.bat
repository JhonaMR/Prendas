@echo off
REM Script para iniciar Vite dev server
REM Cambiar al directorio raíz del proyecto
cd /d "%~dp0"
node node_modules/vite/bin/vite.js
