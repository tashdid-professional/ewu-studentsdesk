"use client";
import { useState, useRef, useEffect } from "react";
import { courseDetails } from "../public/course-details";
import { FaSearch, FaChevronDown, FaChevronUp, FaBook, FaFilter } from "react-icons/fa";

export default function CourseHub() {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [expandedCourse, setExpandedCourse] = useState(null);
  const topRef = useRef(null);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [search]);

  // Define departments
  const departments = ["All", "CSE", "BA"];

  // Get department display name
  const getDeptDisplayName = (dept) => {
    const deptNames = {
      "All": "All Departments",
      "CSE": "CSE - Computer Science & Engineering",
      "BA": "BA - Business Administration"
    };
    return deptNames[dept] || dept;
  };

  // Get department from course code
  const getCourseDept = (courseCode) => {
    const prefix = courseCode.match(/^([A-Z]+)/)?.[1];
    return prefix === "CSE" ? "CSE" : "BA";
  };

  // Filter courses by search and department
  const filteredCourses = courseDetails.filter((course) => {
    // Filter by department
    if (selectedDept !== "All") {
      const courseDept = getCourseDept(course.courseCode);
      if (courseDept !== selectedDept) return false;
    }

    // Filter by search
    if (!search) return true;
    const searchLower = search.toLowerCase().trim();
    if (!searchLower) return true;

    const searchNoSpace = searchLower.replace(/\s+/g, "");
    const courseCodeLower = (course.courseCode || "").toLowerCase();
    const courseCodeNoSpace = courseCodeLower.replace(/\s+/g, "");
    const courseNameLower = (course.courseName || "").toLowerCase();

    // 1. Check if the normalized search (no spaces) is part of the course code
    if (courseCodeNoSpace.includes(searchNoSpace)) return true;

    // 2. Check if the search is part of the course name
    if (courseNameLower.includes(searchLower)) return true;

    // 3. Multi-token matching (e.g., "106 CSE" or "Programming Structured")
    const searchTokens = searchLower.split(/\W+/).filter(Boolean);
    if (searchTokens.length > 1) {
      return searchTokens.every((token) =>
        courseCodeNoSpace.includes(token) || courseNameLower.includes(token)
      );
    }

    return false;
  });

  const toggleCourse = (courseKey) => {
    setExpandedCourse(expandedCourse === courseKey ? null : courseKey);
  };

  return (
    <div
      ref={topRef}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-3 md:p-4 rounded-full shadow-lg">
              <FaBook className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 md:mb-3 bg-gradient-to-r from-violet-300 via-purple-300 to-violet-400 bg-clip-text text-transparent">
            Course Hub
          </h1>
          <p className="text-gray-400 text-sm md:text-base lg:text-lg px-4">
            Explore course catalogs from all departments with detailed information
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md border-2 border-violet-500/30 shadow-lg shadow-violet-500/10 rounded-xl p-3 md:p-4 mb-6 md:mb-8">
          {/* Search and Filter Row */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-2 md:mb-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-violet-400 w-5 h-5" />
              <input
                type="text"
                placeholder="🔍 Search by course code or name..."
                className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-slate-800/80 border-2 border-violet-500/40 rounded-lg shadow-lg shadow-violet-500/10 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/50 focus:outline-none text-white placeholder-violet-200/60 transition-all duration-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Department Filter */}
            <div className="relative md:w-80">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 w-3.5 h-3.5 md:w-4 md:h-4 pointer-events-none z-10" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full pl-8 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-slate-800/80 border-2 border-violet-500/40 rounded-lg shadow-lg shadow-violet-500/10 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/50 focus:outline-none text-white transition-all duration-200 cursor-pointer appearance-none"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {getDeptDisplayName(dept)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Counter */}
          <div className="text-xs md:text-sm text-violet-300">
            {filteredCourses.length} courses found
            {selectedDept !== "All" && ` in ${getDeptDisplayName(selectedDept)}`}
            {search && ` matching "${search}"`}
          </div>
        </div>

        {/* Course List */}
        <div className="space-y-4">
          {filteredCourses.length === 0 && (
            <div className="text-center text-gray-400 text-sm md:text-lg py-8 md:py-12">
              No courses found. Try a different search term.
            </div>
          )}
          
          {filteredCourses.map((course, index) => {
            const uniqueKey = `${course.courseCode}-${index}`;
            return (
              <div
                key={uniqueKey}
                className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-violet-500/40 rounded-xl shadow-xl shadow-violet-500/10 overflow-hidden transition-all duration-300 hover:border-violet-400/60 hover:shadow-violet-500/20"
              >
              {/* Course Header - Clickable */}
              <button
                onClick={() => toggleCourse(uniqueKey)}
                className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between hover:bg-violet-500/5 transition-colors duration-200"
              >
                <div className="flex items-center gap-2 md:gap-4">
                  <span className="inline-block px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-lg font-bold bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/30">
                    {course.courseCode}
                  </span>
                  <h3 className="text-sm md:text-lg font-semibold text-violet-200 text-left">
                    {course.courseName}
                  </h3>
                </div>
                <div className="text-violet-400 flex-shrink-0">
                  {expandedCourse === uniqueKey ? (
                    <FaChevronUp className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <FaChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </div>
              </button>

              {/* Course Details - Expandable */}
              {expandedCourse === uniqueKey && (
                <div className="px-4 md:px-6 pb-4 md:pb-6 pt-2 md:pt-3 border-t border-violet-500/20 bg-slate-900/50">
                  {/* Credit Hours */}
                  <div className="mb-3 md:mb-4">
                    <h4 className="text-xs md:text-sm font-bold text-violet-300 mb-1.5 md:mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-violet-500 rounded-full"></span>
                      Credit Hours
                    </h4>
                    <p className="text-gray-300 text-xs md:text-sm pl-3 md:pl-4">
                      {course.creditHours}
                    </p>
                  </div>

                  {/* Prerequisites */}
                  <div className="mb-3 md:mb-4">
                    <h4 className="text-xs md:text-sm font-bold text-violet-300 mb-1.5 md:mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-violet-500 rounded-full"></span>
                      Prerequisites
                    </h4>
                    <p className="text-gray-300 text-xs md:text-sm pl-3 md:pl-4">
                      {course.prerequisites}
                    </p>
                  </div>

                  {/* Objectives */}
                  <div className="mb-3 md:mb-4">
                    <h4 className="text-xs md:text-sm font-bold text-violet-300 mb-1.5 md:mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-violet-500 rounded-full"></span>
                      Course Objectives
                    </h4>
                    <p className="text-gray-300 text-xs md:text-sm pl-3 md:pl-4 leading-relaxed">
                      {course.objectives}
                    </p>
                  </div>

                  {/* Course Outcomes */}
                  {course.outcomes && course.outcomes.length > 0 && course.outcomes[0] !== 'Not available' && (
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-violet-300 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                        Course Outcomes
                      </h4>
                      <ul className="space-y-2 pl-4">
                        {course.outcomes.map((outcome, idx) => (
                          <li
                            key={idx}
                            className="text-gray-300 text-sm flex items-start gap-2"
                          >
                            <span className="text-violet-400 mt-1">•</span>
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Course Contents */}
                  {course.courseContents && course.courseContents.length > 0 && course.courseContents[0] !== 'Not available' && (
                    <div>
                      <h4 className="text-sm font-bold text-violet-300 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                        Course Contents
                      </h4>
                      <ul className="space-y-1.5 pl-4">
                        {course.courseContents.map((content, idx) => (
                          <li
                            key={idx}
                            className="text-gray-300 text-sm flex items-start gap-2"
                          >
                            <span className="text-violet-400 mt-1">•</span>
                            <span>{content}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
