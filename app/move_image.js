const fs = require('fs');
const path = require('path');

const oldPath = path.join(__dirname, 'ChatGPT Image 2 août 2026, 03_24_00.png');
const newPath = path.join(__dirname, 'public', 'logo.png');

if (fs.existsSync(oldPath)) {
  fs.renameSync(oldPath, newPath);
  console.log('File moved successfully!');
} else {
  console.log('File not found at:', oldPath);
}
