'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
const page = () => {
  const router = useRouter()

  const goToNewPage = () => {
    router.push('/dashboard/new')
  }
  return (
    <>
      <h1 className='max-sm:text-3xl md:text-4xl lg:text-5xl font-extrabold flex justify-center mt-12'>ต้นไม้ของคุณ</h1>

      <div className="flex justify-center mt-8">
        <button
          onClick={goToNewPage}
          className='flex justify-center items-center max-sm:w-80 md:w-3xl lg:w-7xl border m-4 p-12 rounded-3xl opacity-85 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-95'
        >
          <Plus className="w-12 h-12 md:w-18 md:h-18 lg:w-20 lg:h-20 opacity-55" />
        </button>
      </div>
    </>
  )
}

export default page
