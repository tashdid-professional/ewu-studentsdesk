const fs = require('fs');

// Read the courses data
const data = fs.readFileSync('public/courses-data.js', 'utf8');
const coursesMatch = data.match(/export const courses = (\[[\s\S]*\]);/);
const courses = JSON.parse(coursesMatch[1]);

console.log('=== FINDING SECTIONS WITH 3 TIME SLOTS (2 THEORY + 1 LAB) ===\n');

let threeTimeSlots = [];

courses.forEach(course => {
    course.sections.forEach(section => {
        if (section.times.length === 3) {
            threeTimeSlots.push({
                course: course.code,
                section: section.section,
                faculty: section.faculty,
                times: section.times.map(t => t.time)
            });
        }
    });
});

console.log(`Found ${threeTimeSlots.length} sections with exactly 3 time slots:\n`);

// Show first 10 examples
threeTimeSlots.slice(0, 10).forEach(item => {
    console.log(`${item.course} section ${item.section} (${item.faculty}):`);
    item.times.forEach((time, idx) => {
        console.log(`  ${idx + 1}. ${time}`);
    });
    console.log('');
});

if (threeTimeSlots.length > 10) {
    console.log(`... and ${threeTimeSlots.length - 10} more sections with 3 time slots`);
}

// Also check sections with already combined faculty to see their pattern
console.log('\n=== SECTIONS WITH COMBINED FACULTY ===\n');
let combinedFaculty = [];

courses.forEach(course => {
    course.sections.forEach(section => {
        if (section.faculty.includes(' & ')) {
            combinedFaculty.push({
                course: course.code,
                section: section.section,
                faculty: section.faculty,
                times: section.times.map(t => t.time),
                timeCount: section.times.length
            });
        }
    });
});

combinedFaculty.forEach(item => {
    console.log(`${item.course} section ${item.section} (${item.timeCount} time slots):`);
    console.log(`  Faculty: ${item.faculty}`);
    item.times.forEach((time, idx) => {
        console.log(`  ${idx + 1}. ${time}`);
    });
    console.log('');
});
