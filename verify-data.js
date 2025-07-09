const fs = require('fs');
const data = fs.readFileSync('./public/courses-data.js', 'utf8');
const courses = JSON.parse(data.match(/export const courses = \[[\s\S]*\];/)[1]);

console.log('=== EXAMPLES OF MULTIPLE FACULTY SECTIONS ===');
let count = 0;
courses.forEach(course => {
  course.sections.forEach(section => {
    if (section.faculty.includes(' & ') && count < 15) {
      console.log(`${course.code} Section ${section.section}: ${section.faculty}`);
      count++;
    }
  });
});

console.log('\n=== STATISTICS ===');
const stats = {
  total: 0,
  single: 0,
  double: 0,
  triple: 0,
  quad: 0,
  more: 0
};

courses.forEach(course => {
  course.sections.forEach(section => {
    stats.total++;
    const facultyCount = section.faculty.split(' & ').length;
    if (facultyCount === 1) stats.single++;
    else if (facultyCount === 2) stats.double++;
    else if (facultyCount === 3) stats.triple++;
    else if (facultyCount === 4) stats.quad++;
    else stats.more++;
  });
});

console.log(`Total sections: ${stats.total}`);
console.log(`Single faculty: ${stats.single} (${(stats.single/stats.total*100).toFixed(1)}%)`);
console.log(`Two faculty: ${stats.double} (${(stats.double/stats.total*100).toFixed(1)}%)`);
console.log(`Three faculty: ${stats.triple} (${(stats.triple/stats.total*100).toFixed(1)}%)`);
console.log(`Four faculty: ${stats.quad} (${(stats.quad/stats.total*100).toFixed(1)}%)`);
console.log(`More than four: ${stats.more} (${(stats.more/stats.total*100).toFixed(1)}%)`);
