const fs = require('fs');

// Read the courses data
const data = fs.readFileSync('public/courses-data.js', 'utf8');
const coursesMatch = data.match(/export const courses = (\[[\s\S]*\]);/);
const courses = JSON.parse(coursesMatch[1]);

console.log('=== FINDING THEORY + LAB SECTIONS WITH DIFFERENT TIMES ===\n');

// Look for sections that have multiple entries for the same section number
// but with different faculty (theory faculty vs lab faculty)
let sectionMap = new Map();

courses.forEach(course => {
    const courseSections = new Map();
    
    course.sections.forEach(section => {
        const key = section.section;
        if (!courseSections.has(key)) {
            courseSections.set(key, []);
        }
        courseSections.get(key).push({
            faculty: section.faculty,
            times: section.times.map(t => t.time)
        });
    });
    
    // Find sections with multiple entries (different faculty for same section number)
    courseSections.forEach((entries, sectionNum) => {
        if (entries.length > 1) {
            // Check if they have different faculty
            const faculties = entries.map(e => e.faculty);
            const uniqueFaculties = [...new Set(faculties)];
            
            if (uniqueFaculties.length > 1) {
                sectionMap.set(`${course.code}-${sectionNum}`, {
                    course: course.code,
                    section: sectionNum,
                    entries: entries
                });
            }
        }
    });
});

console.log(`Found ${sectionMap.size} sections with multiple faculty entries:\n`);

// Show all cases
Array.from(sectionMap.values()).forEach(item => {
    console.log(`${item.course} section ${item.section}:`);
    item.entries.forEach((entry, idx) => {
        console.log(`  Entry ${idx + 1}: ${entry.faculty}`);
        entry.times.forEach(time => {
            console.log(`    ${time}`);
        });
    });
    console.log('');
});

console.log(`\nTotal sections that need faculty combination: ${sectionMap.size}`);
