const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeBusinessCourses() {
  try {
    console.log('🔍 Fetching Business Administration course catalog page...');
    const { data: html } = await axios.get('https://fbe.ewubd.edu/business-administration/course-catalog', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(html);
    const courses = [];
    
    console.log('\n🔎 Parsing Business Administration courses...');
    
    // Find all panels in the accordion
    $('.panel.panel-default').each((index, element) => {
      const $panel = $(element);
      
      // Get course code and name from panel heading
      const titleText = $panel.find('.panel-heading h4 a').text().trim();
      
      // Match course code pattern (e.g., "ACT 101: Financial Accounting")
      const match = titleText.match(/([A-Z]{3}(?:\/[A-Z]{3})?\s*\d{3}):\s*(.+)/);
      
      if (match) {
        const courseCode = match[1].replace(/\s+/g, '');
        const courseName = match[2].trim();
        
        // Get the panel body content
        const $panelBody = $panel.find('.panel-body');
        const fullText = $panelBody.text().trim().replace(/\s+/g, ' ');
        
        // Extract credit hours
        let creditHours = 'Not specified';
        const creditMatch = fullText.match(/Credits?:\s*(\d+(?:\.\d+)?)/i);
        if (creditMatch) {
          creditHours = creditMatch[1];
        }
        
        // Extract prerequisites
        let prerequisites = 'None';
        const prereqMatch = fullText.match(/Prerequisite[s]?:\s*([^;.]+)/i);
        if (prereqMatch) {
          prerequisites = prereqMatch[1].trim().replace(/\s+/g, ' ');
        }
        
        // Extract course description/objectives (everything before "Credits:")
        let objectives = 'Not available';
        const objectiveMatch = fullText.match(/^(.+?)(?=Credits?:|$)/i);
        if (objectiveMatch) {
          objectives = objectiveMatch[1].trim().replace(/\s+/g, ' ');
          // Limit to reasonable length
          if (objectives.length > 800) {
            objectives = objectives.substring(0, 800) + '...';
          }
        }
        
        courses.push({
          courseCode: courseCode,
          courseName: courseName,
          creditHours: creditHours,
          prerequisites: prerequisites,
          objectives: objectives,
          outcomes: ['Not available'],
          courseContents: ['Not available']
        });
        
        console.log(`✓ Found: ${courseCode} - ${courseName}`);
      }
    });
    
    console.log(`\n✅ Successfully scraped ${courses.length} Business Administration courses`);
    
    if (courses.length === 0) {
      console.log('⚠️  No courses found.');
      return;
    }
    
    // Load existing courses
    let existingCourses = [];
    try {
      const existingData = fs.readFileSync('./public/course-details.js', 'utf-8');
      const match = existingData.match(/export const courseDetails = (\[[\s\S]*\]);/);
      if (match) {
        existingCourses = JSON.parse(match[1]);
        console.log(`📚 Found ${existingCourses.length} existing courses`);
      }
    } catch (error) {
      console.log('ℹ️  No existing courses found, starting fresh');
    }
    
    // Merge courses (update existing or add new)
    const allCourses = [...existingCourses];
    let addedCount = 0;
    let updatedCount = 0;
    
    courses.forEach(newCourse => {
      const existingIndex = allCourses.findIndex(c => c.courseCode === newCourse.courseCode);
      if (existingIndex === -1) {
        allCourses.push(newCourse);
        addedCount++;
      } else {
        // Update existing course with new data
        allCourses[existingIndex] = newCourse;
        updatedCount++;
      }
    });
    
    console.log(`\n📊 Added ${addedCount} new courses, updated ${updatedCount} existing courses`);
    console.log(`📊 Total courses after merge: ${allCourses.length}`);
    
    // Save merged data
    const jsContent = `export const courseDetails = ${JSON.stringify(allCourses, null, 2)};`;
    fs.writeFileSync('./public/course-details.js', jsContent);
    console.log('📁 Saved to: public/course-details.js');
    
    // Also save as JSON
    fs.writeFileSync('./public/course-details.json', JSON.stringify(allCourses, null, 2));
    console.log('📁 Also saved as: public/course-details.json');
    
    // Display sample
    if (courses.length > 0) {
      console.log('\n📊 Sample of Business Administration course:');
      console.log(JSON.stringify(courses[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error occurred:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

scrapeBusinessCourses();
