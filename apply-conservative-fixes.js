const fs = require('fs');

// Read the courses data
const data = fs.readFileSync('./public/courses-data.js', 'utf8');
const coursesMatch = data.match(/export const courses = (\[[\s\S]*\]);/);

if (!coursesMatch) {
  console.log('Could not parse courses data');
  process.exit(1);
}

const courses = JSON.parse(coursesMatch[1]);

let fixesApplied = 0;
let sectionsRemoved = 0;

courses.forEach(course => {
  const sections = course.sections.sort((a, b) => {
    const aNum = parseInt(a.section);
    const bNum = parseInt(b.section);
    return aNum - bNum;
  });

  // Work backwards to avoid index issues when removing sections
  for (let i = sections.length - 2; i >= 0; i--) {
    const current = sections[i];
    const next = sections[i + 1];
    
    // Check if they are consecutive sections
    const currentNum = parseInt(current.section);
    const nextNum = parseInt(next.section);
    
    if (nextNum === currentNum + 1) {
      // Check if they have identical time patterns
      const currentTimes = current.times.map(t => t.time).sort().join('|');
      const nextTimes = next.times.map(t => t.time).sort().join('|');
      
      if (currentTimes === nextTimes) {
        // Check if faculty are different and neither already has multiple faculty
        if (current.faculty !== next.faculty && 
            !current.faculty.includes(' & ') && 
            !next.faculty.includes(' & ') &&
            current.faculty !== 'TBA' && next.faculty !== 'TBA') {
          
          // Combine faculty in the first section
          current.faculty = `${current.faculty} & ${next.faculty}`;
          
          // Remove the second section
          course.sections.splice(course.sections.indexOf(next), 1);
          
          console.log(`✓ ${course.code} Section ${current.section}: Combined "${current.faculty.split(' & ')[0]}" and "${current.faculty.split(' & ')[1]}" -> "${current.faculty}"`);
          
          fixesApplied++;
          sectionsRemoved++;
        }
      }
    }
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Applied ${fixesApplied} legitimate fixes`);
console.log(`Removed ${sectionsRemoved} duplicate sections`);

// Write the updated data back to the file
const updatedData = data.replace(
  /export const courses = \[[\s\S]*\];/,
  `export const courses = ${JSON.stringify(courses, null, 2)};`
);

// Write the updated file
fs.writeFileSync('./public/courses-data.js', updatedData);
console.log('Updated courses-data.js with properly combined faculty members');

// Verification
const verification = JSON.parse(updatedData.match(/export const courses = (\[[\s\S]*\]);/)[1]);

let totalSections = 0;
let multipleFacultySections = 0;

verification.forEach(course => {
  course.sections.forEach(section => {
    totalSections++;
    if (section.faculty.includes(' & ')) {
      multipleFacultySections++;
    }
  });
});

console.log(`\n=== FINAL STATS ===`);
console.log(`Total sections: ${totalSections}`);
console.log(`Sections with multiple faculty: ${multipleFacultySections}`);
console.log(`Percentage with multiple faculty: ${(multipleFacultySections/totalSections*100).toFixed(1)}%`);
