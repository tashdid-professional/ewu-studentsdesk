import { FaBookOpen, FaCalendarAlt, FaCalculator } from "react-icons/fa";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen  flex flex-col items-center justify-center p-4 pt-24">
      <div className="max-w-2xl w-full text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-2 drop-shadow-lg">
          East West University Ultimate Student&apos;s guide
        </h1>
        <p className="text-lg md:text-xl text-indigo-600 mb-6">
          Your all-in-one portal for planning, organizing, and excelling at EWU
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        {/* Course Planner Card */}
        <Link
          href="/course-planner"
          className="relative bg-gradient-to-br from-indigo-100 via-white to-blue-100 rounded-3xl shadow-2xl hover:scale-105 hover:shadow-indigo-300 transition-all duration-300 p-8 flex flex-col items-center border-2 border-indigo-200 hover:border-indigo-400 group overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-indigo-100 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-all duration-300 z-0" />
          <FaBookOpen size={64} className="mb-5 z-10 drop-shadow-xl text-indigo-600 group-hover:text-indigo-800 transition" />
          <h2 className="text-2xl font-extrabold text-indigo-700 mb-2 z-10 group-hover:text-indigo-900 transition">
            Course Planner
          </h2>
          <p className="text-indigo-500 text-base mb-4 z-10">
            Plan your courses, avoid time conflicts, and review sections easily.
          </p>
          <span className="mt-auto text-indigo-700 font-bold bg-indigo-100 px-4 py-2 rounded-full shadow group-hover:bg-indigo-200 transition z-10">
            Go to Planner →
          </span>
        </Link>
        {/* Routine Generator Card */}
        <Link
          href="/routine-generator"
          className="relative bg-gradient-to-br from-blue-100 via-white to-indigo-100 rounded-3xl shadow-2xl hover:scale-105 hover:shadow-blue-300 transition-all duration-300 p-8 flex flex-col items-center border-2 border-blue-200 hover:border-blue-400 group overflow-hidden"
        >
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-all duration-300 z-0" />
          <FaCalendarAlt size={64} className="mb-5 z-10 drop-shadow-xl text-blue-600 group-hover:text-blue-800 transition" />
          <h2 className="text-2xl font-extrabold text-blue-700 mb-2 z-10 group-hover:text-blue-900 transition">
            Routine Generator
          </h2>
          <p className="text-blue-500 text-base mb-4 z-10">
            Generate, view, and print your weekly class routine in style.
          </p>
          <span className="mt-auto text-blue-700 font-bold bg-blue-100 px-4 py-2 rounded-full shadow group-hover:bg-blue-200 transition z-10">
            Create Routine →
          </span>
        </Link>
        {/* CGPA Calculator Card */}
        <Link
          href="/cgpa-calculator"
          className="relative bg-gradient-to-br from-pink-100 via-white to-indigo-100 rounded-3xl shadow-2xl hover:scale-105 hover:shadow-pink-200 transition-all duration-300 p-8 flex flex-col items-center border-2 border-pink-100 hover:border-pink-300 group overflow-hidden"
        >
          <div className="absolute -top-8 -left-8 w-32 h-32 bg-pink-100 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-all duration-300 z-0" />
          <FaCalculator size={64} className="mb-5 z-10 drop-shadow-xl text-pink-500 group-hover:text-pink-700 transition" />
          <h2 className="text-2xl font-extrabold text-pink-600 mb-2 z-10 group-hover:text-pink-800 transition">
            CGPA Calculator
          </h2>
          <p className="text-pink-500 text-base mb-4 z-10">
            Calculate your term and total CGPA with ease and accuracy.
          </p>
          <span className="mt-auto text-pink-700 font-bold bg-pink-100 px-4 py-2 rounded-full shadow group-hover:bg-pink-200 transition z-10">
            Calculate CGPA →
          </span>
        </Link>
      </div>
    </div>
  );
}
