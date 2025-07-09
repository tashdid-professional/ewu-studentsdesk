const fs = require('fs');

// Read the courses data
const data = fs.readFileSync('public/courses-data.js', 'utf8');
const coursesMatch = data.match(/export const courses = (\[[\s\S]*\]);/);
const courses = JSON.parse(coursesMatch[1]);

console.log('=== FINDING THEORY + LAB EXCEPTIONS ===\n');

// Look for courses where there are exactly 3 time slots
// and some sections have different faculty for theory vs lab
let theoryLabExceptions = [];

courses.forEach(course => {
    // Check if this course has sections with 3 time slots
    const sectionsWithThreeSlots = course.sections.filter(s => s.times.length === 3);
    
    if (sectionsWithThreeSlots.length > 0) {
        // This course has sections with 3 time slots
        // Now check if there are duplicate section patterns that suggest theory + lab split
        
        // Group sections by their time patterns
        const timePatterns = new Map();
        
        course.sections.forEach(section => {
            if (section.times.length === 3) {
                // Create a key based on the time pattern
                const timesKey = section.times.map(t => t.time).sort().join('|');
                
                if (!timePatterns.has(timesKey)) {
                    timePatterns.set(timesKey, []);
                }
                timePatterns.get(timesKey).push(section);
            }
        });
        
        // Look for time patterns that have multiple sections (different faculty)
        timePatterns.forEach((sections, timePattern) => {
            if (sections.length > 1) {
                // Multiple sections with same time pattern but different faculty
                // This suggests theory + lab split
                theoryLabExceptions.push({
                    course: course.code,
                    timePattern: timePattern.split('|'),
                    sections: sections.map(s => ({
                        section: s.section,
                        faculty: s.faculty
                    }))
                });
            }
        });
    }
});

console.log(`Found ${theoryLabExceptions.length} courses with theory + lab exceptions:\n`);

theoryLabExceptions.forEach(exception => {
    console.log(`${exception.course}:`);
    console.log(`  Time pattern: ${exception.timePattern.join(', ')}`);
    console.log(`  Sections with different faculty:`);
    exception.sections.forEach(s => {
        console.log(`    Section ${s.section}: ${s.faculty}`);
    });
    console.log('');
});

// Also check for sections that might need faculty combining
// Look for cases where multiple entries exist for what should be the same section
let potentialCombines = [];

courses.forEach(course => {
    const sectionGroups = new Map();
    
    course.sections.forEach(section => {
        const key = `${section.times.map(t => t.time).sort().join('|')}`;
        if (!sectionGroups.has(key)) {
            sectionGroups.set(key, []);
        }
        sectionGroups.get(key).push(section);
    });
    
    sectionGroups.forEach((sections, timeKey) => {
        if (sections.length > 1) {
            // Multiple sections with same times but different faculty
            const faculties = sections.map(s => s.faculty);
            const uniqueFaculties = [...new Set(faculties)];
            
            if (uniqueFaculties.length > 1) {
                potentialCombines.push({
                    course: course.code,
                    times: timeKey.split('|'),
                    sections: sections.map(s => ({
                        section: s.section,
                        faculty: s.faculty
                    }))
                });
            }
        }
    });
});

console.log(`\n=== POTENTIAL FACULTY COMBINATIONS ===`);
console.log(`Found ${potentialCombines.length} cases where sections have same times but different faculty:\n`);

potentialCombines.slice(0, 10).forEach(combo => {
    console.log(`${combo.course}:`);
    console.log(`  Times: ${combo.times.join(', ')}`);
    console.log(`  Sections:`);
    combo.sections.forEach(s => {
        console.log(`    Section ${s.section}: ${s.faculty}`);
    });
    console.log('');
});

if (potentialCombines.length > 10) {
    console.log(`... and ${potentialCombines.length - 10} more cases`);
}
