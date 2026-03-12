require('dotenv').config({ path: './.env' });
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function testDriveFull() {
  try {
    const keyPath = path.resolve('./certs/google-drive-key.json');
    console.log('--- TEST GOOGLE DRIVE FULL ---');
    
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });
    
    console.log('Listing ALL accessible files/folders...');
    const res = await drive.files.list({
      fields: 'files(id, name, parents)',
    });
    
    const files = res.data.files;
    if (files.length) {
      files.forEach((file) => {
        console.log(`- ${file.name} (ID: ${file.id}) [Parents: ${file.parents ? file.parents.join(',') : 'None'}]`);
      });
    } else {
      console.log('No files found.');
    }
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testDriveFull();
