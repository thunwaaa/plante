"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setEmail("");
    } catch (error) {
      console.error("Password reset error:", error);
      if (error.code === "auth/invalid-email") {
        setError("กรุณากรอกอีเมลที่ถูกต้อง");
      } else if (error.code === "auth/user-not-found") {
        setError("ไม่พบผู้ใช้ที่ใช้อีเมลนี้");
      } else {
        setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="w-full flex justify-center mb-8">
        <Link href="/">
          <Image 
            src="/plantelogo.svg" 
            alt="logo" 
            width={224} 
            height={224}
            className="w-56"
            priority
          />
        </Link>
      </div>

      {/* Reset Password Form */}
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg border border-[#373E11]">
        <h1 className="text-2xl font-bold text-center mb-6">รีเซ็ตรหัสผ่าน</h1>
        
        {success ? (
          <div className="text-center">
            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
              <p>เราได้ส่งอีเมลสำหรับรีเซ็ตรหัสผ่านไปยัง {email} แล้ว</p>
              <p className="mt-2 text-sm">กรุณาตรวจสอบอีเมลของคุณและทำตามขั้นตอนในอีเมลเพื่อรีเซ็ตรหัสผ่าน</p>
            </div>
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-[#373E11] text-[#E6E4BB] hover:bg-[#434726]"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Button>
          </div>
        ) : (
          <>
            <p className="text-gray-600 text-center mb-6">
              กรอกอีเมลที่ใช้ลงทะเบียน เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้คุณ
            </p>
            
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#373E11] rounded-lg h-12 p-2 text-base"
                  placeholder="กรอกอีเมลของคุณ"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#373E11] text-[#E6E4BB] hover:bg-[#434726]"
              >
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                ส่งลิงก์รีเซ็ตรหัสผ่าน
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-[#373E11] hover:underline"
              >
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 