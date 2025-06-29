// Simple script to create courses data from the CSV content
const fs = require('fs');

// Read the CSV file directly
const csvContent = fs.readFileSync('public/Updated Faculty List 18-6-25.csv', 'utf8');
const lines = csvContent.split(/\r?\n/).filter(Boolean);

// Find header row and start processing from there
const headerIndex = lines.findIndex(line => line.includes('Course Code,Faculty Initial,Section,Seats,Time'));
if (headerIndex === -1) {
  console.error('Header not found');
  process.exit(1);
}

const courses = {};

// Process each data row
for (let i = headerIndex + 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const parts = line.split(',');
  if (parts.length < 5) continue;
  
  const courseCode = parts[0].trim();
  const faculty = parts[1].trim();
  const section = parts[2].trim();
  const seats = parts[3].trim();
  const time = parts[4].trim();
  
  if (!courseCode || !section || !time) continue;
  
  // Initialize course if not exists
  if (!courses[courseCode]) {
    courses[courseCode] = {
      code: courseCode,
      title: courseCode, // Using code as title since no separate title column
      sections: {}
    };
  }
  
  // Initialize section if not exists
  if (!courses[courseCode].sections[section]) {
    courses[courseCode].sections[section] = {
      section: section,
      faculty: faculty,
      times: []
    };
  }
  
  // Add time slot
  courses[courseCode].sections[section].times.push({
    time: time
  });
}

// Convert to array format
const coursesArray = Object.values(courses).map(course => ({
  code: course.code,
  title: course.title,
  sections: Object.values(course.sections)
}));

// Output as JavaScript module
const output = `export const courses = ${JSON.stringify(coursesArray, null, 2)};`;
console.log(output);
