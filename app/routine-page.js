"use client";
import { useState } from "react";

function RoutinePage({ selectedSections, onBack }) {
  // Helper to convert time to minutes for sorting
  const timeToMinutes = (timeStr) => {
    const parts = timeStr.split(' ');
    if (parts.length < 2) return 0;
    
    const [time, period] = parts;
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    return hour24 * 60 + minutes;
  };

  // Generate organized routine
  const generateRoutine = () => {
    const dayOrder = ['M', 'T', 'W', 'R', 'S', 'A', 'F'];
    const dayNames = {
      'M': 'Monday',
      'T': 'Tuesday', 
      'W': 'Wednesday',
      'R': 'Thursday',
      'S': 'Saturday',
      'A': 'Friday',
      'F': 'Friday'
    };

    // Build all time slots
    let slots = [];
    for (const section of selectedSections) {
      for (const t of section.times) {
        const timeString = t.time;
        const daysPart = timeString.split(' ')[0];
        const timePart = timeString.substring(timeString.indexOf(' ') + 1);
        
        for (const d of daysPart) {
          slots.push({
            day: d,
            dayName: dayNames[d],
            time: timePart,
            startTime: timePart.split(' - ')[0],
            endTime: timePart.split(' - ')[1],
            course: section.courseCode,
            section: section.section,
            faculty: section.faculty,
            sortTime: timeToMinutes(timePart.split(' - ')[0])
          });
        }
      }
    }

    // Group by day and sort by time
    const grouped = {};
    for (const d of dayOrder) {
      grouped[d] = slots
        .filter(slot => slot.day === d)
        .sort((a, b) => a.sortTime - b.sortTime);
    }

    return grouped;
  };

  const routine = generateRoutine();
  const dayOrder = ['M', 'T', 'W', 'R', 'S', 'A', 'F'];
  const dayNames = {
    'M': 'Monday',
    'T': 'Tuesday', 
    'W': 'Wednesday',
    'R': 'Thursday',
    'S': 'Saturday',
    'A': 'Friday',
    'F': 'Friday'
  };

  return (
    <div className="max-w-6xl mx-auto p-8 min-h-screen ">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-purple-800 drop-shadow-lg tracking-tight">
          📅 My Class Routine
        </h1>
        <button
          onClick={onBack}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold shadow hover:from-blue-600 hover:to-purple-600 transition"
        >
          ← Back to Course Planner
        </button>
      </div>

      {selectedSections.length === 0 ? (
        <div className="text-center text-gray-500 text-xl mt-20">
          No courses selected. Please go back and select some courses first.
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-purple-200">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">📊 Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700">{selectedSections.length}</div>
                <div className="text-blue-600">Total Courses</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">
                  {(() => {
                    let totalClasses = 0;
                    for (const section of selectedSections) {
                      for (const t of section.times) {
                        const daysPart = t.time.split(' ')[0];
                        totalClasses += daysPart.length; // Count individual days
                      }
                    }
                    return totalClasses;
                  })()}
                </div>
                <div className="text-green-600">Classes per Week</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-700">
                  {new Set(selectedSections.map(s => s.faculty)).size}
                </div>
                <div className="text-purple-600">Different Instructors</div>
              </div>
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
            <h2 className="text-2xl font-bold text-purple-700 mb-6">🗓️ Weekly Schedule</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {dayOrder.map(day => (
                <div key={day} className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                    {dayNames[day]}
                  </h3>
                  {routine[day].length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      No classes
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {routine[day].map((slot, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 border-l-4 border-purple-400 shadow-sm">
                          <div className="font-bold text-purple-800 text-lg">
                            {slot.course}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Section {slot.section} • {slot.faculty}
                          </div>
                          <div className="text-sm font-semibold text-blue-600">
                            ⏰ {slot.startTime} - {slot.endTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

      
        </>
      )}
    </div>
  );
}

export default RoutinePage;
