"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  updateProfile,
  sendEmailVerification 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/icons";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate input
      if (!email || !password || !username) {
        throw new Error("Please fill in all fields");
      }

      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created successfully:", userCredential.user.uid);
      
      // Update profile with username
      await updateProfile(userCredential.user, {
        displayName: username
      });
      console.log("Profile updated with username");

      // Send email verification
      try {
        await sendEmailVerification(userCredential.user);
        console.log("Verification email sent");
      } catch (verificationError) {
        console.error("Error sending verification email:", verificationError);
        // Continue with signup even if verification email fails
      }

      const idToken = await userCredential.user.getIdToken(true);
      console.log("Got fresh token");

      // Verify token with backend
      const response = await fetch("http://localhost:8080/auth/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to verify token");
      }

      const data = await response.json();
      console.log("Token verified with backend");
      
      // Store token and user data
      localStorage.setItem("token", idToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to login with success message
      router.push("/login?message=Please check your email to verify your account");
    } catch (error) {
      console.error("Signup error:", error);
      // Handle specific Firebase errors
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please login instead.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters long.");
      } else {
        setError(error.message || "An error occurred during signup. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      // Add scopes if needed
      provider.addScope('profile');
      provider.addScope('email');
      
      const userCredential = await signInWithPopup(auth, provider);
      console.log("Google signup successful:", userCredential.user.uid);

      const idToken = await userCredential.user.getIdToken(true);
      console.log("Got fresh token from Google signup");

      // Verify token with backend
      const response = await fetch("http://localhost:8080/auth/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to verify token");
      }

      const data = await response.json();
      console.log("Token verified with backend for Google signup");
      
      // Store token and user data
      localStorage.setItem("token", idToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (error) {
      console.error("Google signup error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setError("Signup cancelled. Please try again.");
      } else if (error.code === "auth/popup-blocked") {
        setError("Popup was blocked by your browser. Please allow popups for this site.");
      } else {
        setError(error.message || "An error occurred during Google signup. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Web Sign in - Shows only on lg screens and above */}
      <div className="flex min-h-screen justify-between max-lg:hidden">
        {/* Right panel with sign-up form */}
        <div className='flex flex-col justify-center items-center self-center w-1/2'>
          <h1 className="text-4xl font-bold mb-3 underline">Create an account</h1>
          <p> Enter your information to create your account</p>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleEmailSignup} className='flex flex-col text-lg space-y-2 w-3/4 max-w-md mt-4'>
            <label htmlFor="username" className='font-bold'>Username</label>
            <input 
              id='username'
              type="text" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='border border-[#373E11] rounded-lg h-12 p-2 text-base'
              placeholder='Enter your username'
            />
            <label htmlFor="signup-email-desktop" className='font-bold'>Email</label>
            <input 
              id='signup-email-desktop'
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='border border-[#373E11] rounded-lg h-12 p-2 text-base'
              placeholder='Enter your Email'
            />
            <label htmlFor="signup-password" className='font-bold'>Password</label>
            <input 
              id='signup-password'
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter your Password'
              className='border border-[#373E11] rounded-lg h-12 p-2 text-base' 
            />
            <Button type="submit" disabled={isLoading} className="border my-4 bg-[#373E11] text-[#E6E4BB] hover:bg-[#434726]">
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Account
            </Button>
            <div className="relative mt-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignup}
              className="mt-4"
            >
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.google className="mr-2 h-4 w-4" />
              )}
              Google
            </Button>
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
            <h1 className="text-3xl font-bold mb-3 underline">Create an account</h1>
            <p>Enter your information to create your account</p>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleEmailSignup} className='flex flex-col w-full max-w-md space-y-3 mt-4'>
              <label htmlFor="username" className="text-xl max-sm:text-lg">Username</label>
              <input 
                id='username'
                type="text" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='border border-[#373E11] rounded-lg h-12 p-2 text-lg'
                placeholder='Enter your Name'
              />
              <label htmlFor="signup-email-mobile" className="text-xl">Email</label>
              <input 
                id='signup-email-mobile'
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='border border-[#373E11] rounded-lg h-12 p-2 text-lg'
                placeholder='Enter your Email'
              />
              <label htmlFor="signup-password" className="text-xl">Password</label>
              <input 
                id='signup-password'
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter your Password'
                className='border border-[#373E11] rounded-lg h-12 p-2 text-lg' 
              />
              <Button type="submit" disabled={isLoading} className="border mt-4 mb-6 bg-[#373E11] text-[#E6E4BB] hover:bg-[#434726]">
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Account
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground ">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={handleGoogleSignup}
                className="my-4"
              >
                {isLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.google className="mr-2 h-4 w-4" />
                )}
                Google
              </Button>
            </form>
            
            {/* Sign-up CTA */}
            <div className='mt-4 pt-4 border-t border-[#373E11] w-full max-w-md text-center'>
              <h2 className='text-lg mb-4'>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="hover:text-brand underline underline-offset-4"
                >
                  Sign in
                </Link>
              </h2>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}