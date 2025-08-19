// Script to remove room numbers from newFacultyList.csv and save as newFacultyList-no-room.csv
// Usage: node remove-room-from-csv.js

const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'public', 'newFacultyList.csv');
const outputPath = path.join(__dirname, 'public', 'newFacultyList-no-room.csv');

const lines = fs.readFileSync(inputPath, 'utf8').split(/\r?\n/);
const cleaned = lines.map(line => {
  // Remove the last comma and everything after (room info)
  // Only for lines that look like course data (start with course code)
  if (/^[A-Z]{3,}\d{3},/.test(line)) {
    // Remove last comma and everything after
    const parts = line.split(',');
    // If room info is present, remove it
    if (parts.length > 6) {
      // Remove last part (room)
      return parts.slice(0, 6).join(',');
    }
  }
  return line;
});
fs.writeFileSync(outputPath, cleaned.join('\n'));
console.log('Room numbers removed. Output: newFacultyList-no-room.csv');
