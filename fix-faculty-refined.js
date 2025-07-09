const fs = require('fs');

// Read the courses data
const data = fs.readFileSync('./public/courses-data-backup.js', 'utf8');
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
      const existingSectionData = timeMap.get(timeKey);
      const existingSection = course.sections[existingSectionData.index];
      
      // Skip if one of them is TBA and the other is also TBA (keep separate)
      if (existingSection.faculty === 'TBA' && section.faculty === 'TBA') {
        // Keep as separate sections for TBA cases
        return;
      }
      
      // Check if faculty are different and not already combined
      if (existingSection.faculty !== section.faculty && 
          !existingSection.faculty.includes(section.faculty) &&
          !section.faculty.includes(existingSection.faculty)) {
        
        // Special handling for TBA
        let combinedFaculty;
        if (existingSection.faculty === 'TBA') {
          combinedFaculty = section.faculty;
        } else if (section.faculty === 'TBA') {
          combinedFaculty = existingSection.faculty;
        } else {
          combinedFaculty = `${existingSection.faculty} & ${section.faculty}`;
        }
        
        existingSection.faculty = combinedFaculty;
        
        // Mark this section for removal
        sectionsToRemove.add(index);
        fixesApplied++;
        
        console.log(`Fixed ${course.code} Section ${existingSection.section}: "${combinedFaculty}"`);
      }
    } else {
      timeMap.set(timeKey, { section: section, index: index });
    }
  });
  
  // Remove duplicate sections (in reverse order to maintain indices)
  const indicesToRemove = Array.from(sectionsToRemove).sort((a, b) => b - a);
  indicesToRemove.forEach(index => {
    course.sections.splice(index, 1);
  });
});

console.log(`\nApplied ${fixesApplied} fixes to combine duplicate sections.`);

// Write the updated data back to the file
const updatedData = data.replace(
  /export const courses = \[[\s\S]*\];/,
  `export const courses = ${JSON.stringify(courses, null, 2)};`
);

// Write the updated file
fs.writeFileSync('./public/courses-data.js', updatedData);
console.log('Updated courses-data.js with combined faculty members');

// Quick verification
console.log('\nVerifying fixes...');
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

console.log(`Total sections: ${totalSections}`);
console.log(`Sections with multiple faculty: ${multipleFacultySections}`);
console.log(`Percentage with multiple faculty: ${(multipleFacultySections/totalSections*100).toFixed(1)}%`);
