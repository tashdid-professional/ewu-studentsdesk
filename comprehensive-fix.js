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

console.log('=== COMPREHENSIVE FACULTY COMBINING ===\n');

// Process each course
courses.forEach(course => {
  const timeToSectionsMap = new Map();
  const sectionsToRemove = new Set();
  
  // Group sections by identical time slots
  course.sections.forEach((section, index) => {
    const timeKey = section.times.map(t => t.time).sort().join('|');
    
    if (timeToSectionsMap.has(timeKey)) {
      timeToSectionsMap.get(timeKey).push({ section, index });
    } else {
      timeToSectionsMap.set(timeKey, [{ section, index }]);
    }
  });
  
  // For each time slot, combine sections with different faculty
  timeToSectionsMap.forEach((sectionsGroup, timeKey) => {
    if (sectionsGroup.length > 1) {
      // Multiple sections with same time - combine their faculty
      const uniqueFaculty = new Set();
      const baseSectionData = sectionsGroup[0];
      
      // Collect all unique faculty members
      sectionsGroup.forEach(({ section }) => {
        // Split existing faculty if already combined (handle & separator)
        const facultyNames = section.faculty.split(' & ').map(name => name.trim());
        facultyNames.forEach(name => uniqueFaculty.add(name));
      });
      
      // Skip if all have the same faculty (like multiple TBA sections)
      if (uniqueFaculty.size === 1) {
        return;
      }
      
      // Combine faculty names
      const combinedFaculty = Array.from(uniqueFaculty).join(' & ');
      
      // Update the first section with combined faculty
      baseSectionData.section.faculty = combinedFaculty;
      
      // Mark other sections for removal
      for (let i = 1; i < sectionsGroup.length; i++) {
        sectionsToRemove.add(sectionsGroup[i].index);
        sectionsRemoved++;
      }
      
      console.log(`${course.code} Section ${baseSectionData.section.section}: Combined ${uniqueFaculty.size} faculty -> "${combinedFaculty}"`);
      fixesApplied++;
    }
  });
  
  // Remove duplicate sections (in reverse order to maintain indices)
  const indicesToRemove = Array.from(sectionsToRemove).sort((a, b) => b - a);
  indicesToRemove.forEach(index => {
    course.sections.splice(index, 1);
  });
});

console.log(`\n=== SUMMARY ===`);
console.log(`Courses processed: ${courses.length}`);
console.log(`Time slots with multiple faculty combined: ${fixesApplied}`);
console.log(`Duplicate sections removed: ${sectionsRemoved}`);

// Calculate final statistics
let totalSections = 0;
let multipleFacultySections = 0;

courses.forEach(course => {
  course.sections.forEach(section => {
    totalSections++;
    if (section.faculty.includes(' & ')) {
      multipleFacultySections++;
    }
  });
});

console.log(`Final total sections: ${totalSections}`);
console.log(`Sections with multiple faculty: ${multipleFacultySections} (${(multipleFacultySections/totalSections*100).toFixed(1)}%)`);

// Write the updated data back to the file
const updatedData = data.replace(
  /export const courses = \[[\s\S]*\];/,
  `export const courses = ${JSON.stringify(courses, null, 2)};`
);

fs.writeFileSync('./public/courses-data.js', updatedData);
console.log('\n✅ Updated courses-data.js with combined faculty members');

// Verify no remaining duplicates
console.log('\n=== VERIFICATION ===');
let remainingIssues = 0;

courses.forEach(course => {
  const timeMap = new Map();
  course.sections.forEach(section => {
    const timeKey = section.times.map(t => t.time).sort().join('|');
    if (timeMap.has(timeKey)) {
      const existing = timeMap.get(timeKey);
      if (existing.faculty !== section.faculty) {
        console.log(`❌ Still duplicate: ${course.code} Section ${existing.section} (${existing.faculty}) vs Section ${section.section} (${section.faculty})`);
        remainingIssues++;
      }
    } else {
      timeMap.set(timeKey, section);
    }
  });
});

console.log(`Remaining issues: ${remainingIssues}`);
if (remainingIssues === 0) {
  console.log('✅ All duplicate sections successfully combined!');
}
