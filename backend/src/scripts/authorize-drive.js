const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

// Si no has configurado .env aún en este script
require('dotenv').config({ path: './.env' });

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = path.join(__dirname, '../../certs/token.json');
const CREDENTIALS_PATH = path.join(__dirname, '../../certs/client_secret.json');

async function authorize() {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline', // Importante para obtener el refresh_token
    scope: SCOPES,
    prompt: 'consent' // Fuerza a mostrar la pantalla de consentimiento para asegurar el refresh_token
  });

  console.log('\n🚀 ¡Casi listo! Sigue estos pasos para vincular tu cuenta:');
  console.log('1. Abre este enlace en tu navegador:\n');
  console.log('-----------------------------------------------------------');
  console.log(authUrl);
  console.log('-----------------------------------------------------------\n');
  console.log('2. Inicia sesión con tu cuenta de Google.');
  console.log('3. Si te sale un aviso de "Google no ha verificado esta app", dale a "Configuración avanzada" y luego a "Ir a Backups Prendas (no seguro)".');
  console.log('4. Copia el código que aparece en pantalla y pégalo aquí debajo.');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('\n👉 Pega el código de autorización aquí: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('❌ Error al recuperar el token de acceso', err);
      
      // Guardar el token en disco
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log('\n✅ ¡ÉXITO! El token se ha guardado en:', TOKEN_PATH);
      console.log('Ahora el sistema usará tu espacio de almacenamiento oficial.');
    });
  });
}

if (!fs.existsSync(CREDENTIALS_PATH)) {
  console.error('❌ No se encontró el archivo certs/client_secret.json');
} else {
  authorize();
}
