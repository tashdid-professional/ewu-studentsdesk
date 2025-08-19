// remove-room-column.js
// This script removes the room info from each row in newFacultyList.csv, keeping only course, section, faculty, capacity, and timing columns.

const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'public', 'newFacultyList.csv');
const outputPath = path.join(__dirname, 'public', 'newFacultyList.cleaned.csv');

const lines = fs.readFileSync(inputPath, 'utf8').split(/\r?\n/);
const cleaned = [];

for (let line of lines) {
    // If line is header or empty, keep as is
    if (line.trim() === '' || line.includes('East West University') || line.startsWith('Course,Section,Faculty')) {
        cleaned.push(line.replace(/,Room No,?/, ','));
        continue;
    }
    // Always keep only the first 6 columns, discarding everything after
    let parts = line.split(',');
    cleaned.push(parts.slice(0, 6).join(','));
}

fs.writeFileSync(outputPath, cleaned.join('\n'), 'utf8');
console.log('Room info removed. Cleaned file saved as newFacultyList.cleaned.csv');
