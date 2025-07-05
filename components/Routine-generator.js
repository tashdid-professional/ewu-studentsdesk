"use client";
import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

function RoutineGenerator() {
  const fileInput = useRef();
  const [routine, setRoutine] = useState(null);
  const [error, setError] = useState("");
  const [weeklySchedule, setWeeklySchedule] = useState(null);

  const parseTimeSlot = (timeStr) => {
    if (!timeStr) return null;
    
    // Handle various time formats from the advising slip
    // Examples: "W 1:30PM-3:09PM", "T 3:10PM-4:40PM", "S 10:10AM-12:00PM", "MW 4:50PM-6:20PM"
    
    // Clean the input string
    const cleanTimeStr = timeStr.toString().trim().replace(/\s+/g, ' ');
    
    // First try the standard format
    let match = cleanTimeStr.match(/([MTWRFSU]+)\s*(\d{1,2}:\d{2}[AP]M)-(\d{1,2}:\d{2}[AP]M)/);
    if (match) {
      const [, days, startTime, endTime] = match;
      return { days, startTime, endTime, original: timeStr };
    }
    
    // Try format without space between days and time
    match = cleanTimeStr.match(/([MTWRFSU]+)(\d{1,2}:\d{2}[AP]M)-(\d{1,2}:\d{2}[AP]M)/);
    if (match) {
      const [, days, startTime, endTime] = match;
      return { days, startTime, endTime, original: timeStr };
    }
    
    // Try format with different separators
    match = cleanTimeStr.match(/([MTWRFSU]+)[\s:]*(\d{1,2}:\d{2}[AP]M)[\s-]*(\d{1,2}:\d{2}[AP]M)/);
    if (match) {
      const [, days, startTime, endTime] = match;
      return { days, startTime, endTime, original: timeStr };
    }
    
    // Try to handle format like "MW4:50PM-6:20PM" (no space)
    match = cleanTimeStr.match(/([MTWRFSU]+)(\d{1,2}:\d{2}[AP]M-\d{1,2}:\d{2}[AP]M)/);
    if (match) {
      const [, days, timeRange] = match;
      const timeMatch = timeRange.match(/(\d{1,2}:\d{2}[AP]M)-(\d{1,2}:\d{2}[AP]M)/);
      if (timeMatch) {
        const [, startTime, endTime] = timeMatch;
        return { days, startTime, endTime, original: timeStr };
      }
    }
    
    console.log('Could not parse time:', timeStr, 'cleaned:', cleanTimeStr);
    return { original: timeStr };
  };

  const formatRoutine = (data) => {
    if (!data || data.length === 0) {
      setError("No data found in the Excel file.");
      return null;
    }

    console.log('Raw data:', data); // Debug

    // Dynamically find the header row
    let headerRowIndex = -1;
    let headers = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row && Array.isArray(row) && row.includes('Course(s)') && row.includes('Time-WeekDay')) {
        headerRowIndex = i;
        headers = row.map(h => h ? h.toString().trim() : '');
        break;
      }
    }

    if (headerRowIndex === -1) {
      console.error('Could not find the course table header row. Please ensure the Excel file contains a table with "Course(s)" and "Time-WeekDay" headers.');
      setError("Could not find a valid course table in the Excel file.");
      return { headers: ['Error'], rows: [['Could not find course table header.']], schedule: {} };
    }
    
    console.log('Found header row at index:', headerRowIndex, 'Headers:', headers);

    // Dynamically find column indices from the header
    const courseIdx = headers.indexOf('Course(s)');
    const secIdx = headers.indexOf('Sec');
    const creditIdx = headers.indexOf('Cr');
    const timeIdx = headers.indexOf('Time-WeekDay');
    const roomIdx = headers.indexOf('Room');
    const remarksIdx = headers.indexOf('Remarks');

    if (courseIdx === -1 || timeIdx === -1) {
      console.error("Could not find required columns in the header.");
      setError("The course table is missing required columns: 'Course(s)' and/or 'Time-WeekDay'.");
      return { headers: ['Error'], rows: [['Missing required columns in header.']], schedule: {} };
    }

    console.log('Dynamic column indices:', { courseIdx, secIdx, creditIdx, timeIdx, roomIdx, remarksIdx });

    // Extract course rows starting from the row after the header
    const courseRows = [];
    let emptyRowCount = 0;
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      
      // Stop if we hit a summary row (starts with "Total")
      if (row && Array.isArray(row) && row[courseIdx] && row[courseIdx].toString().trim().startsWith('Total')) {
        console.log(`Stopping at Total row ${i}`);
        break;
      }
      
      // If row is completely empty or null, count it
      if (!row || !Array.isArray(row) || row.every(cell => !cell || cell.toString().trim() === '')) {
        emptyRowCount++;
        // Stop only if we have 5+ consecutive completely empty rows
        if (emptyRowCount >= 5) {
          console.log(`Stopping after ${emptyRowCount} empty rows at row ${i}`);
          break;
        }
        continue;
      }
      
      // Reset empty row count when we find any non-empty row
      emptyRowCount = 0;
      
      // Extract data from the row
      const courseCode = row[courseIdx] ? row[courseIdx].toString().trim() : '';
      const timeData = row[timeIdx] ? row[timeIdx].toString().trim() : '';
      const sectionData = secIdx > -1 && row[secIdx] ? row[secIdx].toString().trim() : '';
      const roomData = roomIdx > -1 && row[roomIdx] ? row[roomIdx].toString().trim() : '';
      
      // More inclusive criteria - include row if ANY of these conditions are met:
      const hasValidCourse = /^[A-Z]{2,4}\d{3,4}/.test(courseCode) || courseCode.toLowerCase().includes('lab');
      const hasTimeData = timeData && /[MTWRFSU]/.test(timeData);
      const hasSection = sectionData && sectionData.length > 0;
      const hasRoom = roomData && roomData.length > 0;
      const hasAnyRelevantData = hasValidCourse || hasTimeData || (hasSection && hasTimeData) || (hasRoom && hasTimeData);
      
      if (hasAnyRelevantData) {
        courseRows.push(row);
        console.log(`Added course row ${i}:`, { 
          courseCode, 
          timeData, 
          sectionData, 
          roomData, 
          reason: hasValidCourse ? 'Valid course code' : hasTimeData ? 'Has time data' : 'Has relevant data',
          fullRow: row 
        });
      } else {
        console.log(`Skipped row ${i}:`, { 
          courseCode, 
          timeData, 
          sectionData, 
          roomData, 
          reason: 'No relevant course data',
          rowContent: row 
        });
      }
    }
    
    console.log('Dynamically extracted course rows:', courseRows);

    const schedule = {};
    
    courseRows.forEach((row, rowIdx) => {
      if (!row || !Array.isArray(row)) return;
      
      const course = (row[courseIdx] && row[courseIdx].toString().trim()) || '';
      const section = (secIdx > -1 && row[secIdx] && row[secIdx].toString().trim()) || '';
      const credits = (creditIdx > -1 && row[creditIdx] && row[creditIdx].toString().trim()) || '';
      const timeSlot = (row[timeIdx] && row[timeIdx].toString().trim()) || '';
      const room = (roomIdx > -1 && row[roomIdx] && row[roomIdx].toString().trim()) || '';
      const remarks = (remarksIdx > -1 && row[remarksIdx] && row[remarksIdx].toString().trim()) || '';
      
      console.log(`Processing Row ${rowIdx}:`, { 
        course, 
        section, 
        timeSlot, 
        room, 
        credits,
        remarks,
        fullRow: row 
      });
      
      // Skip courses with remarks (dropped/withdrawn courses)
      if (remarks) {
        console.log(`Skipping course ${course} due to remarks: ${remarks}`);
        return;
      }
      
      // Process if we have a time slot (this is the most important criteria)
      if (timeSlot) {
        const parsed = parseTimeSlot(timeSlot);
        console.log('Parsed time for', course || 'Unknown Course', ':', parsed);
        if (parsed && parsed.days) {
          const days = parsed.days.split('');
          days.forEach(day => {
            if (!schedule[day]) schedule[day] = [];
            
            // Determine course name and section with improved logic
            let courseName = course;
            let courseSection = section;
            
            // If no course name in current row, try to inherit from context
            if (!courseName) {
              // Look for the most recent course name in previous rows
              for (let prevIdx = rowIdx - 1; prevIdx >= 0; prevIdx--) {
                const prevRow = courseRows[prevIdx];
                const prevCourse = prevRow && prevRow[courseIdx] ? prevRow[courseIdx].toString().trim() : '';
                const prevSection = prevRow && secIdx > -1 && prevRow[secIdx] ? prevRow[secIdx].toString().trim() : '';
                
                if (prevCourse && /^[A-Z]{2,4}\d{3,4}/.test(prevCourse)) {
                  // Check if current row is actually a lab by looking at room or course name indicators
                  const isLab = room && (
                    room.toLowerCase().includes('lab') || 
                    room.toLowerCase().includes('electronics') ||
                    room.toLowerCase().includes('computer')
                  );
                  
                  // Also check if this row explicitly mentions "lab" in the original course field
                  const originalCourseField = row[courseIdx] ? row[courseIdx].toString().trim().toLowerCase() : '';
                  const hasLabInName = originalCourseField.includes('lab');
                  
                  if (isLab || hasLabInName) {
                    courseName = prevCourse + ' Lab';
                  } else {
                    // It's likely another time slot for the same course, not a lab
                    courseName = prevCourse;
                  }
                  
                  // Always inherit section from the previous course if current row doesn't have one
                  if (!courseSection && prevSection) {
                    courseSection = prevSection;
                    console.log(`Inherited section "${prevSection}" for course "${courseName}"`);
                  }
                  
                  break;
                }
              }
              
              // Fallback if no previous course found
              if (!courseName) {
                courseName = 'Unknown Course';
              }
            }
            
            // Also check if we have a course name but no section, inherit from previous course
            if (courseName && !courseSection) {
              for (let prevIdx = rowIdx - 1; prevIdx >= 0; prevIdx--) {
                const prevRow = courseRows[prevIdx];
                const prevCourse = prevRow && prevRow[courseIdx] ? prevRow[courseIdx].toString().trim() : '';
                const prevSection = prevRow && secIdx > -1 && prevRow[secIdx] ? prevRow[secIdx].toString().trim() : '';
                
                if (prevCourse && /^[A-Z]{2,4}\d{3,4}/.test(prevCourse) && prevSection) {
                  courseSection = prevSection;
                  console.log(`Inherited section "${prevSection}" for existing course "${courseName}"`);
                  break;
                }
              }
            }
            
            console.log(`Final course data: ${courseName}, section: ${courseSection || 'No section'}`);
            
            schedule[day].push({
              course: courseName,
              section: courseSection || '',
              credits,
              time: `${parsed.startTime}-${parsed.endTime}`,
              room,
              startTime: parsed.startTime
            });
          });
        } else {
          console.warn(`Could not parse time slot for ${course || 'Unknown'}:`, timeSlot);
        }
      } else if (course) {
        // If we have a course but no time slot, warn about it
        console.warn(`Course ${course} has no time slot data`);
      } else {
        console.warn(`Row ${rowIdx} has no course or time data:`, row);
      }
    });
    
    console.log('Final schedule:', schedule);
    
    // Sort by time for each day
    Object.keys(schedule).forEach(day => {
      schedule[day].sort((a, b) => {
        // Handle potential invalid time strings
        try {
          // Convert time strings to 24-hour format for proper sorting
          const parseTime = (timeStr) => {
            const [time, period] = timeStr.split(/([AP]M)/);
            let [hours, minutes] = time.split(':').map(Number);
            
            if (period === 'PM' && hours !== 12) {
              hours += 12;
            } else if (period === 'AM' && hours === 12) {
              hours = 0;
            }
            
            return hours * 60 + minutes; // Convert to minutes for easy comparison
          };
          
          const timeA = parseTime(a.startTime);
          const timeB = parseTime(b.startTime);
          
          return timeA - timeB;
        } catch (e) {
          console.warn('Error sorting times:', a.startTime, b.startTime, e);
          // Fallback to string comparison
          return a.startTime.localeCompare(b.startTime);
        }
      });
      
      console.log(`Sorted schedule for ${day}:`, schedule[day].map(cls => `${cls.course} at ${cls.startTime}`));
    });
    
    return { headers, rows: courseRows, schedule };
  };

  const handleFile = (e) => {
    setError("");
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const formatted = formatRoutine(json);
        if (formatted) {
          setRoutine(formatted);
          setWeeklySchedule(formatted.schedule);
        }
      } catch (err) {
        console.error("File parsing error:", err);
        setError("Failed to parse Excel file. Please ensure it's a valid .xlsx or .xls file and not corrupted.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const exportAsPDF = () => {
    // Create a new window for PDF export
    const printWindow = window.open('', '_blank');
    const scheduleHTML = generatePrintableHTML();
    
    printWindow.document.write(scheduleHTML);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const exportAsImage = async (event) => {
    let buttonElement = null;
    try {
      // Show loading state
      buttonElement = event?.target;
      const originalText = buttonElement?.textContent;
      if (buttonElement) {
        buttonElement.textContent = 'Generating...';
        buttonElement.disabled = true;
      }

      // Check if we have schedule data
      const days = Object.keys(dayNames).filter(day => weeklySchedule[day] && weeklySchedule[day].length > 0);
      if (days.length === 0) {
        throw new Error('No schedule data available to export');
      }

      // Try to dynamically import html2canvas
      let html2canvas;
      try {
        html2canvas = (await import('html2canvas')).default;
      } catch (importError) {
        console.error('Failed to import html2canvas:', importError);
        throw new Error('html2canvas library could not be loaded. Please refresh the page.');
      }
      
      console.log('Starting image export...');

      // Create a clean export version
      const exportContainer = document.createElement('div');
      exportContainer.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        background: white;
        padding: 30px;
        width: 1200px;
        min-height: 800px;
        font-family: Arial, sans-serif;
        box-sizing: border-box;
        z-index: 9999;
      `;
      
      // Generate clean HTML for export
      exportContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px;">
          <h1 style="color: #2563eb; font-size: 36px; margin: 0 0 10px 0; font-weight: bold;">Weekly Class Schedule</h1>
          <p style="color: #6b7280; font-size: 20px; margin: 0;">East West University</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(${Math.min(days.length, 3)}, 1fr); gap: 25px; margin: 0;">
          ${days.map(day => `
            <div style="border: 2px solid #e5e7eb; border-radius: 20px; overflow: hidden; background: #f8fafc; box-shadow: 0 8px 25px rgba(0,0,0,0.1); min-height: 300px;">
              <div style="background: #2563eb; color: white; padding: 20px; text-align: center; font-weight: bold; font-size: 20px;">
                ${dayNames[day]}
              </div>
              <div style="padding: 20px;">
                ${weeklySchedule[day].map(cls => `
                  <div style="background: white; margin-bottom: 15px; padding: 18px; border-radius: 15px; border-left: 5px solid #2563eb; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
                    <div style="font-weight: bold; color: #1e40af; font-size: 18px; margin-bottom: 10px; line-height: 1.2;">${cls.course}</div>
                    <div style="font-size: 15px; color: #6b7280; line-height: 1.5;">
                      <div style="margin-bottom: 6px;"><span style="font-weight: 600;">Section:</span> ${cls.section || 'TBA'}</div>
                      <div style="color: #2563eb; font-weight: bold; margin-bottom: 6px; font-size: 16px;"><span style="font-weight: 600;">Time:</span> ${cls.time}</div>
                      <div><span style="font-weight: 600;">Room:</span> ${cls.room || 'TBA'}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 25px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 16px;">
          Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      `;
      
      document.body.appendChild(exportContainer);

      // Wait longer for content to fully render
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Export container dimensions:', exportContainer.offsetWidth, 'x', exportContainer.offsetHeight);

      // Create canvas with optimized options
      const canvas = await html2canvas(exportContainer, {
        backgroundColor: '#ffffff',
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        logging: true,
        width: exportContainer.offsetWidth,
        height: exportContainer.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: exportContainer.offsetWidth,
        windowHeight: exportContainer.offsetHeight
      });

      console.log('Canvas created successfully:', canvas.width, 'x', canvas.height);

      // Verify canvas has content
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasContent = imageData.data.some((channel, index) => {
        // Check if any pixel is not white/transparent
        return index % 4 < 3 && channel < 250; // RGB channels, not alpha
      });

      console.log('Canvas has content:', hasContent);

      // Remove temporary element
      document.body.removeChild(exportContainer);

      if (!hasContent) {
        throw new Error('Generated image appears to be blank. This might be a browser compatibility issue.');
      }

      // Convert to blob and download
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob && blob.size > 0) {
            console.log('Blob created successfully, size:', blob.size, 'bytes');
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `EWU-class-schedule-${new Date().toISOString().split('T')[0]}.png`;
            
            // Force download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            alert('📱 Schedule exported successfully as image!');
            resolve();
          } else {
            console.error('Failed to create blob or blob is empty');
            reject(new Error('Failed to create image blob'));
          }
        }, 'image/png', 0.9);
      });

    } catch (error) {
      console.error('Error exporting as image:', error);
      
      // Provide specific error messages
      let errorMessage = 'Failed to export as image:\n\n';
      if (error.message.includes('html2canvas')) {
        errorMessage += '🔧 Image library failed to load. Please refresh the page and try again.';
      } else if (error.message.includes('No schedule data')) {
        errorMessage += '📊 No schedule data available. Please upload an advising slip first.';
      } else if (error.message.includes('blank')) {
        errorMessage += '🖼️ The generated image appears blank. This might be due to browser security restrictions or compatibility issues.';
      } else if (error.message.includes('blob')) {
        errorMessage += '🖼️ Image generation failed due to browser restrictions.';
      } else {
        errorMessage += `❌ ${error.message || 'Unknown error occurred.'}`;
      }
      
      errorMessage += '\n\n💡 Tips:\n• Try using the PDF export option instead\n• Try a different browser (Chrome/Firefox work best)\n• Make sure you have uploaded a schedule first';
      alert(errorMessage);
    } finally {
      // Restore button state
      if (buttonElement) {
        buttonElement.textContent = 'Export as Image';
        buttonElement.disabled = false;
      }
    }
  };

  const generatePrintableHTML = () => {
    const days = Object.keys(dayNames).filter(day => weeklySchedule[day] && weeklySchedule[day].length > 0);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Class Schedule</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              background: white;
              padding: 15px;
              font-size: 12px;
            }
            .container { 
              max-width: 100%; 
              margin: 0 auto;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 10px;
            }
            .header h1 { 
              color: #2563eb; 
              font-size: 24px; 
              margin-bottom: 5px;
            }
            .header p { 
              color: #6b7280; 
              font-size: 14px;
            }
            .schedule-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 15px;
              page-break-inside: avoid;
            }
            .day-column { 
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
              background: #f9fafb;
            }
            .day-header { 
              background: #2563eb; 
              color: white; 
              padding: 8px; 
              text-align: center; 
              font-weight: bold;
              font-size: 14px;
            }
            .day-content { 
              padding: 8px;
            }
            .class-item { 
              background: white; 
              margin-bottom: 8px; 
              padding: 8px; 
              border-radius: 4px;
              border-left: 3px solid #2563eb;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .class-item:last-child { margin-bottom: 0; }
            .course-name { 
              font-weight: bold; 
              color: #1e40af; 
              font-size: 13px;
              margin-bottom: 3px;
            }
            .class-details { 
              font-size: 11px; 
              color: #6b7280;
              line-height: 1.3;
            }
            .time { 
              color: #2563eb; 
              font-weight: 600;
            }
            @media print {
              body { padding: 10px; }
              .container { max-width: 100%; }
              .schedule-grid { 
                grid-template-columns: repeat(${Math.min(days.length, 3)}, 1fr);
                gap: 10px;
              }
              .header h1 { font-size: 20px; }
              .day-header { font-size: 12px; padding: 6px; }
              .class-item { padding: 6px; margin-bottom: 6px; }
              .course-name { font-size: 12px; }
              .class-details { font-size: 10px; }
            }
            @page {
              size: A4;
              margin: 0.5in;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Weekly Class Schedule</h1>
              <p>East West University</p>
            </div>
            <div class="schedule-grid">
              ${days.map(day => `
                <div class="day-column">
                  <div class="day-header">${dayNames[day]}</div>
                  <div class="day-content">
                    ${weeklySchedule[day].map(cls => `
                      <div class="class-item">
                        <div class="course-name">${cls.course}</div>
                        <div class="class-details">
                          <div>Section: ${cls.section || 'TBA'}</div>
                          <div class="time">${cls.time}</div>
                          <div>Room: ${cls.room}</div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const dayNames = {
      'S': 'Sunday',
    'M': 'Monday',
    'T': 'Tuesday', 
    'W': 'Wednesday',
    'R': 'Thursday',
    'F': 'Friday',
    'A': 'Saturday',
  };

  return (
    <div className="  p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-blue-200 relative overflow-hidden no-print">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200 rounded-full blur-2xl opacity-30 z-0" />
          <h2 className="text-3xl font-extrabold text-blue-700 mb-6 text-center drop-shadow-lg z-10 relative">Class Routine Generator</h2>
          
          <div className="z-10 relative">
            <label className="block text-lg font-semibold text-blue-700 mb-3">Upload Advising Slip (Excel)</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              ref={fileInput}
              onChange={handleFile}
              className="w-full p-4 border-2 border-blue-200 rounded-xl bg-blue-50 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition"
            />
            {error && <div className="text-red-500 mt-3 p-3 bg-red-50 rounded-lg">{error}</div>}
          </div>
        </div>

        {weeklySchedule && Object.keys(weeklySchedule).length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-indigo-200 relative overflow-hidden routine-table">
            <div className="absolute -bottom-10 -left-10 w-44 h-40 bg-indigo-200 rounded-full blur-2xl opacity-30 z-0 no-print" />
            <h3 className="text-2xl font-bold text-indigo-700 mb-6 text-center z-10 relative">Weekly Class Schedule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10 relative">
              {Object.keys(dayNames).map(day => (
                weeklySchedule[day] && weeklySchedule[day].length > 0 && (
                  <div key={day} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                    <h4 className="text-lg font-bold text-blue-700 mb-3 text-center">{dayNames[day]}</h4>
                    <div className="space-y-2">
                      {weeklySchedule[day].map((cls, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 shadow border-l-4 border-blue-500">
                          <div className="font-bold text-blue-800">{cls.course}</div>
                          <div className="text-sm text-gray-600">Section: {cls.section || 'TBA'}</div>
                          <div className="text-sm text-blue-600 font-semibold">{cls.time}</div>
                          <div className="text-sm text-gray-600">Room: {cls.room || 'TBA'}</div>
                          {/* <div className="text-xs text-gray-500">Credits: {cls.credits}</div> */}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4 z-10 relative no-print">
             
              <button 
                onClick={exportAsPDF}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export as PDF
              </button>
              <button 
                onClick={exportAsImage}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2 text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Export as Image
              </button>
            </div>
          </div>
        )}

        {routine && (!weeklySchedule || Object.keys(weeklySchedule).length === 0) && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-red-200 relative overflow-hidden">
            <h3 className="text-2xl font-bold text-red-700 mb-6 text-center">Raw Data (Debug View)</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    {routine.headers.map((header, j) => (
                      <th key={j} className="border px-4 py-2 text-left font-bold">
                        {header || `Column ${j + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {routine.rows.slice(0, 10).map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      {row.map((cell, j) => (
                        <td key={j} className="border px-4 py-2">
                          {cell || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .routine-table {
            width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          .routine-table .grid {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
            gap: 8px !important;
          }
          .routine-table h3 {
            font-size: 18px !important;
            margin-bottom: 15px !important;
          }
          .routine-table h4 {
            font-size: 14px !important;
            margin-bottom: 8px !important;
          }
          .routine-table .bg-white {
            padding: 6px !important;
            margin-bottom: 6px !important;
          }
          .routine-table .font-bold {
            font-size: 12px !important;
          }
          .routine-table .text-sm {
            font-size: 10px !important;
          }
          .routine-table .text-xs {
            font-size: 9px !important;
          }
        }
        @page {
          size: A4;
          margin: 0.5in;
        }
      `}</style>
    </div>
  );
}

export default RoutineGenerator;
