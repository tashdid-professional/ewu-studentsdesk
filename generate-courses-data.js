// Script to convert newFacultyList.csv to courses-data-new.js format
// Usage: node generate-courses-data.js

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const csvPath = path.join(__dirname, 'public', 'newFacultyList.cleaned.csv');
const outputPath = path.join(__dirname, 'public', 'courses-data-new.js');


const csvContent = fs.readFileSync(csvPath, 'utf8');
const parsed = Papa.parse(csvContent, {
  header: false,
  skipEmptyLines: true,
});

// Find the header row (the row containing 'Course', 'Section', 'Faculty', 'Timing')
let headerRowIdx = -1;
let headerMap = {};
for (let i = 0; i < parsed.data.length; i++) {
  const row = parsed.data[i];
  if (row.includes('Course') && row.includes('Section') && row.includes('Faculty')) {
    headerRowIdx = i;
    row.forEach((col, idx) => {
      if (col) headerMap[col.trim()] = idx;
    });
    break;
  }
}

if (headerRowIdx === -1) {
  console.error('Header row not found.');
  process.exit(1);
}

// Group by course code and section
const coursesMap = {};
for (let i = headerRowIdx + 1; i < parsed.data.length; i++) {
  const row = parsed.data[i];
  const code = row[headerMap['Course']]?.trim();
  const section = row[headerMap['Section']]?.trim();
  const faculty = row[headerMap['Faculty']]?.trim();
  // Handle both 5 and 6 column rows for timing
  let time = row[5]?.trim();
  if (!time) time = row[4]?.trim();
  if (!code || !section || !faculty || !time) continue;

  if (!coursesMap[code]) coursesMap[code] = {};
  if (!coursesMap[code][section]) coursesMap[code][section] = { faculty, times: [] };
  coursesMap[code][section].times.push({ time });
}

// Build final structure
const courses = Object.entries(coursesMap).map(([code, sectionsObj]) => ({
  code,
  title: code,
  sections: Object.entries(sectionsObj).map(([section, data]) => ({
    section,
    faculty: data.faculty,
    times: data.times,
  })),
}));

const jsOutput = 'export const courses = ' + JSON.stringify(courses, null, 2) + ';\n';
fs.writeFileSync(outputPath, jsOutput);
console.log('courses-data-new.js generated successfully!');

// Note: Requires papaparse. Install with: npm install papaparse
