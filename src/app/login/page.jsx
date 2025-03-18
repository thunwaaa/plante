import React from 'react'
import Link from "next/link";

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <button>
        <a href="/signup">
            Sign up
        </a>
      </button>
    </div>
  )
}

export default page
