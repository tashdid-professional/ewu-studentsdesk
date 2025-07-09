import { courses } from './public/courses-data.js';

function verifyDataIntegrity() {
  console.log('=== Final Data Verification ===\n');
  
  // Track sections with multiple faculty
  let sectionsWithMultipleFaculty = 0;
  let totalSections = 0;
  
  // Track potential duplicate time issues
  const timeSlotMap = new Map();
  
  courses.forEach(course => {
    course.sections.forEach(section => {
      totalSections++;
      
      // Check for multiple faculty
      if (section.faculty.includes(' & ')) {
        sectionsWithMultipleFaculty++;
      }
      
      // Check for potential duplicate time issues
      if (section.times && section.times.length > 0) {
        const timeKey = section.times.map(t => t.time).sort().join('|');
        const sectionKey = `${course.code}_${timeKey}`;
        
        if (!timeSlotMap.has(sectionKey)) {
          timeSlotMap.set(sectionKey, []);
        }
        timeSlotMap.get(sectionKey).push({
          course: course.code,
          section: section.section,
          faculty: section.faculty,
          times: section.times
        });
      }
    });
  });
  
  console.log(`Total sections: ${totalSections}`);
  console.log(`Sections with multiple faculty: ${sectionsWithMultipleFaculty} (${(sectionsWithMultipleFaculty/totalSections*100).toFixed(1)}%)`);
  
  // Check for any remaining duplicate time issues
  let duplicateTimeIssues = 0;
  timeSlotMap.forEach((sections, timeKey) => {
    if (sections.length > 1) {
      // Check if these are actually different sections (different faculty)
      const uniqueFaculty = [...new Set(sections.map(s => s.faculty))];
      if (uniqueFaculty.length > 1) {
        duplicateTimeIssues++;
        console.log(`\nPotential issue found:`);
        console.log(`Course: ${sections[0].course}`);
        console.log(`Time slot: ${timeKey}`);
        sections.forEach(s => {
          console.log(`  Section ${s.section}: Faculty ${s.faculty}`);
        });
      }
    }
  });
  
  console.log(`\nDuplicate time issues found: ${duplicateTimeIssues}`);
  
  // Show some examples of successfully combined faculty
  console.log('\n=== Examples of Combined Faculty ===');
  let exampleCount = 0;
  courses.forEach(course => {
    if (exampleCount >= 5) return;
    course.sections.forEach(section => {
      if (exampleCount >= 5) return;
      if (section.faculty.includes(' & ')) {
        console.log(`${course.code} Section ${section.section}: ${section.faculty}`);
        exampleCount++;
      }
    });
  });
  
  console.log('\n=== Verification Complete ===');
  console.log(duplicateTimeIssues === 0 ? 'SUCCESS: No duplicate time issues found!' : `WARNING: ${duplicateTimeIssues} issues need attention`);
}

verifyDataIntegrity();
