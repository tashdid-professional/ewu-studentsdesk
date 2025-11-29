import React from 'react'
import RoutineGenerator from '@/components/Routine-generator'
import Navigation from '@/components/Navigation'

function page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />
      <RoutineGenerator />
    </div>
  )
}

export default page
