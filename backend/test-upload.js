require('dotenv').config({ path: './.env' });
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function testUploadSimple() {
  try {
    const keyPath = path.resolve('./certs/google-drive-key.json');
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    const drive = google.drive({ version: 'v3', auth });
    
    // Plow Folder ID
    const parentId = '1nV0YgZe5xITz0TUR_dHSyc_bkf3qRxKv';
    
    console.log('Testing upload of a simple text file to Plow folder...');
    
    const fileMetadata = {
      name: 'test_connection.txt',
      parents: [parentId],
    };

    const media = {
      mimeType: 'text/plain',
      body: 'This is a test file to verify Google Drive connection.',
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    console.log('✅ SUCCESS! File ID:', file.data.id);
  } catch (error) {
    if (error.response) {
      console.error('❌ FAILED! Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ FAILED! Error:', error.message);
    }
  }
}

testUploadSimple();
