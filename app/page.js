import CoursePlannerCard from "../components/CoursePlannerCard";
import RoutineGeneratorCard from "../components/RoutineGeneratorCard";
import CgpaCalculatorCard from "../components/CgpaCalculatorCard";
import CourseHubCard from "../components/CourseHubCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-4 lg:pt-24 pt-16 relative overflow-hidden">
      {/* Dark Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700/20 via-gray-900/40 to-black"></div>
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full text-center lg:mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 drop-shadow-2xl bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
          East West University Ultimate Student&apos;s guide
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-6 drop-shadow-lg">
          Your all-in-one portal for planning, organizing, and excelling at EWU
        </p>
        
        {/* Subtle accent line */}
        <div className="mx-auto w-24 h-0.5 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600 rounded-full "></div>
      </div>
      
      {/* First Row - 3 Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 lg:gap-16 gap-8 w-full max-w-6xl mb-8">
        {/* Animated 3D Cards */}
        <CoursePlannerCard />
        <RoutineGeneratorCard />
        <CgpaCalculatorCard />
      </div>
      
      {/* Second Row - Course Hub Card (centered) */}
      <div className="relative z-10 w-full max-w-6xl flex justify-center">
        <div className="w-full md:w-1/3">
          <CourseHubCard />
        </div>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-gray-500 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-1 h-1 bg-gray-400 rounded-full opacity-40 animate-pulse delay-1000"></div>
      <div className="absolute bottom-32 left-32 w-1.5 h-1.5 bg-gray-600 rounded-full opacity-25 animate-pulse delay-500"></div>
      <div className="absolute bottom-20 right-10 w-1 h-1 bg-gray-500 rounded-full opacity-35 animate-pulse delay-1500"></div>
    </div>
  );
}
