const fs = require('fs');

// Read the courses data
const data = fs.readFileSync('public/courses-data.js', 'utf8');
const coursesMatch = data.match(/export const courses = (\[[\s\S]*\]);/);
const courses = JSON.parse(coursesMatch[1]);

console.log('=== FINDING SECTIONS WITH THEORY + LAB NEEDING FACULTY COMBINATION ===\n');

// Look for sections that appear to have theory + lab but only single faculty
// These would be sections with multiple time slots where theory and lab might have different instructors

let needsCombining = [];
let alreadyCombined = [];

courses.forEach(course => {
    course.sections.forEach(section => {
        if (section.faculty.includes(' & ')) {
            // Already has combined faculty
            alreadyCombined.push({
                course: course.code,
                section: section.section,
                faculty: section.faculty,
                times: section.times.map(t => t.time)
            });
        } else if (section.times.length > 1) {
            // Has multiple time slots but single faculty - might need combination
            const times = section.times.map(t => t.time);
            
            // Look for patterns that suggest theory + lab
            // Lab sessions are often longer (3+ hours) or have specific patterns
            const hasLabPattern = times.some(time => {
                // Check for lab-like time patterns
                const duration = calculateDuration(time);
                return duration >= 180 || // 3+ hours
                       time.includes('AM - 0') || // Morning to afternoon
                       time.includes(':50 PM') || // Ending at :50 (common lab pattern)
                       time.includes(':10 PM') || // Ending at :10 (common lab pattern)
                       time.includes(':30 PM');   // Ending at :30 (common lab pattern)
            });
            
            if (hasLabPattern) {
                needsCombining.push({
                    course: course.code,
                    section: section.section,
                    faculty: section.faculty,
                    times: times
                });
            }
        }
    });
});

function calculateDuration(timeString) {
    // Extract start and end times
    const match = timeString.match(/(\d{1,2}):(\d{2}) (AM|PM) - (\d{1,2}):(\d{2}) (AM|PM)/);
    if (!match) return 0;
    
    const [, startHour, startMin, startAmPm, endHour, endMin, endAmPm] = match;
    
    // Convert to 24-hour format
    let start24 = parseInt(startHour);
    if (startAmPm === 'PM' && start24 !== 12) start24 += 12;
    if (startAmPm === 'AM' && start24 === 12) start24 = 0;
    
    let end24 = parseInt(endHour);
    if (endAmPm === 'PM' && end24 !== 12) end24 += 12;
    if (endAmPm === 'AM' && end24 === 12) end24 = 0;
    
    // Calculate duration in minutes
    const startMinutes = start24 * 60 + parseInt(startMin);
    const endMinutes = end24 * 60 + parseInt(endMin);
    
    return endMinutes - startMinutes;
}

console.log(`Already combined sections: ${alreadyCombined.length}`);
alreadyCombined.forEach(item => {
    console.log(`  ${item.course} section ${item.section}: ${item.faculty}`);
});

console.log(`\nSections that might need faculty combination: ${needsCombining.length}`);
console.log(`\nFirst 20 examples of sections with theory + lab patterns but single faculty:\n`);

needsCombining.slice(0, 20).forEach(item => {
    console.log(`${item.course} section ${item.section} (${item.faculty}):`);
    item.times.forEach(time => {
        const duration = calculateDuration(time);
        console.log(`  ${time} (${duration} min)`);
    });
    console.log('');
});

if (needsCombining.length > 20) {
    console.log(`... and ${needsCombining.length - 20} more sections`);
}
