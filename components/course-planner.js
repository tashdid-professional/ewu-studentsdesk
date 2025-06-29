"use client";
import { useState } from "react";
import { courses } from "../public/courses-data";
import RoutinePage from "./routine-page";

function timeConflict(timeA, timeB) {
  // Parse time strings like "MW 10:10 AM - 11:40 AM" or "T 01:30 PM - 03:00 PM"
  const parseTime = (timeStr) => {
    const parts = timeStr.trim().split(' ');
    if (parts.length < 5) return null;
    
    const days = parts[0];
    const startTime = parts[1] + ' ' + parts[2];
    const endTime = parts[4] + ' ' + parts[5];
    
    return { days, startTime, endTime };
  };
  
  const convertTo24Hour = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    return hour24 * 60 + minutes; // Convert to minutes for easy comparison
  };
  
  const parsedA = parseTime(timeA);
  const parsedB = parseTime(timeB);
  
  if (!parsedA || !parsedB) return false;
  
  // Check if days overlap
  const daysOverlap = [...parsedA.days].some(day => parsedB.days.includes(day));
  if (!daysOverlap) return false;
  
  // Convert times to minutes for comparison
  const startA = convertTo24Hour(parsedA.startTime);
  const endA = convertTo24Hour(parsedA.endTime);
  const startB = convertTo24Hour(parsedB.startTime);
  const endB = convertTo24Hour(parsedB.endTime);
  
  // Check if time ranges overlap
  return (startA < endB && endA > startB);
}

export default function CoursePlanner() {
  const [selectedSections, setSelectedSections] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showRoutine, setShowRoutine] = useState(false);

  const handleAddSection = (course, section) => {
    const sectionId = `${course.code}-${section.section}`;
    
    // Prevent adding the same section twice
    if (selectedSections.some(sel => sel.id === sectionId)) {
      setError(`Section ${sectionId} is already added.`);
      return;
    }
    // Prevent adding a different section of the same course
    if (selectedSections.some(sel => sel.courseCode === course.code)) {
      setError(`Course ${course.code} is already added. You cannot add another section of the same course.`);
      return;
    }
    
    // Check for time conflicts with all existing sections
    for (let sel of selectedSections) {
      for (let selTime of sel.times) {
        for (let newTime of section.times) {
          if (timeConflict(selTime.time, newTime.time)) {
            setError(`Time conflict between ${sel.id} and ${sectionId}`);
            return;
          }
        }
      }
    }
    
    setSelectedSections([...selectedSections, { 
      id: sectionId,
      courseCode: course.code,
      courseTitle: course.title,
      section: section.section,
      faculty: section.faculty,
      times: section.times
    }]);
    setError("");
  };

  // Filter courses by search
  const filteredCourses = courses.filter(course =>
    course.code.toLowerCase().includes(search.toLowerCase()) ||
    (course.title && course.title.toLowerCase().includes(search.toLowerCase()))
  );

  // Helper to parse and organize routine
  function getRoutineTable(sections) {
    // This function is no longer needed as we use a separate page
    return null;
  }

  // Show routine page if requested
  if (showRoutine) {
    return <RoutinePage selectedSections={selectedSections} onBack={() => setShowRoutine(false)} />;
  }

  return (
    <div className="max-w-5xl rounded-2xl mx-auto p-2 sm:p-4 md:p-8 relative min-h-screen">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 sm:mb-8 text-center text-purple-800 drop-shadow-lg tracking-tight">Course Planner</h1>
      <input
        type="text"
        placeholder="Search course code or title..."
        className="w-full mb-6 sm:mb-8 p-2 sm:p-3 border-2 border-blue-200 rounded-xl shadow focus:outline-none focus:border-blue-400 bg-white text-base sm:text-lg"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="flex flex-col-reverse md:flex-row gap-6 md:gap-10 items-start">
        <div className="grid gap-4 sm:gap-6 md:gap-8 w-full md:w-2/3">
          {filteredCourses.length === 0 && (
            <div className="text-center text-gray-400 text-base sm:text-lg">No courses found.</div>
          )}
          {filteredCourses.map((course) => (
            <div key={course.code} className="bg-white border-2 border-blue-100 rounded-2xl shadow-lg p-4 sm:p-6 transition-transform hover:scale-[1.02] hover:shadow-2xl">
              <h2 className="font-bold text-lg sm:text-2xl text-blue-700 mb-2 flex items-center gap-2">
                <span className="inline-block bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-base sm:text-xl font-semibold">{course.code}</span>
                {/* <span className="text-gray-700 font-normal text-lg">{course.title}</span> */}
              </h2>
              <ul className="space-y-2 sm:space-y-3 mt-2">
                {course.sections.map((section) => (
                  <li key={section.section} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-100 hover:bg-blue-100 transition">
                    <div className="flex-1 w-full">
                      <div className="font-semibold text-blue-800">Section {section.section} <span className="text-xs text-blue-500 ml-2">{section.faculty}</span></div>
                      {section.times.map((time, idx) => (
                        <div key={idx} className="text-xs text-gray-600 font-mono">
                          {time.time}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <a
                      href={`https://www.facebook.com/groups/161934770547464/search/?q=${course.code.toLowerCase()}%20${section.faculty.toLowerCase()}
`}
                       
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-bold shadow hover:from-yellow-500 hover:to-orange-600 transition w-full sm:w-auto text-center"
                      >
                        Review
                      </a>
                      <button
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-bold shadow hover:from-blue-600 hover:to-purple-600 transition w-full sm:w-auto"
                        onClick={() => handleAddSection(course, section)}
                      >
                        Add
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="w-full md:w-1/2 lg:sticky top-4 self-start bg-white/90 p-4 sm:p-6 border-2 border-purple-200 rounded-2xl shadow-2xl backdrop-blur-lg max-h-[90vh] overflow-y-auto">
          <h2 className="font-bold mb-3 sm:mb-4 text-lg sm:text-xl text-purple-700 flex items-center gap-2">
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 sm:h-6 sm:w-6 text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 17v-2a4 4 0 018 0v2m-4-4v4m0 0v4m0-4H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-7z' /></svg>
            Selected Courses
          </h2>
          {error && <div className="bg-red-100 text-red-700 p-2 sm:p-3 mb-3 sm:mb-4 rounded-lg border border-red-200 shadow text-sm sm:text-base">{error}</div>}
          <ul className="space-y-2 sm:space-y-3">
            {selectedSections.length === 0 && (
              <li className="text-gray-400 text-center">No courses selected.</li>
            )}
            {selectedSections.map((section) => (
              <li key={section.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-purple-50 rounded-lg p-2 sm:p-3 border border-purple-100 hover:bg-purple-100 transition">
                <div className="flex-1 w-full">
                  <div className="font-semibold text-purple-800">{section.courseCode} - Section {section.section} <span className="text-xs text-purple-500 ml-2">{section.faculty}</span></div>
                  {section.times.map((time, idx) => (
                    <div key={idx} className="text-xs text-gray-600 font-mono">
                      {time.time}
                    </div>
                  ))}
                </div>
                <button
                  className="bg-gradient-to-r from-red-400 to-pink-500 text-white px-3 py-1 rounded-lg font-bold shadow hover:from-red-500 hover:to-pink-600 transition ml-0 sm:ml-2 w-full sm:w-auto"
                  onClick={() => {
                    setSelectedSections(selectedSections.filter(sel => sel.id !== section.id));
                    setError("");
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button
            className="mt-4 sm:mt-6 w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-2 sm:py-3 rounded-xl font-bold shadow hover:from-green-500 hover:to-blue-600 transition text-base sm:text-lg"
            onClick={() => setShowRoutine(true)}
            disabled={selectedSections.length === 0}
          >
            Generate Routine
          </button>
        </div>
      </div>
    </div>
  );
}
