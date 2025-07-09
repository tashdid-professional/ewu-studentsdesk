const fs = require('fs');

// Read the CSV file
const csvData = fs.readFileSync('public/Updated Faculty List 18-6-25.csv', 'utf8');
const lines = csvData.split('\n').slice(2); // Skip header lines

console.log('=== ANALYZING CSV FOR MULTIPLE FACULTY CASES ===\n');

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

console.log(`Total entries in CSV: ${entries.length}`);

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

// Find sections with multiple faculty
const multipleFacultySections = [];
sectionMap.forEach((section, key) => {
    if (section.faculty.size > 1) {
        multipleFacultySections.push({
            course: section.course,
            section: section.section,
            faculty: Array.from(section.faculty),
            times: section.times,
            entries: section.entries
        });
    }
});

console.log(`\nSections with multiple faculty: ${multipleFacultySections.length}\n`);

multipleFacultySections.forEach(section => {
    console.log(`${section.course} section ${section.section}:`);
    console.log(`  Faculty: ${section.faculty.join(' & ')}`);
    console.log(`  Times:`);
    section.entries.forEach(entry => {
        console.log(`    ${entry.faculty}: ${entry.time}`);
    });
    console.log('');
});

// Show summary
console.log(`\n=== SUMMARY ===`);
console.log(`Total sections in CSV: ${sectionMap.size}`);
console.log(`Sections with multiple faculty: ${multipleFacultySections.length}`);
console.log(`Percentage: ${(multipleFacultySections.length / sectionMap.size * 100).toFixed(1)}%`);
