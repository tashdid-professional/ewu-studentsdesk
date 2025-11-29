import CoursePlanner from '@/components/course-planner'
import React from 'react'
import Navigation from '@/components/Navigation'

function page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />
      <CoursePlanner/>
    </div>
  )
}

export default page
