BACKUPS
pg_dump -h localhost -p 5433 -U postgres -d inventory_plow -f plow_backup.sql
pg_dump -h localhost -p 5433 -U postgres -d inventory_melas -f melas_backup.sql
pg_dump -h localhost -p 5433 -U postgres -d inventory_dev -f dev_backup.sql

CREAR TABLAS
psql -U postgres -p 5433 -c "CREATE DATABASE inventory_plow;"
psql -U postgres -p 5433 -c "CREATE DATABASE inventory_melas;"
psql -U postgres -p 5433 -c "CREATE DATABASE inventory_dev;"

MONTAR LOS BACKUPS
psql -U postgres -p 5433 -d inventory_plow -f plow_backup.sql
psql -U postgres -p 5433 -d inventory_melas -f melas_backup.sql
psql -U postgres -p 5433 -d inventory_dev -f dev_backup.sql

Puerto: 5433
Contraseña: Contrasena14.

TRABAJAR EN RAMA DEV

Terminal 1 - Backend
cd Prendas/backend
npm run dev
Esto arranca el backend en http://localhost:5000 conectado a inventory_dev. Lo configuramos así en el package.json del backend:

"dev": "ENV_FILE=../../.env.dev nodemon src/server.js"
Esa variable ENV_FILE le dice al server.js que cargue el .env.dev, que tiene PORT=5000 y DB_NAME=inventory_dev.

Terminal 2 - Frontend
cd Prendas
npm run dev:local
Esto arranca Vite en http://localhost:5175. Lo configuramos así en el package.json del frontend:

"dev:local": "NODE_ENV=development vite --port 5175"
El frontend en el puerto 5175 sabe automáticamente que debe hablar con el backend en 5000, porque lo configuramos en api.ts:

} else if (port === '5175' || port === '5000') {
  backendPort = '5000'; // DEV
}
Flujo completo de un día de trabajo
1. Abres dos terminales y arrancas todo:

# Terminal 1
cd Prendas/backend
npm run dev

# Terminal 2
cd Prendas
npm run dev:local
2. Abres el navegador en http://localhost:5175 y trabajas normalmente.

3. Haces cambios en el código. Nodemon reinicia el backend automáticamente, Vite recarga el frontend automáticamente. No tienes que hacer nada.

4. Si tu cambio necesita un cambio en la BD:

# Terminal 3 (o paras una de las anteriores)
cd Prendas/backend
npm run migrate:create "descripcion_del_cambio"
# Editas el archivo SQL que se generó
npm run migrate:up  # Aplica en inventory_dev
5. Cuando terminas el día o la funcionalidad, haces commit:

cd Prendas
git add .
git commit -m "Descripción de lo que hiciste"
6. Cuando la funcionalidad está lista para producción:

# Merge a main
git checkout main
git merge develop
git push origin main

# En el servidor
git pull origin main
npm run migrate:up:prod  # Aplica cambios de BD en Plow y Melas
pm2 restart all

# Vuelves a develop para seguir trabajando
git checkout develop
Una cosa importante
La rama develop no tiene nada que ver con qué .env se carga. La rama es solo para Git (control de versiones). El entorno dev lo controla el comando que usas:

npm run dev en backend → carga .env.dev → inventory_dev → puerto 5000
npm run dev:local en frontend → puerto 5175
Podrías estar en la rama main y correr npm run dev y seguiría usando inventory_dev. La rama y el entorno son cosas independientes. La convención es que cuando estás en develop usas el entorno dev, pero técnicamente no están atados