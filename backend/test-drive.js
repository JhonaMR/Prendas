require('dotenv').config({ path: './.env' });
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function testDrive() {
  try {
    const keyPath = path.resolve('./certs/google-drive-key.json');
    console.log('Key path:', keyPath);
    
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });
    
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID_PLOW;
    console.log('Testing Folder ID:', folderId);

    const response = await drive.files.get({
      fileId: folderId,
      fields: 'id, name',
    });

    console.log('Successfully reached folder:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testDrive();
