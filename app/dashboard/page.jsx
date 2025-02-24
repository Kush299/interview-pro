import { UserButton } from '@clerk/nextjs'
import React from 'react'
import AddNewInterview from './_components/AddNewInterview'
import InterviewList from './_components/InterviewList'

function Dashboard() {
  return (
    <div className='p-10 min-h-screen bg-white'>
      <h2 className='font-bold text-2xl text-black'>
      Dashboard</h2>
      <h2 className='text-gray-700'>Create and Start your AI Mock Interview</h2>
      <div className='grid grid-col-1 md:grid-cols-3 my-5'>
        <AddNewInterview/>
      </div>
      
      {/* {Previous Interview List} */}
      <InterviewList/>
    </div>
  )
}

export default Dashboard