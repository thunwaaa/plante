import React from 'react'
import Link from "next/link";

const page = () => {
  return (
    <>
      {/* Web Sign in - Shows only on lg screens and above */}
      <div className="flex min-h-screen justify-between max-lg:hidden">
        {/* Left panel with sign-up CTA */}
        <div className='bg-[#373E11] w-1/2 flex flex-col justify-center items-center'>
          <a href="/" className="absolute top-4 left-4">
            <img src="/plantelogowhite.svg" alt="logo" className='w-64' />
          </a>
          <h1 className='text-[#E6E4BB] text-6xl'>New Here?</h1>
          <h2 className='text-[#E6E4BB] text-2xl text-center my-4'>Get exclusive access to cool features and <br /> unlimited benefits. Sign up now and <br /> start exploring plante world!</h2>
          <Link href="/signup">
            <button type='submit' className='text-[#373E11] bg-[#E6E4BB] w-96 text-3xl rounded-2xl mt-6 p-2 transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110'>
              Sign up
            </button>
          </Link>
        </div>
        {/* Right panel with sign-in form */}
        <div className='flex flex-col justify-center items-center self-center w-1/2'>
          <h1 className="text-4xl font-bold mb-8 underline">Sign in</h1>
          <form action="" method="post" className='flex flex-col text-2xl space-y-4 w-3/4 max-w-md'>
            <label htmlFor="email-web">Email</label>
            <input 
              id='email-web'
              type="email" 
              required 
              className='border border-[#373E11] rounded-lg h-12 p-2 text-lg'
              placeholder='Enter your Email'
            />
            <label htmlFor="password-web">Password</label>
            <input 
              id='password-web'
              type="password"
              placeholder='Enter your Password'
              className='border border-[#373E11] rounded-lg h-12 p-2 text-lg' 
            />
            <button type="button" className='bg-[#373E11] text-[#E6E4BB] p-2 mt-5 rounded-2xl hover:bg-[#454b28]'>Sign in</button>
          </form>
        </div>
      </div>

      {/* Mobile & Tablet Sign in - Shows only on screens below lg */}
      <div className='lg:hidden flex flex-col min-h-screen'>
        {/* Mobile sign-in form */}
        <a href="/" className='flex justify-center pt-12'>
          <img src="/plantelogo.svg" alt="logo" className='w-56 top-0 inset-0' />
        </a>
        <div className='flex flex-col flex-grow justify-center items-center px-6 py-8 mt-[-96] md:mt-[-256]'>
          <h1 className="text-4xl font-bold mb-12">Login</h1>
          <form action="" method="post" className='flex flex-col w-full max-w-md space-y-4'>
            <label htmlFor="email-mobile" className="text-xl">Email</label>
            <input 
              id='email-mobile'
              type="email" 
              required 
              className='border border-[#373E11] rounded-lg h-12 p-2 text-lg'
              placeholder='Enter your Email'
            />
            <label htmlFor="password-mobile" className="text-xl">Password</label>
            <input 
              id='password-mobile'
              type="password"
              placeholder='Enter your Password'
              className='border border-[#373E11] rounded-lg h-12 p-2 text-lg' 
            />
            <button type="button" className='bg-[#373E11] text-[#E6E4BB] p-3 mt-5 rounded-2xl hover:bg-[#454b28] text-xl'>LOGIN</button>
          </form>
          
          {/* Mobile sign-up CTA */}
          <div className='mt-10 pt-8 border-t border-[#373E11] w-full max-w-md text-center'>
            <h2 className='text-xl mb-4'>Don't have an account? <Link href="/signup" className='underline text-blue-600'>Sign up</Link></h2>
          </div>
        </div>
      </div>
    </>
  )
}

export default page