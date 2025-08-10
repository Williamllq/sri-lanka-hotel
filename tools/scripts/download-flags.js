const fs = require('fs');
const https = require('https');
const path = require('path');

// Define country codes we want to download
const countryCodes = [
  'gb', // United Kingdom
  'cn', // China
  'de', // Germany
  'fr', // France
  'es', // Spain
  'lk', // Sri Lanka
  'us', // United States
  'ru', // Russia
  'it'  // Italy
];

// Ensure the flags directory exists
const flagsDir = path.join(__dirname, 'images', 'flags');
if (!fs.existsSync(flagsDir)) {
  fs.mkdirSync(flagsDir, { recursive: true });
}

// Function to download a flag
function downloadFlag(countryCode) {
  const url = `https://raw.githubusercontent.com/hampusborgos/country-flags/main/png250px/${countryCode}.png`;
  const filePath = path.join(flagsDir, `${countryCode}.png`);
  
  console.log(`Downloading flag for ${countryCode.toUpperCase()}...`);
  
  const file = fs.createWriteStream(filePath);
  
  https.get(url, (response) => {
    if (response.statusCode !== 200) {
      console.error(`Failed to download ${countryCode}: HTTP status code ${response.statusCode}`);
      fs.unlinkSync(filePath); // Delete the file if download failed
      return;
    }
    
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${countryCode}.png successfully!`);
    });
  }).on('error', (err) => {
    fs.unlinkSync(filePath); // Delete the file if download failed
    console.error(`Error downloading ${countryCode}: ${err.message}`);
  });
}

// Download all flags
countryCodes.forEach(code => {
  downloadFlag(code);
});

console.log('Starting flag downloads...'); 