const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const inputPath = path.join(__dirname, 'public', 'newFacultyList.csv');
const outputPath = path.join(__dirname, 'public', 'newFacultyList-cleaned.csv');

try {
  const content = fs.readFileSync(inputPath, 'utf8');
  
  // Parse CSV properly to handle quoted multi-line fields
  const parsed = Papa.parse(content, {
    header: false,
    skipEmptyLines: true,
    quoteChar: '"',
    delimiter: ','
  });
  
  console.log(`Reading ${parsed.data.length} rows from CSV...`);
  
  const cleanedLines = ['Course,Section,Faculty,Capacity,Timing'];
  let processedCount = 0;
  
  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i];
    if (!row || row.length === 0) continue;
    
    const firstCell = row[0] ? row[0].trim() : '';
    
    // Skip metadata rows
    if (firstCell.includes('East West') || 
        firstCell.includes('Offered Courses') || 
        firstCell.includes('Updated') ||
        firstCell.includes('Course Sec Faculty Capacity Timing Room No')) {
      console.log(`Skipping metadata row ${i + 1}: ${firstCell.substring(0, 50)}...`);
      continue;
    }
    
    // Look for actual course lines (start with course codes like CSE101, MAT101, etc.)
    const courseMatch = firstCell.match(/^([A-Z]{2,}[0-9]{3})/);
    if (courseMatch) {
      // Parse the course string: "CSE101 1 MAR 0/30 M 10:10 AM - 11:40 AM 529 (C. Lab-1)"
      const courseData = firstCell.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
      
      const match = courseData.match(/^([A-Z]+[0-9]+)\s+(\d+)\s+([A-Z]+)\s+(\d+\/\d+)\s+(.+?)\s+(\d+|\w+\d*-?\w*)\s*(\([^)]*\))?$/);
      
      if (match) {
        const course = match[1];          // CSE101
        const section = match[2];         // 1
        const faculty = match[3];         // MAR
        const capacity = match[4];        // 0/30
        const timing = match[5];          // M 10:10 AM - 11:40 AM
        // match[6] is room number, match[7] is room description - we ignore these
        
        cleanedLines.push(`${course},${section},${faculty},${capacity},${timing}`);
        processedCount++;
        
        if (processedCount <= 10) {
          console.log(`✅ Processed: ${course} | ${section} | ${faculty} | ${capacity} | ${timing}`);
        }
      } else {
        // Fallback: simpler parsing for different formats
        const parts = courseData.split(/\s+/);
        if (parts.length >= 5) {
          const course = parts[0];
          const section = parts[1];
          const faculty = parts[2];
          const capacity = parts[3];
          const timing = parts.slice(4).join(' ').replace(/\s+\d+.*$/, ''); // Remove room info at end
          
          cleanedLines.push(`${course},${section},${faculty},${capacity},${timing}`);
          processedCount++;
          
          if (processedCount <= 10) {
            console.log(`✅ Fallback: ${course} | ${section} | ${faculty} | ${capacity} | ${timing}`);
          }
        }
      }
    }
  }
  
  fs.writeFileSync(outputPath, cleanedLines.join('\n'));
  console.log(`\n🎉 Successfully processed ${processedCount} course records!`);
  console.log(`📁 Output saved as: faculty_list_spring-cleaned.csv`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('📍 Make sure the file exists at:', inputPath);
}