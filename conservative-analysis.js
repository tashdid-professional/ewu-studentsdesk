const fs = require('fs');

// Read the courses data
const data = fs.readFileSync('./public/courses-data.js', 'utf8');
const coursesMatch = data.match(/export const courses = (\[[\s\S]*\]);/);

if (!coursesMatch) {
  console.log('Could not parse courses data');
  process.exit(1);
}

const courses = JSON.parse(coursesMatch[1]);

console.log('=== CURRENT STATE ANALYSIS ===\n');

// Check what we already have
let existingMultipleFaculty = [];
let totalSections = 0;

courses.forEach(course => {
  course.sections.forEach(section => {
    totalSections++;
    if (section.faculty.includes(' & ')) {
      existingMultipleFaculty.push({
        course: course.code,
        section: section.section,
        faculty: section.faculty,
        times: section.times.map(t => t.time).join(', ')
      });
    }
  });
});

console.log(`Total sections: ${totalSections}`);
console.log(`Existing sections with multiple faculty: ${existingMultipleFaculty.length}\n`);

console.log('=== EXISTING MULTIPLE FACULTY SECTIONS ===');
existingMultipleFaculty.forEach(item => {
  console.log(`${item.course} Section ${item.section}: ${item.faculty}`);
  console.log(`  Times: ${item.times}\n`);
});

// Now let's look for ONLY very specific patterns that indicate multiple faculty
// These should be CONSECUTIVE sections with IDENTICAL time patterns
console.log('=== POTENTIAL NEW MULTIPLE FACULTY CASES ===');

let trueDuplicates = [];

courses.forEach(course => {
  const sections = course.sections.sort((a, b) => {
    const aNum = parseInt(a.section);
    const bNum = parseInt(b.section);
    return aNum - bNum;
  });

  for (let i = 0; i < sections.length - 1; i++) {
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
          
          trueDuplicates.push({
            course: course.code,
            section1: current,
            section2: next,
            times: currentTimes
          });
        }
      }
    }
  }
});

console.log(`Found ${trueDuplicates.length} potential cases for combining:\n`);

trueDuplicates.forEach(item => {
  console.log(`${item.course}:`);
  console.log(`  Section ${item.section1.section}: ${item.section1.faculty}`);
  console.log(`  Section ${item.section2.section}: ${item.section2.faculty}`);
  console.log(`  Identical times: ${item.times.replace(/\|/g, ', ')}`);
  console.log(`  -> Could combine as: "${item.section1.faculty} & ${item.section2.faculty}"\n`);
});

if (trueDuplicates.length > 0) {
  console.log('\n=== RECOMMENDATION ===');
  console.log('These are the ONLY cases where combining faculty makes sense.');
  console.log('All other combinations in the previous script were incorrect.');
  console.log('\nWould you like to apply these specific fixes? (Y/N)');
} else {
  console.log('\nNo additional legitimate multiple faculty cases found.');
  console.log('The current data structure appears to be correct.');
}
