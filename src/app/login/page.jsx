"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/icons";
import { Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Login with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // Verify token with backend
      const response = await fetch("http://localhost:8080/auth/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to verify token");
      }

      const data = await response.json();
      
      // Store token and user data in localStorage
      localStorage.setItem("token", idToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Wait a bit to ensure localStorage is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify token is stored before redirecting
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        throw new Error("Failed to store authentication token");
      }

      // Show success toast
      toast.success('เข้าสู่ระบบสำเร็จ!', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#373E11',
          color: '#E6E4BB',
        },
      });

      // Check if there's a redirect path stored
      const redirectPath = localStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        localStorage.removeItem("redirectAfterLogin"); // Clear the stored path
        router.push(redirectPath);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Clear any partial data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Show error toast based on error type
      if (error.code === "auth/invalid-credential") {
        toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#FEE2E2',
            color: '#991B1B',
            border: '1px solid #FCA5A5',
          },
        });
      } else if (error.code === "auth/user-not-found") {
        toast.error('ไม่พบผู้ใช้ที่ใช้อีเมลนี้', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#FEE2E2',
            color: '#991B1B',
            border: '1px solid #FCA5A5',
          },
        });
      } else if (error.code === "auth/too-many-requests") {
        toast.error('มีการพยายามเข้าสู่ระบบมากเกินไป กรุณารอสักครู่แล้วลองใหม่', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#FEE2E2',
            color: '#991B1B',
            border: '1px solid #FCA5A5',
          },
        });
      } else {
        toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#FEE2E2',
            color: '#991B1B',
            border: '1px solid #FCA5A5',
          },
        });
      }
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();

      // Verify token with backend
      const response = await fetch("http://localhost:8080/auth/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to verify token");
      }

      const data = await response.json();
      
      // Store token and user data in localStorage
      localStorage.setItem("token", idToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Wait a bit to ensure localStorage is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify token is stored before redirecting
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        throw new Error("Failed to store authentication token");
      }

      // Check if there's a redirect path stored
      const redirectPath = localStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        localStorage.removeItem("redirectAfterLogin"); // Clear the stored path
        router.push(redirectPath);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError(error.message);
      // Clear any partial data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster />
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
            <button type='button' className='text-[#373E11] bg-[#E6E4BB] w-96 text-3xl rounded-2xl mt-6 p-2 transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110'>
              Sign up
            </button>
          </Link>
        </div>
        {/* Right panel with sign-in form */}
        <div className='flex flex-col justify-center items-center self-center w-1/2'>
          <h1 className="text-4xl font-bold underline mb-3">Sign in</h1>
          <p className="mt-3">Enter your email to sign in to your account</p>
          <form onSubmit={handleEmailLogin} className='flex flex-col text-2xl space-y-3 w-3/4 max-w-md mt-4'>
            <label htmlFor="email-desktop">Email</label>
            <input 
              id='email-desktop'
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='border border-[#373E11] rounded-lg h-12 p-2 text-base'
              placeholder='Enter your Email'
            />
            <label htmlFor="login-password-desktop">Password</label>
            <div className="relative">
              <input 
                id='login-password-desktop'
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter your Password'
                className='border border-[#373E11] rounded-lg h-12 p-2 text-base w-full pr-10' 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <Button type="submit" disabled={isLoading} className="border my-4 bg-[#373E11] text-[#E6E4BB] hover:bg-[#434726]">
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign In
            </Button>
            <div className="relative">
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
              onClick={handleGoogleLogin}
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
          <div className="text-sm text-muted-foreground text-center mt-3">
            <Link
              href="/forgot-password"
              className="hover:text-brand underline underline-offset-4"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Sign in - Shows only on screens below lg */}
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
            <h1 className="text-3xl font-bold mb-5 underline">Sign in</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleEmailLogin} className='flex flex-col w-full max-w-md space-y-3'>
              <label htmlFor="email" className="text-xl">Email</label>
              <input 
                id='email'
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='border border-[#373E11] rounded-lg h-12 p-2 text-lg'
                placeholder='Enter your Email'
              />
              <label htmlFor="password" className="text-xl">Password</label>
              <div className="relative">
                <input 
                  id='password'
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Enter your Password'
                  className='border border-[#373E11] rounded-lg h-12 p-2 text-base w-full pr-10' 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <Button type="submit" disabled={isLoading} className="border my-4 bg-[#373E11] text-[#E6E4BB] hover:bg-[#434726]">
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign In
              </Button>

              <div className="relative">
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
                onClick={handleGoogleLogin}
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
            
            
            {/* Sign-in CTA */}
            <div className="text-sm text-muted-foreground text-center mt-2">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="hover:text-brand underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}