"use client";
import { useState } from "react";

const gradePoints = {
  "A+": 4.0, "A": 3.75, "A-": 3.5,
  "B+": 3.25, "B": 3.0, "B-": 2.75,
  "C+": 2.5, "C": 2.25, 
  "D": 2.0, "F": 0.0
};

export default function CgpaCalculator() {
  const [courses, setCourses] = useState([
    { name: "", credit: "", grade: "" },
    { name: "", credit: "", grade: "" },
    { name: "", credit: "", grade: "" }
  ]);
  const [prevCredit, setPrevCredit] = useState("");
  const [prevCgpa, setPrevCgpa] = useState("");
  const [termCgpa, setTermCgpa] = useState(null);
  const [totalCgpa, setTotalCgpa] = useState(null);

  const handleCourseChange = (idx, field, value) => {
    const updated = courses.map((c, i) => i === idx ? { ...c, [field]: value } : c);
    setCourses(updated);
  };

  const addCourse = () => setCourses([...courses, { name: "", credit: "", grade: "" }]);
  const removeCourse = (idx) => setCourses(courses.filter((_, i) => i !== idx));

  const calculate = () => {
    let totalPoints = 0, totalCredits = 0;
    for (const c of courses) {
      const credit = parseFloat(c.credit);
      const gp = gradePoints[c.grade.toUpperCase()] ?? null;
      if (!isNaN(credit) && gp !== null) {
        totalPoints += credit * gp;
        totalCredits += credit;
      }
    }
    const term = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : null;
    setTermCgpa(term);

    // Total CGPA calculation
    const prevCr = parseFloat(prevCredit);
    const prevCg = parseFloat(prevCgpa);
    let totalCg = null;
    if (!isNaN(prevCr) && !isNaN(prevCg) && totalCredits > 0) {
      const newTotalCredits = prevCr + totalCredits;
      const newTotalPoints = prevCg * prevCr + totalPoints;
      totalCg = (newTotalPoints / newTotalCredits).toFixed(3);
    } else if (totalCredits > 0) {
      totalCg = term;
    }
    setTotalCgpa(totalCg);
  };

  return (
    <div className="max-w-lg mx-auto bg-gradient-to-br from-blue-50 via-white to-indigo-100 rounded-2xl shadow-xl p-6 mt-8 border-2 border-blue-200/60 relative overflow-hidden">
      <div className="absolute -top-8 -left-8 w-28 h-28 bg-blue-200 rounded-full blur-2xl opacity-30 z-0" />
      <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-indigo-200 rounded-full blur-2xl opacity-30 z-0" />
      <h2 className="text-2xl font-extrabold text-blue-700 mb-4 text-center drop-shadow-lg z-10 relative tracking-tight">CGPA Calculator</h2>
      <div className="space-y-3 z-10 relative">
        {courses.map((c, idx) => (
          <div key={idx} className="flex gap-2 items-center bg-white/80 rounded-lg shadow p-2 border border-blue-100 hover:border-blue-300 transition">
            <input
              type="text"
              className="flex-1 p-1.5 border-2 border-blue-200 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none font-semibold text-blue-700 bg-blue-50 placeholder:text-blue-300 text-sm"
              placeholder="Course Name (optional)"
              value={c.name}
              onChange={e => handleCourseChange(idx, "name", e.target.value)}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-20 p-1.5 border-2 border-blue-200 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none font-semibold text-blue-700 bg-blue-50 placeholder:text-blue-300 text-sm"
              placeholder="Credit"
              value={c.credit}
              onChange={e => handleCourseChange(idx, "credit", e.target.value)}
            />
            <select
              className="w-20 p-1.5 border-2 border-blue-200 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none font-semibold text-blue-700 bg-blue-50 text-sm"
              value={c.grade}
              onChange={e => handleCourseChange(idx, "grade", e.target.value)}
            >
              <option value="">Grade</option>
              {Object.keys(gradePoints).map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <button
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:hover:bg-transparent group"
              onClick={() => removeCourse(idx)}
              disabled={courses.length === 1}
              title="Remove course"
            >
              <svg 
                className="w-4 h-4 group-hover:scale-110 transition-transform" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          </div>
        ))}
        <button
          className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-4 py-1.5 rounded-full shadow font-bold hover:from-blue-500 hover:to-indigo-600 transition text-sm flex items-center gap-2 mx-auto"
          onClick={addCourse}
        >
          <span className="text-lg">＋</span> Add Course
        </button>
      </div>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 z-10 relative">
        <input
          type="number"
          min="0"
          step="0.01"
          className="w-full p-2 border-2 border-blue-200 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none font-semibold text-blue-700 bg-blue-50 placeholder:text-blue-300 text-sm"
          placeholder="Previous Total Credits (optional)"
          value={prevCredit}
          onChange={e => setPrevCredit(e.target.value)}
        />
        <input
          type="number"
          min="0"
          step="0.01"
          className="w-full p-2 border-2 border-blue-200 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none font-semibold text-blue-700 bg-blue-50 placeholder:text-blue-300 text-sm"
          placeholder="Previous CGPA (optional)"
          value={prevCgpa}
          onChange={e => setPrevCgpa(e.target.value)}
        />
      </div>
      <button
        className="mt-6 w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-2 rounded-xl font-extrabold shadow hover:from-green-500 hover:to-blue-600 transition text-base tracking-wide z-10 relative"
        onClick={calculate}
      >
        Calculate
      </button>
      <div className="mt-6 text-center space-y-1 z-10 relative">
        {termCgpa && <div className="text-base font-semibold">Term CGPA: <span className="font-bold text-blue-700">{termCgpa}</span></div>}
        {totalCgpa && <div className="text-base font-semibold">Total CGPA: <span className="font-bold text-green-700">{totalCgpa}</span></div>}
      </div>
    </div>
  );
}
