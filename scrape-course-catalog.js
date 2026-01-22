const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeCourseDetails() {
  try {
    console.log('🔍 Fetching course catalog page...');
    const { data: html } = await axios.get('https://fse.ewubd.edu/computer-science-engineering/course-catalog', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(html);
    const courses = [];
    
    // Find all course panels in accordion
    $('.panel.panel-default').each((index, element) => {
      const $panel = $(element);
      
      // Get course code and name from panel title
      const titleText = $panel.find('.panel-title a').text().trim();
      const codeMatch = titleText.match(/([A-Z]{3}\s*\d{3})/);
      
      if (!codeMatch) return;
      
      const courseCode = codeMatch[1].replace(/\s+/g, '');
      const courseName = titleText.replace(codeMatch[0], '').replace(':', '').trim();
      
      // Get the full panel body content
      const $panelBody = $panel.find('.panel-body');
      const fullText = $panelBody.text();
      
      // Extract credit hours from the table
      let creditHours = '';
      const creditTable = $panelBody.find('table').first();
      creditTable.find('tr').each((i, row) => {
        const $row = $(row);
        const firstCell = $row.find('td').first().text().trim();
        if (firstCell.toLowerCase().includes('credit hours')) {
          const theoryCredit = $row.find('td').eq(1).text().trim();
          const labCredit = $row.find('td').eq(2).text().trim();
          const totalCredit = $row.find('td').eq(3).text().trim();
          creditHours = `Theory: ${theoryCredit}, Lab: ${labCredit}, Total: ${totalCredit}`;
        }
      });
      
      // Extract prerequisites
      let prerequisites = 'None';
      const prereqMatch = fullText.match(/Prerequisite:\s*([^\n]+)/i);
      if (prereqMatch) {
        prerequisites = prereqMatch[1].trim().replace(/\s+/g, ' ');
      }
      
      // Extract course objective
      let objectives = '';
      const objMatch = fullText.match(/Course Objective:\s*([^]+?)(?=Course Outcomes|Course Contents|Prerequisite|$)/i);
      if (objMatch) {
        objectives = objMatch[1].trim().replace(/\s+/g, ' ').substring(0, 500);
      }
      
      // Extract course outcomes
      let outcomes = [];
      const coTables = $panelBody.find('table');
      coTables.each((i, table) => {
        const $table = $(table);
        const headerText = $table.prev('p').text();
        if (headerText.toLowerCase().includes('course outcomes')) {
          $table.find('tbody tr').each((j, row) => {
            const $row = $(row);
            const coNum = $row.find('td').eq(0).text().trim();
            const coDesc = $row.find('td').eq(1).text().trim();
            if (coNum && coDesc) {
              outcomes.push(`${coNum}: ${coDesc.replace(/\s+/g, ' ')}`);
            }
          });
        }
      });
      
      // Extract course contents/topics
      let courseContents = [];
      coTables.each((i, table) => {
        const $table = $(table);
        const prevText = $table.prev('p').text();
        if (prevText.toLowerCase().includes('course contents') || 
            prevText.toLowerCase().includes('course topic')) {
          $table.find('tbody tr').each((j, row) => {
            const $row = $(row);
            const topic = $row.find('td').eq(0).text().trim();
            if (topic && topic.length > 3) {
              courseContents.push(topic.replace(/\s+/g, ' '));
            }
          });
        }
      });
      
      courses.push({
        courseCode: courseCode,
        courseName: courseName,
        creditHours: creditHours || 'Not specified',
        prerequisites: prerequisites,
        objectives: objectives || 'Not available',
        outcomes: outcomes.length > 0 ? outcomes : ['Not available'],
        courseContents: courseContents.length > 0 ? courseContents : ['Not available']
      });
    });
    
    console.log(`✅ Successfully scraped ${courses.length} courses`);
    
    if (courses.length === 0) {
      console.log('⚠️  No courses found. The website structure might be different.');
      console.log('💡 Saving HTML for manual inspection...');
      fs.writeFileSync('./page-structure.html', html);
      console.log('📄 HTML saved to page-structure.html - check it to find the correct selectors');
      return;
    }
    
    // Save as JavaScript export file
    const jsContent = `export const courseDetails = ${JSON.stringify(courses, null, 2)};`;
    fs.writeFileSync('./public/course-details.js', jsContent);
    console.log('📁 Saved to: public/course-details.js');
    
    // Also save as JSON for easy viewing
    fs.writeFileSync('./public/course-details.json', JSON.stringify(courses, null, 2));
    console.log('📁 Also saved as: public/course-details.json');
    
    // Display sample
    console.log('\n📊 Sample of scraped data:');
    console.log(JSON.stringify(courses[0], null, 2));
    
  } catch (error) {
    console.error('❌ Error occurred:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Check if the URL is correct and accessible');
    }
  }
}

scrapeCourseDetails();
