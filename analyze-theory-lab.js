const fs = require('fs');

// Read the courses data
const data = fs.readFileSync('public/courses-data.js', 'utf8');
const coursesMatch = data.match(/export const courses = (\[[\s\S]*\]);/);
const courses = JSON.parse(coursesMatch[1]);

console.log('=== ANALYZING THEORY + LAB FACULTY ISSUE ===\n');

let duplicateSections = [];

courses.forEach(course => {
    const sectionMap = new Map();
    
    // Group sections by section number
    course.sections.forEach(section => {
        const sectionNum = section.section;
        if (!sectionMap.has(sectionNum)) {
            sectionMap.set(sectionNum, []);
        }
        sectionMap.get(sectionNum).push(section);
    });
    
    // Find sections with the same section number but different faculty
    sectionMap.forEach((sections, sectionNum) => {
        if (sections.length > 1) {
            // Check if they have different faculty
            const faculties = sections.map(s => s.faculty);
            const uniqueFaculties = [...new Set(faculties)];
            
            if (uniqueFaculties.length > 1) {
                duplicateSections.push({
                    course: course.code,
                    section: sectionNum,
                    entries: sections.map(s => ({
                        faculty: s.faculty,
                        times: s.times.map(t => t.time)
                    }))
                });
            }
        }
    });
});

console.log(`Found ${duplicateSections.length} sections with multiple faculty entries (theory + lab):\n`);

duplicateSections.forEach(dup => {
    console.log(`${dup.course} section ${dup.section}:`);
    dup.entries.forEach((entry, idx) => {
        console.log(`  Entry ${idx + 1}: ${entry.faculty} - ${entry.times.join(', ')}`);
    });
    console.log('');
});

console.log(`\nTotal duplicate section entries to combine: ${duplicateSections.reduce((sum, dup) => sum + dup.entries.length, 0)}`);
console.log(`Total sections that will be combined: ${duplicateSections.length}`);
