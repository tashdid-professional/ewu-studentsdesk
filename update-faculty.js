const fs = require('fs');

// Read the CSV file
const csvData = fs.readFileSync('public/Updated Faculty List 18-6-25.csv', 'utf8');
const lines = csvData.split('\n').slice(2); // Skip header lines

// Parse CSV data
const entries = [];
lines.forEach(line => {
    const parts = line.split(',');
    if (parts.length >= 5 && parts[0] && parts[1] && parts[2] && parts[4]) {
        entries.push({
            course: parts[0].trim(),
            faculty: parts[1].trim(),
            section: parts[2].trim(),
            seats: parts[3].trim(),
            time: parts[4].trim()
        });
    }
});

// Group by course and section
const sectionMap = new Map();
entries.forEach(entry => {
    const key = `${entry.course}-${entry.section}`;
    if (!sectionMap.has(key)) {
        sectionMap.set(key, {
            course: entry.course,
            section: entry.section,
            faculty: new Set(),
            times: [],
            entries: []
        });
    }
    
    const section = sectionMap.get(key);
    section.faculty.add(entry.faculty);
    section.times.push(entry.time);
    section.entries.push(entry);
});

// Create faculty mapping for sections with multiple faculty
const facultyMap = new Map();
sectionMap.forEach((section, key) => {
    if (section.faculty.size > 1) {
        const facultyList = Array.from(section.faculty).sort();
        facultyMap.set(key, facultyList.join(' & '));
    }
});

console.log('=== UPDATING COURSES DATA WITH COMBINED FACULTY ===\n');
console.log(`Found ${facultyMap.size} sections with multiple faculty to update`);

// Read the courses-data.js file
const data = fs.readFileSync('public/courses-data.js', 'utf8');
const coursesMatch = data.match(/export const courses = (\[[\s\S]*\]);/);
const courses = JSON.parse(coursesMatch[1]);

let updatedCount = 0;

// Update faculty for sections with multiple faculty
courses.forEach(course => {
    course.sections.forEach(section => {
        const key = `${course.code}-${section.section}`;
        if (facultyMap.has(key)) {
            const oldFaculty = section.faculty;
            section.faculty = facultyMap.get(key);
            console.log(`Updated ${course.code} section ${section.section}: ${oldFaculty} → ${section.faculty}`);
            updatedCount++;
        }
    });
});

console.log(`\nUpdated ${updatedCount} sections with combined faculty`);

// Write the updated data back
const newData = data.replace(
    /export const courses = \[[\s\S]*\];/,
    `export const courses = ${JSON.stringify(courses, null, 2)};`
);

fs.writeFileSync('public/courses-data.js', newData);
console.log('\nUpdated courses-data.js with combined faculty information');
