"use client";
import { useState, useEffect } from "react";

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from session storage
    const data = sessionStorage.getItem('combinationsAnalytics');
    if (data) {
      setAnalyticsData(JSON.parse(data));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData || !analyticsData.combinations.length) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-yellow-800 mb-4">No Data Available</h1>
          <p className="text-yellow-700 mb-4">No course combinations found for analysis.</p>
          <button
            onClick={() => window.close()}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  const { combinations } = analyticsData;

  // Helper function to parse time and convert to minutes
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 0;
    
    let [, hours, minutes, period] = match;
    hours = parseInt(hours);
    minutes = parseInt(minutes);
    
    if (period.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  };

  // Helper function to calculate duration between two times
  const calculateDuration = (startTime, endTime) => {
    const start = parseTimeToMinutes(startTime);
    const end = parseTimeToMinutes(endTime);
    return end - start;
  };

  // Helper function to format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.trim();
  };

  // Calculate combination details (mini routine, class days, total hours, time gaps)
  const combinationDetails = combinations.map(combo => {
    // Create mini routine
    const schedule = {};
    const dayMap = { 'M': 'Mon', 'T': 'Tue', 'W': 'Wed', 'R': 'Thu', 'F': 'Fri', 'S': 'Sun' };
    
    combo.sections.forEach(section => {
      if (section.times && Array.isArray(section.times)) {
        section.times.forEach(timeSlot => {
          if (timeSlot && timeSlot.time && typeof timeSlot.time === 'string') {
            const timeStr = timeSlot.time.trim();
            const parts = timeStr.split(' ');
            if (parts.length >= 2) {
              const days = parts[0];
              const time = parts.slice(1).join(' ');
              
              [...days].forEach(dayCode => {
                const dayName = dayMap[dayCode];
                if (dayName) {
                  if (!schedule[dayName]) schedule[dayName] = [];
                  schedule[dayName].push({
                    time: time,
                    course: section.courseCode,
                    faculty: section.faculty,
                    section: section.section
                  });
                }
              });
            }
          }
        });
      }
    });

    // Sort each day's classes by time
    Object.keys(schedule).forEach(day => {
      schedule[day].sort((a, b) => {
        const aTime = a.time.split(' - ')[0];
        const bTime = b.time.split(' - ')[0];
        return parseTimeToMinutes(aTime) - parseTimeToMinutes(bTime);
      });
    });

    // Calculate class days
    const classDays = Object.keys(schedule).length;

    // Calculate total class hours
    let totalMinutes = 0;
    combo.sections.forEach(section => {
      if (section.times && Array.isArray(section.times)) {
        section.times.forEach(timeSlot => {
          if (timeSlot && timeSlot.time && typeof timeSlot.time === 'string') {
            const timeStr = timeSlot.time.trim();
            const parts = timeStr.split(' ');
            if (parts.length >= 2) {
              const days = parts[0];
              const timeRange = parts.slice(1).join(' ');
              if (timeRange.includes(' - ')) {
                const [startTime, endTime] = timeRange.split(' - ');
                if (startTime && endTime) {
                  const duration = calculateDuration(startTime.trim(), endTime.trim());
                  totalMinutes += duration * days.length; // Multiply by number of days
                }
              }
            }
          }
        });
      }
    });
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    // Calculate highest time gap between classes
    let maxGap = 0;
    Object.values(schedule).forEach(dayClasses => {
      for (let i = 0; i < dayClasses.length - 1; i++) {
        const currentClass = dayClasses[i];
        const nextClass = dayClasses[i + 1];
        
        if (currentClass.time.includes(' - ') && nextClass.time.includes(' - ')) {
          const currentEndTime = currentClass.time.split(' - ')[1];
          const nextStartTime = nextClass.time.split(' - ')[0];
          
          if (currentEndTime && nextStartTime) {
            const gap = parseTimeToMinutes(nextStartTime.trim()) - parseTimeToMinutes(currentEndTime.trim());
            maxGap = Math.max(maxGap, gap);
          }
        }
      }
    });
    const maxGapHours = Math.round((maxGap / 60) * 10) / 10;

    return {
      id: combo.id,
      name: combo.name,
      createdAt: combo.createdAt,
      sections: combo.sections,
      schedule,
      classDays,
      totalHours,
      maxGapHours
    };
  });

  // Helper function to format faculty display (same as course planner)
  const formatFacultyDisplay = (facultyString) => {
    if (!facultyString) return '';
    const names = facultyString.split(/[,/&]|\sand\s/i)
      .map(name => name.trim())
      .filter(name => name.length > 0);
    if (names.length <= 1) return facultyString;
    if (names.length === 2) return names.join(' & ');
    return names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1];
  };

  // Export function
  const handleExportAnalytics = async () => {
    try {
      // Show loading state
      const originalText = document.querySelector('[data-analytics-export-btn]')?.textContent;
      const exportBtn = document.querySelector('[data-analytics-export-btn]');
      if (exportBtn) exportBtn.textContent = 'Exporting...';

      // Try Canvas API
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Determine layout based on number of combinations
      const shouldUseTwoColumns = combinationDetails.length > 4;
      const columnsCount = shouldUseTwoColumns ? 2 : 1;
      const columnWidth = shouldUseTwoColumns ? 430 : 820;
      const columnSpacing = 40;
      
      // Calculate dynamic canvas height based on content
      let totalHeight = 150; // Header space
      
      if (shouldUseTwoColumns) {
        // Calculate height for two-column layout
        const leftColumnCombinations = combinationDetails.filter((_, index) => index % 2 === 0);
        const rightColumnCombinations = combinationDetails.filter((_, index) => index % 2 === 1);
        
        const leftColumnHeight = leftColumnCombinations.reduce((sum, combo) => {
          const coursesCount = combo.sections.length;
          return sum + 80 + (coursesCount * 45) + 20;
        }, 0);
        
        const rightColumnHeight = rightColumnCombinations.reduce((sum, combo) => {
          const coursesCount = combo.sections.length;
          return sum + 80 + (coursesCount * 45) + 20;
        }, 0);
        
        totalHeight += Math.max(leftColumnHeight, rightColumnHeight);
      } else {
        // Single column layout
        combinationDetails.forEach(combo => {
          const coursesCount = combo.sections.length;
          totalHeight += 80 + (coursesCount * 45) + 20;
        });
      }
      
      // Set canvas size
      canvas.width = shouldUseTwoColumns ? 900 : 900;
      canvas.height = Math.max(600, totalHeight);
      
      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add title
      ctx.fillStyle = '#7c3aed';
      ctx.font = 'bold 32px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Course Combinations Analytics`, canvas.width / 2, 40);
      
      // Add subtitle
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = '#374151';
      ctx.fillText('EWU Helpdesk - Course Planner Analytics', canvas.width / 2, 70);
      
      // Add date
      ctx.font = '14px Arial, sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(`Generated on: ${new Date().toLocaleString()}`, canvas.width / 2, 95);
      
      // Add separator line
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 115);
      ctx.lineTo(canvas.width - 50, 115);
      ctx.stroke();
      
      let yPosition = 140;
      
      if (shouldUseTwoColumns) {
        // Two-column layout
        const leftColumnX = 20;
        const rightColumnX = leftColumnX + columnWidth + columnSpacing;
        let leftColumnY = yPosition;
        let rightColumnY = yPosition;
        
        combinationDetails.forEach((combo, index) => {
          const isLeftColumn = index % 2 === 0;
          const currentX = isLeftColumn ? leftColumnX : rightColumnX;
          const currentY = isLeftColumn ? leftColumnY : rightColumnY;
          
          const combinationHeight = 60 + (combo.sections.length * 45) + 20;
          
          // Combination background
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(currentX, currentY, columnWidth, combinationHeight);
          
          // Combination border
          ctx.strokeStyle = '#d1d5db';
          ctx.lineWidth = 2;
          ctx.strokeRect(currentX, currentY, columnWidth, combinationHeight);
          
          // Combination header background
          ctx.fillStyle = '#e0e7ff';
          ctx.fillRect(currentX, currentY, columnWidth, 50);
          
          // Combination name
          ctx.fillStyle = '#3730a3';
          ctx.font = 'bold 16px Arial, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`${index + 1}. ${combo.name}`, currentX + 15, currentY + 25);
          
          // Analytics info
          ctx.fillStyle = '#6366f1';
          ctx.font = '10px Arial, sans-serif';
          ctx.fillText(`Days: ${combo.classDays} | Hours: ${combo.totalHours}h | Gap: ${combo.maxGapHours}h`, currentX + 15, currentY + 45);
          
          // Course count and creation date
          ctx.fillStyle = '#059669';
          ctx.font = 'bold 10px Arial, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(`${combo.sections.length} courses`, currentX + columnWidth - 15, currentY + 25);
          
          ctx.fillStyle = '#4338ca';
          ctx.font = '9px Arial, sans-serif';
          ctx.fillText(`Created: ${combo.createdAt}`, currentX + columnWidth - 15, currentY + 45);
          
          let courseY = currentY + 65;
          
          // Display courses
          combo.sections.forEach((section, sIdx) => {
            // Course header
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 12px Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${sIdx + 1}. ${section.courseCode} - Section ${section.section}`, currentX + 20, courseY);
            
            courseY += 18;
            
            // Faculty and times
            const facultyText = `Faculty: ${formatFacultyDisplay(section.faculty)}`;
            const timesText = section.times.map(time => time.time).join(' | ');
            
            // Faculty name
            ctx.fillStyle = '#4338ca';
            ctx.font = '10px Arial, sans-serif';
            ctx.fillText(facultyText, currentX + 40, courseY);
            
            courseY += 12;
            
            // Times (on next line for better fit)
            ctx.fillStyle = '#059669';
            ctx.font = '9px Arial, sans-serif';
            ctx.fillText(`⏰ ${timesText}`, currentX + 40, courseY);
            
            courseY += 15;
          });
          
          // Update column Y positions
          if (isLeftColumn) {
            leftColumnY += combinationHeight + 20;
          } else {
            rightColumnY += combinationHeight + 20;
          }
        });
      } else {
        // Single column layout (original)
        combinationDetails.forEach((combo, index) => {
          const combinationHeight = 60 + (combo.sections.length * 45) + 20;
          
          // Combination background
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(30, yPosition, canvas.width - 60, combinationHeight);
          
          // Combination border
          ctx.strokeStyle = '#d1d5db';
          ctx.lineWidth = 2;
          ctx.strokeRect(30, yPosition, canvas.width - 60, combinationHeight);
          
          // Combination header background
          ctx.fillStyle = '#e0e7ff';
          ctx.fillRect(30, yPosition, canvas.width - 60, 50);
          
          // Combination name
          ctx.fillStyle = '#3730a3';
          ctx.font = 'bold 18px Arial, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`${index + 1}. ${combo.name}`, 45, yPosition + 25);
          
          // Analytics info
          ctx.fillStyle = '#6366f1';
          ctx.font = '12px Arial, sans-serif';
          ctx.fillText(`Class Days: ${combo.classDays} | Total Hours: ${combo.totalHours}h | Max Gap: ${combo.maxGapHours}h`, 45, yPosition + 45);
          
          // Course count and creation date
          ctx.fillStyle = '#059669';
          ctx.font = 'bold 12px Arial, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(`${combo.sections.length} courses`, canvas.width - 45, yPosition + 25);
          
          ctx.fillStyle = '#4338ca';
          ctx.font = '10px Arial, sans-serif';
          ctx.fillText(`Created: ${combo.createdAt}`, canvas.width - 45, yPosition + 45);
          
          let courseY = yPosition + 65;
          
          // Display all courses with full details
          combo.sections.forEach((section, sIdx) => {
            // Course header
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 14px Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${sIdx + 1}. ${section.courseCode} - Section ${section.section}`, 50, courseY);
            
            courseY += 20;
            
            // Faculty and times on the same line(s)
            const facultyText = `Faculty: ${formatFacultyDisplay(section.faculty)}`;
            const timesText = section.times.map(time => time.time).join(' | ');
            
            // Faculty name (left side)
            ctx.fillStyle = '#4338ca';
            ctx.font = '12px Arial, sans-serif';
            ctx.fillText(facultyText, 70, courseY);
            
            // Measure faculty text width to position times
            const facultyWidth = ctx.measureText(facultyText).width;
            
            // Times (right side, starting after faculty text)
            ctx.fillStyle = '#059669';
            ctx.font = '11px Arial, sans-serif';
            ctx.fillText(`⏰ ${timesText}`, 70 + facultyWidth + 20, courseY);
            
            courseY += 25; // Space between courses
          });
          
          yPosition += combinationHeight + 20; // Space between combinations
        });
      }
      
      // Add footer
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Generated by EWU Helpdesk Course Planner Analytics', canvas.width / 2, canvas.height - 20);
      ctx.fillText('Visit: ewu-helpdesk.vercel.app', canvas.width / 2, canvas.height - 8);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `course-analytics-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      if (exportBtn) {
        exportBtn.textContent = 'Exported!';
        setTimeout(() => {
          if (originalText) exportBtn.textContent = originalText;
        }, 2000);
      }

    } catch (error) {
      console.error('Export failed:', error);
      
      // Reset button text
      const exportBtn = document.querySelector('[data-analytics-export-btn]');
      const originalText = 'Export as Image';
      if (exportBtn) exportBtn.textContent = originalText;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-purple-800 mb-2">
              Course Combinations Analytics
            </h1>
            <p className="text-gray-600">
              Generated on: {new Date(analyticsData.generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportAnalytics}
              className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-lg font-bold shadow hover:from-orange-500 hover:to-red-600 transition"
              data-analytics-export-btn
            >
              Export as Image
            </button>
            <button
              onClick={() => window.close()}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Combination Details */}
      <div className="space-y-6" id="analytics-content">
        {combinationDetails.map((combo, index) => (
          <div key={combo.id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
              {/* Combination Info */}
              <div className="lg:w-1/3 mb-4 lg:mb-0">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {combo.name || `Combination ${index + 1}`}
                </h3>
                
                <div className="text-sm text-gray-600 mb-4">
                  Created: {combo.createdAt}
                </div>
                
                {/* Analytics Cards */}
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{combo.classDays}</div>
                    <div className="text-sm text-blue-700">Class Days</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">{combo.totalHours}h</div>
                    <div className="text-sm text-green-700">Total Class Hours</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">{combo.maxGapHours}h</div>
                    <div className="text-sm text-orange-700">Highest Time Gap</div>
                  </div>
                </div>

                {/* Course List */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-700 mb-2">Courses:</h4>
                  <div className="space-y-1">
                    {combo.sections.map((section, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        {section.courseCode} - {formatFacultyDisplay(section.faculty)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mini Routine */}
              <div className="lg:w-2/3">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Weekly Schedule</h4>
                {Object.keys(combo.schedule).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Object.entries(combo.schedule).map(([day, classes]) => (
                      <div key={day} className="bg-gray-50 rounded-lg p-4">
                        <div className="font-bold text-gray-800 text-center mb-3 bg-white rounded p-2">{day}</div>
                        <div className="space-y-2">
                          {classes.map((classInfo, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-3 shadow-sm">
                              <div className="font-semibold text-gray-800 text-sm">{classInfo.course}</div>
                              <div className="text-xs text-green-600 font-mono">{formatTime(classInfo.time)}</div>
                              <div className="text-xs text-gray-500 truncate" title={formatFacultyDisplay(classInfo.faculty)}>
                                {formatFacultyDisplay(classInfo.faculty)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                    No classes scheduled
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-gray-500 text-sm">
        <p>EWU Helpdesk Course Planner Analytics • {combinationDetails.length} combinations analyzed</p>
      </div>
    </div>
  );
}
