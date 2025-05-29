'use client'

import React, { useState } from 'react'
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const SignupPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();
      console.log('Signup response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Store tokens
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refresh_token);

      // Dispatch login event
      window.dispatchEvent(new Event('login'));

      // Redirect to home page
      router.push('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      {/* Web Sign in - Shows only on lg screens and above */}
      <div className="flex min-h-screen justify-between max-lg:hidden">
        {/* Right panel with sign-up form */}
        <div className='flex flex-col justify-center items-center self-center w-1/2'>
          <h1 className="text-4xl font-bold mb-8 underline">Sign up</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className='flex flex-col text-lg space-y-2 w-3/4 max-w-md'>
            <label htmlFor="name" className='font-bold'>Name</label>
            <input 
              id='name'
              type="text" 
              required 
              value={formData.name}
              onChange={handleChange}
              className='border border-[#373E11] rounded-lg h-12 p-2 text-lg'
              placeholder='Enter your Name'
            />
            <label htmlFor="email" className='font-bold'>Email</label>
            <input 
              id='email'
              type="email" 
              required 
              value={formData.email}
              onChange={handleChange}
              className='border border-[#373E11] rounded-lg h-12 p-2 text-lg'
              placeholder='Enter your Email'
            />
            <label htmlFor="password" className='font-bold'>Password</label>
            <input 
              id='password'
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder='Enter your Password'
              className='border border-[#373E11] rounded-lg h-12 p-2 text-lg' 
            />
            <label htmlFor="confirmPassword" className='font-bold'>Confirm Password</label>
            <input 
              id='confirmPassword'
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder='Repeat Password'
              className='border border-[#373E11] rounded-lg h-12 p-2 text-lg' 
            />
            <button type="submit" className='bg-[#373E11] text-[#E6E4BB] p-2 mt-5 rounded-2xl hover:bg-[#454b28]'>Sign up</button>
          </form>
        </div>

        {/* Left panel with sign-in CTA */}
        <div className='bg-[#373E11] w-1/2 flex flex-col justify-center items-center'>
          <a href="/" className="absolute top-4 right-4">
            <img src="/plantelogowhite.svg" alt="logo" className='w-64' />
          </a>
          <h1 className='text-[#E6E4BB] text-6xl'>Welcome Back!</h1>
          <h2 className='text-[#E6E4BB] text-2xl text-center my-4'>To Keep Connect With Us <br /> Please Login Your Personal info</h2>
          <Link href="/login">
            <button type='submit' className='text-[#373E11] bg-[#E6E4BB] w-96 text-3xl rounded-2xl mt-6 p-2 transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110'>
              Log In
            </button>
          </Link>
        </div>
      </div>

      {/* Mobile & Tablet Sign up - Shows only on screens below lg */}
      <div className='lg:hidden flex flex-col min-h-screen'>
        <div className='flex flex-col items-center'>
          {/* Logo container with fixed position */}
          <div className='w-full flex justify-center pt-4 pb-4'>
            <Link href="/">
              <Image 
                src="/plantelogo.svg" 
                alt="logo" 
                width={224} 
                height={224}
                className='w-56'
                priority
              />
            </Link>
          </div>

          {/* Form container */}
          <div className='flex flex-col items-center px-4 py-3 w-full'>
            <h1 className="text-3xl font-bold mb-5 underline">Sign up</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-md space-y-3'>
              <label htmlFor="name" className="text-xl max-sm:text-lg">Name</label>
              <input 
                id='name'
                type="text" 
                required 
                value={formData.name}
                onChange={handleChange}
                className='border border-[#373E11] rounded-lg h-12 p-2 text-lg'
                placeholder='Enter your Name'
              />
              <label htmlFor="email" className="text-xl">Email</label>
              <input 
                id='email'
                type="email" 
                required 
                value={formData.email}
                onChange={handleChange}
                className='border border-[#373E11] rounded-lg h-12 p-2 text-lg'
                placeholder='Enter your Email'
              />
              <label htmlFor="password" className="text-xl">Password</label>
              <input 
                id='password'
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder='Enter your Password'
                className='border border-[#373E11] rounded-lg h-12 p-2 text-lg' 
              />
              <label htmlFor="confirmPassword" className="text-xl">Confirm Password</label>
              <input 
                id='confirmPassword'
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder='Repeat Password'
                className='border border-[#373E11] rounded-lg h-12 p-2 text-lg' 
              />
              <button type="submit" className='bg-[#373E11] text-[#E6E4BB] p-3 mt-2 rounded-2xl hover:bg-[#454b28] text-xl'>Sign up</button>
            </form>
            
            {/* Sign-up CTA */}
            <div className='mt-8 pt-8 border-t border-[#373E11] w-full max-w-md text-center'>
              <h2 className='text-xl mb-4'>Already Registered? <Link href="/login" className='underline text-blue-600'>Log in</Link></h2>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignupPage