const fs = require('fs');

// Read the courses data
const data = fs.readFileSync('public/courses-data.js', 'utf8');
const coursesMatch = data.match(/export const courses = (\[[\s\S]*\]);/);
const courses = JSON.parse(coursesMatch[1]);

console.log('=== FIXING THEORY + LAB FACULTY COMBINATIONS ===\n');
console.log('Original total sections:', courses.reduce((sum, course) => sum + course.sections.length, 0));

let fixedCount = 0;

courses.forEach(course => {
    const sectionGroups = new Map();
    
    // Group sections by their time patterns
    course.sections.forEach(section => {
        const key = section.times.map(t => t.time).sort().join('|');
        if (!sectionGroups.has(key)) {
            sectionGroups.set(key, []);
        }
        sectionGroups.get(key).push(section);
    });
    
    // Process groups with multiple sections (same times, different faculty)
    sectionGroups.forEach((sections, timeKey) => {
        if (sections.length > 1) {
            const faculties = sections.map(s => s.faculty);
            const uniqueFaculties = [...new Set(faculties)];
            
            if (uniqueFaculties.length > 1) {
                console.log(`${course.code}: Combining sections with times [${timeKey.replace(/\|/g, ', ')}]`);
                
                // Sort sections by section number
                sections.sort((a, b) => parseInt(a.section) - parseInt(b.section));
                
                // Combine faculty names
                const combinedFaculty = uniqueFaculties.join(' & ');
                
                console.log(`  Sections: ${sections.map(s => `${s.section}(${s.faculty})`).join(', ')}`);
                console.log(`  Combined faculty: ${combinedFaculty}`);
                
                // Keep the first section and update its faculty
                const firstSection = sections[0];
                firstSection.faculty = combinedFaculty;
                
                // Remove the other sections from the course
                const sectionsToRemove = sections.slice(1);
                sectionsToRemove.forEach(sectionToRemove => {
                    const index = course.sections.findIndex(s => 
                        s.section === sectionToRemove.section && 
                        s.faculty === sectionToRemove.faculty
                    );
                    if (index !== -1) {
                        course.sections.splice(index, 1);
                    }
                });
                
                fixedCount++;
                console.log(`  → Combined into section ${firstSection.section} with faculty: ${combinedFaculty}\n`);
            }
        }
    });
});

console.log(`Fixed ${fixedCount} theory + lab combinations`);
console.log('New total sections:', courses.reduce((sum, course) => sum + course.sections.length, 0));

// Write the fixed data back
const newData = data.replace(
    /export const courses = \[[\s\S]*\];/,
    `export const courses = ${JSON.stringify(courses, null, 2)};`
);

fs.writeFileSync('public/courses-data.js', newData);
console.log('\nFixed data written to courses-data.js');

// Count sections with combined faculty
let combinedFacultyCount = 0;
courses.forEach(course => {
    course.sections.forEach(section => {
        if (section.faculty.includes(' & ')) {
            combinedFacultyCount++;
        }
    });
});

console.log(`Total sections with combined faculty: ${combinedFacultyCount}`);
