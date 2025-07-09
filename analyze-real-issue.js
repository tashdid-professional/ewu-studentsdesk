const fs = require('fs');

// Read the courses data
const data = fs.readFileSync('public/courses-data.js', 'utf8');
const coursesMatch = data.match(/export const courses = (\[[\s\S]*\]);/);
const courses = JSON.parse(coursesMatch[1]);

console.log('=== ANALYZING REAL MULTIPLE FACULTY ISSUE ===\n');

// Look for cases where consecutive sections have same times but different faculty
// This suggests they might be the same section with team teaching
let realIssues = [];

courses.forEach(course => {
    const sections = course.sections;
    
    // Check consecutive sections for same times but different faculty
    for (let i = 0; i < sections.length - 1; i++) {
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
                    realIssues.push({
                        course: course.code,
                        section1: currentSection.section,
                        section2: nextSection.section,
                        faculty1: currentSection.faculty,
                        faculty2: nextSection.faculty,
                        times: currentTimes
                    });
                }
            }
        }
    }
});

console.log(`Found ${realIssues.length} potential team teaching cases:\n`);

realIssues.forEach(issue => {
    console.log(`${issue.course} sections ${issue.section1} & ${issue.section2}:`);
    console.log(`  Faculty: ${issue.faculty1} & ${issue.faculty2}`);
    console.log(`  Times: ${issue.times.join(', ')}`);
    console.log('');
});

// Also check for exact section duplicates (same course, same section number)
console.log('\n=== CHECKING FOR EXACT SECTION DUPLICATES ===\n');

let duplicates = [];
courses.forEach(course => {
    const sectionMap = new Map();
    
    course.sections.forEach(section => {
        const key = `${course.code}-${section.section}`;
        if (sectionMap.has(key)) {
            duplicates.push({
                course: course.code,
                section: section.section,
                existing: sectionMap.get(key),
                duplicate: section
            });
        } else {
            sectionMap.set(key, section);
        }
    });
});

if (duplicates.length > 0) {
    console.log(`Found ${duplicates.length} exact section duplicates:`);
    duplicates.forEach(dup => {
        console.log(`${dup.course} section ${dup.section}:`);
        console.log(`  First: ${dup.existing.faculty} - ${dup.existing.times.map(t => t.time).join(', ')}`);
        console.log(`  Second: ${dup.duplicate.faculty} - ${dup.duplicate.times.map(t => t.time).join(', ')}`);
        console.log('');
    });
} else {
    console.log('No exact section duplicates found.');
}
