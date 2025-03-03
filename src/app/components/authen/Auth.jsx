import React from 'react'

export const Auth = () => {
  return (
    <div className='flex text-xl mt-[-46px] items-center '>
        <button 
            className='
                mr-4 p-2 border rounded-3xl w-24
                border-[#373E11] text-[#373E11] 
                hover:bg-[#373E11] hover:text-[#E6E4BB]
                transition duration-300'
        >
            <a href="/">Sign in</a>
        </button>
        <button 
            className='
                mr-2 p-2 border rounded-3xl w-24
                 bg-[#373E11] text-[#E6E4BB]
                 hover:text-[#373E11] hover:bg-[#E6E4BB]
                 transition duration-300'
        >
            <a href="/">Sign in</a>
        </button>
    </div>
  )
}

export default Auth
