require('dotenv').config({ path: './.env' });
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function testDriveGeneric() {
  try {
    const keyPath = path.resolve('./certs/google-drive-key.json');
    console.log('--- TEST GOOGLE DRIVE ---');
    console.log('Key path:', keyPath);
    
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });
    
    console.log('Listing files accessible by this service account...');
    const res = await drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
    });
    
    const files = res.data.files;
    if (files.length) {
      console.log('Files found:');
      files.forEach((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found. The service account has no access to any files/folders yet.');
    }
  } catch (error) {
    if (error.response) {
      console.error('Error Response DATA:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('General Error:', error.message);
    }
  }
}

testDriveGeneric();
