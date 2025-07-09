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

// Find and fix duplicate sections
courses.forEach(course => {
  const timeMap = new Map();
  const sectionsToRemove = new Set();
  
  // First pass: identify duplicates
  course.sections.forEach((section, index) => {
    const timeKey = section.times.map(t => t.time).sort().join('|');
    
    if (timeMap.has(timeKey)) {
      const existingSectionIndex = timeMap.get(timeKey);
      const existingSection = course.sections[existingSectionIndex];
      
      // Check if faculty are different
      if (existingSection.faculty !== section.faculty && 
          !existingSection.faculty.includes(section.faculty) &&
          !section.faculty.includes(existingSection.faculty)) {
        
        // Combine faculty names
        const combinedFaculty = `${existingSection.faculty} & ${section.faculty}`;
        existingSection.faculty = combinedFaculty;
        
        // Mark this section for removal
        sectionsToRemove.add(index);
        fixesApplied++;
        
        console.log(`Fixed ${course.code} Section ${existingSection.section}: Combined "${existingSection.faculty.replace(' & ' + section.faculty, '')}" and "${section.faculty}" -> "${combinedFaculty}"`);
      }
    } else {
      timeMap.set(timeKey, course.sections.indexOf(section));
    }
  });
  
  // Remove duplicate sections (in reverse order to maintain indices)
  const indicesToRemove = Array.from(sectionsToRemove).sort((a, b) => b - a);
  indicesToRemove.forEach(index => {
    console.log(`Removing duplicate section ${course.sections[index].section} from ${course.code}`);
    course.sections.splice(index, 1);
  });
});

console.log(`\nApplied ${fixesApplied} fixes to combine duplicate sections.`);

// Write the updated data back to the file
const updatedData = data.replace(
  /export const courses = \[[\s\S]*\];/,
  `export const courses = ${JSON.stringify(courses, null, 2)};`
);

// Create a backup first
fs.writeFileSync('./public/courses-data-backup.js', data);
console.log('Created backup: courses-data-backup.js');

// Write the updated file
fs.writeFileSync('./public/courses-data.js', updatedData);
console.log('Updated courses-data.js with combined faculty members');

console.log('\nNow checking for any remaining duplicates...');

// Verify the fixes
const verification = JSON.parse(updatedData.match(/export const courses = (\[[\s\S]*\]);/)[1]);
let remainingDuplicates = 0;

verification.forEach(course => {
  const timeMap = new Map();
  course.sections.forEach(section => {
    const timeKey = section.times.map(t => t.time).sort().join('|');
    if (timeMap.has(timeKey)) {
      remainingDuplicates++;
      console.log(`Still duplicate in ${course.code}: ${timeMap.get(timeKey).faculty} vs ${section.faculty}`);
    } else {
      timeMap.set(timeKey, section);
    }
  });
});

console.log(`Remaining duplicates: ${remainingDuplicates}`);
