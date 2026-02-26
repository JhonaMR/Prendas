@echo off
REM Script para iniciar PM2 con los procesos de Prendas
REM Este script se ejecuta automáticamente al iniciar Windows

cd /d "C:\Users\luisf\OneDrive\Desktop\Proyecto\prendas\backend"
pm2 resurrect
