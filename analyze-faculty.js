const fs = require('fs');

// Read the courses data
const data = fs.readFileSync('./public/courses-data.js', 'utf8');
const coursesMatch = data.match(/export const courses = (\[[\s\S]*\]);/);

if (!coursesMatch) {
  console.log('Could not parse courses data');
  process.exit(1);
}

const courses = JSON.parse(coursesMatch[1]);
let potentialDuplicates = [];
let existingMultipleFaculty = [];

courses.forEach(course => {
  const timeMap = new Map();
  
  course.sections.forEach(section => {
    // Check for existing multiple faculty (with &, /, or comma)
    if (section.faculty.includes('&') || section.faculty.includes('/') || section.faculty.includes(',')) {
      existingMultipleFaculty.push({
        course: course.code,
        section: section.section,
        faculty: section.faculty
      });
    }
    
    // Check for same times with different faculty
    const timeKey = section.times.map(t => t.time).sort().join('|');
    if (timeMap.has(timeKey)) {
      const existingSection = timeMap.get(timeKey);
      if (existingSection.faculty !== section.faculty) {
        potentialDuplicates.push({
          course: course.code,
          section1: existingSection,
          section2: section,
          time: timeKey
        });
      }
    } else {
      timeMap.set(timeKey, section);
    }
  });
});

console.log('=== EXISTING MULTIPLE FACULTY ENTRIES ===');
console.log(`Found ${existingMultipleFaculty.length} sections with multiple faculty:`);
existingMultipleFaculty.forEach(entry => {
  console.log(`${entry.course} Section ${entry.section}: ${entry.faculty}`);
});

console.log('\n=== POTENTIAL DUPLICATE SECTIONS (Same time, different faculty) ===');
console.log(`Found ${potentialDuplicates.length} potential cases:`);
potentialDuplicates.slice(0, 20).forEach(dup => {
  console.log(`${dup.course}: Section ${dup.section1.section} (${dup.section1.faculty}) & Section ${dup.section2.section} (${dup.section2.faculty})`);
  console.log(`  Time: ${dup.time.replace(/\|/g, ' + ')}`);
});

// Generate suggestions for fixes
console.log('\n=== SUGGESTED FIXES ===');
const fixes = potentialDuplicates.slice(0, 20).map(dup => ({
  course: dup.course,
  sectionToKeep: dup.section1.section,
  sectionToRemove: dup.section2.section,
  combinedFaculty: `${dup.section1.faculty} & ${dup.section2.faculty}`,
  times: dup.section1.times
}));

fixes.forEach(fix => {
  console.log(`${fix.course} Section ${fix.sectionToKeep}: "${fix.combinedFaculty}" (remove section ${fix.sectionToRemove})`);
});
