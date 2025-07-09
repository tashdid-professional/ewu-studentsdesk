const fs = require('fs');

// Read the courses data
const data = fs.readFileSync('public/courses-data.js', 'utf8');
const coursesMatch = data.match(/export const courses = (\[[\s\S]*\]);/);
const courses = JSON.parse(coursesMatch[1]);

console.log('=== FIXING TEAM TEACHING SECTIONS ===\n');
console.log('Original total sections:', courses.reduce((sum, course) => sum + course.sections.length, 0));

let fixedCount = 0;

courses.forEach(course => {
    const sections = course.sections;
    let i = 0;
    
    while (i < sections.length - 1) {
        const currentSection = sections[i];
        const nextSection = sections[i + 1];
        
        // Check if sections have same times
        if (currentSection.times.length === nextSection.times.length) {
            const currentTimes = currentSection.times.map(t => t.time).sort();
            const nextTimes = nextSection.times.map(t => t.time).sort();
            
            const sameTimes = currentTimes.length === nextTimes.length && 
                              currentTimes.every((time, idx) => time === nextTimes[idx]);
            
            if (sameTimes && currentSection.faculty !== nextSection.faculty) {
                // Check if section numbers are consecutive
                const currentNum = parseInt(currentSection.section);
                const nextNum = parseInt(nextSection.section);
                
                if (nextNum === currentNum + 1) {
                    console.log(`Combining ${course.code} sections ${currentSection.section} & ${nextSection.section}:`);
                    console.log(`  Faculty: ${currentSection.faculty} & ${nextSection.faculty}`);
                    console.log(`  Times: ${currentTimes.join(', ')}`);
                    
                    // Combine faculty in the first section
                    currentSection.faculty = `${currentSection.faculty} & ${nextSection.faculty}`;
                    
                    // Remove the second section
                    sections.splice(i + 1, 1);
                    
                    fixedCount++;
                    console.log(`  → Combined into section ${currentSection.section} with faculty: ${currentSection.faculty}\n`);
                    
                    // Don't increment i, check the same position again
                    continue;
                }
            }
        }
        i++;
    }
});

console.log(`Fixed ${fixedCount} team teaching cases`);
console.log('New total sections:', courses.reduce((sum, course) => sum + course.sections.length, 0));

// Write the fixed data back
const newData = data.replace(
    /export const courses = \[[\s\S]*\];/,
    `export const courses = ${JSON.stringify(courses, null, 2)};`
);

fs.writeFileSync('public/courses-data.js', newData);
console.log('\nFixed data written to courses-data.js');
