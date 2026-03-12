const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleDriveService {
  constructor() {
    this.tokenPath = path.join(__dirname, '../../certs/token.json');
    this.credentialsPath = path.join(__dirname, '../../certs/client_secret.json');
    this.enabled = false;

    if (fs.existsSync(this.credentialsPath) && fs.existsSync(this.tokenPath)) {
      this.initAuth();
    } else {
      console.warn('⚠️ Google Drive OAuth2 no configurado. Falta client_secret.json o token.json');
    }
  }

  initAuth() {
    try {
      const credentials = JSON.parse(fs.readFileSync(this.credentialsPath));
      const token = JSON.parse(fs.readFileSync(this.tokenPath));
      const { client_secret, client_id, redirect_uris } = credentials.installed;

      this.oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
      this.oAuth2Client.setCredentials(token);

      this.drive = google.drive({ version: 'v3', auth: this.oAuth2Client });
      this.enabled = true;
      console.log('✅ Google Drive Service habilitado (OAuth2)');
    } catch (error) {
      console.error('❌ Error al inicializar OAuth2:', error.message);
      this.enabled = false;
    }
  }

  /**
   * Obtiene o crea una subcarpeta dentro de una carpeta padre
   */
  async getOrCreateFolder(folderName, parentId) {
    if (!this.enabled) return null;

    try {
      console.log(`🔍 Buscando carpeta '${folderName}' en el directorio...`);
      
      const response = await this.drive.files.list({
        q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      const existingFolder = response.data.files.find(f => f.name.toLowerCase() === folderName.toLowerCase());

      if (existingFolder) {
        console.log(`✅ Carpeta encontrada: ${folderName} (ID: ${existingFolder.id})`);
        return existingFolder.id;
      }

      console.log(`✨ Carpeta '${folderName}' no encontrada, intentando crearla...`);
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      };

      const folder = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id',
      });

      console.log(`📁 Carpeta '${folderName}' creada con ID: ${folder.data.id}`);
      return folder.data.id;
    } catch (error) {
      console.error(`❌ Error en getOrCreateFolder (${folderName}):`, error.response ? error.response.data : error.message);
      throw error;
    }
  }

  /**
   * Sube un archivo a Google Drive
   */
  async uploadFile(filePath, fileName, parentId) {
    if (!this.enabled) {
      console.warn('⚠️ Google Drive Service no está habilitado');
      return null;
    }

    try {
      const fileMetadata = {
        name: fileName,
        parents: [parentId],
      };

      const media = {
        body: fs.createReadStream(filePath),
      };

      const file = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, webViewLink'
      });

      console.log(`✅ Archivo subido con éxito: ${fileName} (ID: ${file.data.id})`);
      return file.data;
    } catch (error) {
      console.error(`❌ Error al subir archivo '${fileName}':`, error.response ? error.response.data : error.message);
      throw error;
    }
  }
}

module.exports = new GoogleDriveService();
