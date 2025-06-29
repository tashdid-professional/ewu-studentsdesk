// Node.js script to convert EWU course CSV to JSON for the course planner app
// Usage: node convert-courses.js <csv-file>
const fs = require('fs');
const csvFile = process.argv[2];
if (!csvFile) {
  console.error('Usage: node convert-courses.js <csv-file>');
  process.exit(1);
}

console.error(`Attempting to read file: ${csvFile}`);
try {
  const csv = fs.readFileSync(csvFile, 'utf8');
  console.error(`File read successfully, ${csv.length} characters`);
} catch (err) {
  console.error(`Error reading file: ${err.message}`);
  process.exit(1);
}
const lines = csv.split(/\r?\n/).filter(Boolean);

console.error(`Read ${lines.length} lines from CSV`);
console.error(`First few lines:`, lines.slice(0, 5));

// Find the header row (should be: Course Code,Faculty Initial,Section,Seats,Time)
let headerIdx = lines.findIndex(l => l.startsWith('Course Code'));
console.error(`Header index: ${headerIdx}`);
if (headerIdx === -1) {
  console.error('Header row not found.');
  process.exit(1);
}
const header = lines[headerIdx].split(',').map(h => h.trim());
const COURSE_CODE = header.indexOf('Course Code');
const FACULTY = header.indexOf('Faculty Initial');
const SECTION = header.indexOf('Section');
const TIME = header.indexOf('Time');

const courses = {};
for (let i = headerIdx + 1; i < lines.length; ++i) {
  const row = lines[i].split(',').map(x => x.trim());
  if (!row[COURSE_CODE] || !row[SECTION] || !row[TIME]) continue;
  const code = row[COURSE_CODE];
  const section = row[SECTION];
  const faculty = row[FACULTY];
  const time = row[TIME];

  if (!courses[code]) {
    courses[code] = {
      code,
      title: code, // No title in CSV, use code as title
      sections: {}
    };
  }
  if (!courses[code].sections[section]) {
    courses[code].sections[section] = {
      section,
      faculty,
      times: []
    };
  }
  courses[code].sections[section].times.push({ time });
}

const result = Object.values(courses).map(course => ({
  code: course.code,
  title: course.title,
  sections: Object.values(course.sections)
}));

if (result.length === 0) {
  console.error('No course data found.');
  process.exit(1);
}

console.log('export const courses = ' + JSON.stringify(result, null, 2) + ';');
