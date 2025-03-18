"use client"
import React from 'react'
import { useRouter } from "next/navigation";
const page = () => {
    const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Login Page</h1>
      <button
        onClick={() => router.push("/signup")}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
      >
        สมัครสมาชิก
      </button>
      <button
        onClick={() => router.push("/login")}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
      >
        log in
      </button>
    </div>
  )
}

export default page
