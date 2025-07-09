const fs = require('fs');

// Read the courses data
const data = fs.readFileSync('./public/courses-data.js', 'utf8');
const coursesMatch = data.match(/export const courses = (\[[\s\S]*\]);/);

if (!coursesMatch) {
  console.log('Could not parse courses data');
  process.exit(1);
}

const courses = JSON.parse(coursesMatch[1]);

// More sophisticated analysis
console.log('=== ANALYZING COURSE PATTERNS ===\n');

// 1. Look for sections with very similar section numbers (like 6a, 6b pattern)
// 2. Look for consecutive sections with identical time slots and class patterns
// 3. Check for patterns in real university data

let potentialMultipleFaculty = [];
let realDuplicates = [];

courses.forEach(course => {
  const sectionGroups = new Map();
  
  // Group sections by their time patterns
  course.sections.forEach(section => {
    const timeKey = section.times.map(t => t.time).sort().join(' | ');
    
    if (!sectionGroups.has(timeKey)) {
      sectionGroups.set(timeKey, []);
    }
    sectionGroups.get(timeKey).push(section);
  });
  
  // Check each time group for potential multiple faculty scenarios
  sectionGroups.forEach((sections, timePattern) => {
    if (sections.length > 1) {
      // Check if these are really the same section with multiple faculty
      // or just different sections that happen to have the same time
      
      // Look for patterns that indicate multiple faculty in same section:
      // 1. Consecutive section numbers (1,2 or 6,7)
      // 2. Same section number with letters (6a, 6b)
      // 3. Very close section numbers with identical everything else
      
      const sectionNumbers = sections.map(s => {
        const match = s.section.match(/(\d+)([a-zA-Z]*)/);
        return match ? { num: parseInt(match[1]), letter: match[2] } : { num: parseInt(s.section), letter: '' };
      }).sort((a, b) => a.num - b.num);
      
      let isLikelyMultipleFaculty = false;
      
      // Check for consecutive numbers
      for (let i = 0; i < sectionNumbers.length - 1; i++) {
        const current = sectionNumbers[i];
        const next = sectionNumbers[i + 1];
        
        if (next.num - current.num === 1 && current.letter === '' && next.letter === '') {
          isLikelyMultipleFaculty = true;
          break;
        }
      }
      
      // Check for letter variants of same number
      const baseNumbers = [...new Set(sectionNumbers.map(s => s.num))];
      if (baseNumbers.length === 1 && sectionNumbers.some(s => s.letter !== '')) {
        isLikelyMultipleFaculty = true;
      }
      
      if (isLikelyMultipleFaculty) {
        potentialMultipleFaculty.push({
          course: course.code,
          sections: sections,
          timePattern: timePattern,
          reason: 'Consecutive or letter-variant sections'
        });
      } else {
        // These might just be regular sections that happen to have same time
        realDuplicates.push({
          course: course.code,
          sections: sections,
          timePattern: timePattern,
          reason: 'Same time, different sections'
        });
      }
    }
  });
});

console.log('=== LIKELY MULTIPLE FACULTY CASES ===');
console.log(`Found ${potentialMultipleFaculty.length} likely cases:\n`);

potentialMultipleFaculty.forEach((item, index) => {
  if (index < 10) { // Show first 10 examples
    console.log(`${item.course}:`);
    item.sections.forEach(section => {
      console.log(`  Section ${section.section}: ${section.faculty}`);
    });
    console.log(`  Time: ${item.timePattern}`);
    console.log(`  Reason: ${item.reason}\n`);
  }
});

console.log('=== REGULAR DUPLICATES (NOT MULTIPLE FACULTY) ===');
console.log(`Found ${realDuplicates.length} regular duplicate cases:\n`);

realDuplicates.slice(0, 5).forEach(item => {
  console.log(`${item.course}:`);
  item.sections.forEach(section => {
    console.log(`  Section ${section.section}: ${section.faculty}`);
  });
  console.log(`  Time: ${item.timePattern}`);
  console.log(`  Reason: ${item.reason}\n`);
});

// Let's also check the specific case you mentioned (CSE246)
console.log('=== CHECKING CSE246 SPECIFICALLY ===');
const cse246 = courses.find(c => c.code === 'CSE246');
if (cse246) {
  console.log('CSE246 sections:');
  cse246.sections.forEach(section => {
    console.log(`  Section ${section.section}: ${section.faculty}`);
    console.log(`    Times: ${section.times.map(t => t.time).join(', ')}`);
  });
}
