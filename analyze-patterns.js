const fs = require('fs');

// Read the courses data
const data = fs.readFileSync('public/courses-data.js', 'utf8');
const coursesMatch = data.match(/export const courses = (\[[\s\S]*\]);/);
const courses = JSON.parse(coursesMatch[1]);

console.log('=== ANALYZING FOR THEORY + LAB PATTERNS ===\n');

// Look for courses that might have theory + lab components
// These often have time patterns like:
// - Regular class times (MW, TR, etc.) + Lab times (longer blocks, often with 3-hour durations)
// - Multiple time entries per section where one might be theory and another lab

let potentialTheoryLab = [];

courses.forEach(course => {
    course.sections.forEach(section => {
        if (section.times.length > 1) {
            // Check if there are different time patterns that might indicate theory + lab
            const times = section.times.map(t => t.time);
            
            // Look for lab patterns (typically 3+ hour blocks)
            const hasLabPattern = times.some(time => {
                // Lab patterns: 3+ hour blocks, or specific lab time patterns
                return time.includes('AM - ') && (
                    time.includes(':50 PM') || // 3+ hour blocks
                    time.includes(':30 PM') || 
                    time.includes(':10 PM') ||
                    time.includes(':00 PM')
                ) || time.includes('PM - ') && (
                    time.includes(':50 PM') ||
                    time.includes(':30 PM') ||
                    time.includes(':10 PM')
                );
            });
            
            if (hasLabPattern && times.length >= 2) {
                potentialTheoryLab.push({
                    course: course.code,
                    section: section.section,
                    faculty: section.faculty,
                    times: times
                });
            }
        }
    });
});

console.log(`Found ${potentialTheoryLab.length} sections with potential theory + lab patterns:\n`);

// Show first 10 examples
potentialTheoryLab.slice(0, 10).forEach(item => {
    console.log(`${item.course} section ${item.section} (${item.faculty}):`);
    item.times.forEach(time => {
        console.log(`  ${time}`);
    });
    console.log('');
});

if (potentialTheoryLab.length > 10) {
    console.log(`... and ${potentialTheoryLab.length - 10} more`);
}

// Also check for sections with combined faculty (already fixed)
let combinedFaculty = [];
courses.forEach(course => {
    course.sections.forEach(section => {
        if (section.faculty.includes(' & ')) {
            combinedFaculty.push({
                course: course.code,
                section: section.section,
                faculty: section.faculty
            });
        }
    });
});

console.log(`\n=== SECTIONS WITH COMBINED FACULTY (ALREADY FIXED) ===`);
console.log(`Found ${combinedFaculty.length} sections with combined faculty:\n`);

combinedFaculty.slice(0, 5).forEach(item => {
    console.log(`${item.course} section ${item.section}: ${item.faculty}`);
});

if (combinedFaculty.length > 5) {
    console.log(`... and ${combinedFaculty.length - 5} more`);
}
