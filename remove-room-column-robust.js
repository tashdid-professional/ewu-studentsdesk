// remove-room-column-robust.js
// This script uses papaparse to robustly remove room info from each row in newFacultyList.csv, keeping only the first six columns.

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const inputPath = path.join(__dirname, 'public', 'newFacultyList.csv');
const outputPath = path.join(__dirname, 'public', 'newFacultyList.cleaned.csv');

const csvData = fs.readFileSync(inputPath, 'utf8');
const parsed = Papa.parse(csvData, { skipEmptyLines: false });
const cleanedRows = [];

for (let row of parsed.data) {
    // If header or empty, keep as is
    if (row.length === 0 || row.join('').trim() === '' || row[0].includes('East West University') || row[0].startsWith('Course')) {
        cleanedRows.push(row.slice(0, 5));
        continue;
    }
    // Always keep only the first 5 columns (up to timing)
    cleanedRows.push(row.slice(0, 5));
}

const cleanedCsv = Papa.unparse(cleanedRows, { quotes: false });
fs.writeFileSync(outputPath, cleanedCsv, 'utf8');
console.log('Room info robustly removed. Cleaned file saved as newFacultyList.cleaned.csv');
