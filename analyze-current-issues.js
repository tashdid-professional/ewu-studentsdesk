const fs = require('fs');

// Read the current courses data
const data = fs.readFileSync('./public/courses-data.js', 'utf8');
const coursesMatch = data.match(/export const courses = (\[[\s\S]*\]);/);

if (!coursesMatch) {
  console.log('Could not parse courses data');
  process.exit(1);
}

const courses = JSON.parse(coursesMatch[1]);

console.log('=== ANALYZING REMAINING ISSUES ===\n');

let issuesFound = 0;
let totalSections = 0;
let sectionsWithMultipleFaculty = 0;

courses.forEach(course => {
  totalSections += course.sections.length;
  
  // Check for multiple faculty
  course.sections.forEach(section => {
    if (section.faculty.includes(' & ')) {
      sectionsWithMultipleFaculty++;
    }
  });
  
  // Find sections with same times but different faculty (potential issues)
  const timeMap = new Map();
  course.sections.forEach(section => {
    const timeKey = section.times.map(t => t.time).sort().join('|');
    
    if (timeMap.has(timeKey)) {
      const existingSection = timeMap.get(timeKey);
      if (existingSection.faculty !== section.faculty) {
        console.log(`❌ ISSUE in ${course.code}:`);
        console.log(`   Section ${existingSection.section} (${existingSection.faculty}) vs Section ${section.section} (${section.faculty})`);
        console.log(`   Same times: ${timeKey.replace(/\|/g, ' + ')}`);
        console.log('');
        issuesFound++;
      }
    } else {
      timeMap.set(timeKey, section);
    }
  });
  
  // Check for missing consecutive sections (gaps in section numbers)
  const sectionNumbers = course.sections.map(s => parseInt(s.section)).filter(n => !isNaN(n)).sort((a, b) => a - b);
  for (let i = 0; i < sectionNumbers.length - 1; i++) {
    if (sectionNumbers[i + 1] - sectionNumbers[i] > 1) {
      // There's a gap - might indicate a removed section
      for (let missing = sectionNumbers[i] + 1; missing < sectionNumbers[i + 1]; missing++) {
        console.log(`⚠️  MISSING: ${course.code} Section ${missing} (possible combined section)`);
      }
    }
  }
});

console.log('\n=== SUMMARY ===');
console.log(`Total courses: ${courses.length}`);
console.log(`Total sections: ${totalSections}`);
console.log(`Sections with multiple faculty: ${sectionsWithMultipleFaculty}`);
console.log(`Issues found (same times, different faculty): ${issuesFound}`);

// Show examples of sections with multiple faculty
console.log('\n=== SECTIONS WITH MULTIPLE FACULTY (first 20) ===');
let count = 0;
courses.forEach(course => {
  course.sections.forEach(section => {
    if (section.faculty.includes(' & ') && count < 20) {
      console.log(`${course.code} Section ${section.section}: ${section.faculty}`);
      count++;
    }
  });
});
