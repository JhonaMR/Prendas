require('dotenv').config({ path: './.env' });
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, '../../certs/client_secret.json');
const TOKEN_PATH = path.join(__dirname, '../../certs/token.json');
const authCode = '4/0AfrIepAhdYyNAaAz1MbuT3zJDcGODaR8ZMmUqISoMJFvt6Sd4yiUIUHHpJJadKvD20bSHA';

async function generateToken() {
  try {
    const content = fs.readFileSync(CREDENTIALS_PATH);
    const credentials = JSON.parse(content);
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    console.log('🔄 Generando token de acceso...');
    const { tokens } = await oAuth2Client.getToken(authCode);
    
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log('✅ ¡Token generado y guardado con éxito!');
    console.log('Archivo:', TOKEN_PATH);
  } catch (error) {
    console.error('❌ Error al generar el token:', error.message);
  }
}

generateToken();
