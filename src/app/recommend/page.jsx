'use client'
import React from 'react'
import { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

import { useRouter } from 'next/navigation';

const page = () => {
  const [area, setArea] = useState('');
  const [light, setLight] = useState('');
  const [size, setSize] = useState('');
  const [water, setWater] = useState('');
  const [purpose, setPurpose] = useState('');
  const [experience, setExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Build query parameters from selected values
      const queryParams = new URLSearchParams();
      if (area) queryParams.append('area', area);
      if (light) queryParams.append('light', light);
      if (size) queryParams.append('size', size);
      if (water) queryParams.append('water', water);
      if (purpose) queryParams.append('purpose', purpose);
      if (experience) queryParams.append('experience', experience);

      // Fetch recommendations from the API - use the backend URL
      const response = await fetch(`http://localhost:8080/api/recommendations?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Navigate to the results page with query parameters
      router.push(`/recommend/results?${queryParams.toString()}`);

    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('เกิดข้อผิดพลาดในการค้นหาพืชที่เหมาะสม');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className='text-3xl md:text-4xl font-bold text-center m-3 mt-8'>พืชที่เหมาะสมกับคุณ</h1>
      <p className='text-center items-center'>ค้นหาต้นไม้ที่เหมาะสมกับสภาพแวดล้อมและไลฟ์สไตล์ของคุณ</p>
      
      {error && (
        <div className="text-center text-red-600 mt-4">
          {error}
        </div>
      )}

      <form onSubmit={handleRecommend} className='m-4 p-2 flex flex-col items-center w-full'>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto p-6 w-full">
            <div className="w-full px-4">
                <p className="font-bold mb-2 text-lg">พื้นที่ปลูก</p>
                <Select onValueChange={setArea} required>
                    <SelectTrigger className="w-full rounded-2xl border border-black h-12">
                    <SelectValue placeholder="เลือกพื้นที่" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                        <SelectItem value="ระเบียง">ระเบียง</SelectItem>
                        <SelectItem value="หน้าต่าง">หน้าต่าง</SelectItem>
                        <SelectItem value="สวนหลังบ้าน">สวนหลังบ้าน</SelectItem>
                        <SelectItem value="สวนหน้าบ้าน">สวนหน้าบ้าน</SelectItem>
                        <SelectItem value="ห้องนั่งเล่น">ห้องนั่งเล่น</SelectItem>
                        <SelectItem value="ห้องครัว">ห้องครัว</SelectItem>
                        <SelectItem value="ห้องน้ำ">ห้องน้ำ</SelectItem>
                    </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full px-4">
                <p className="font-bold mb-2 text-lg">ปริมาณแสง</p>
                <Select onValueChange={setLight} required>
                    <SelectTrigger className="w-full rounded-2xl border border-black h-12">
                    <SelectValue placeholder="เลือกปริมาณแสง" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                        <SelectItem value="มาก">มาก (8 ชม./วัน)</SelectItem>
                        <SelectItem value="ปานกลาง">ปานกลาง (4-5 ชม./วัน)</SelectItem>
                        <SelectItem value="น้อย">น้อย (3 ชม./วัน)</SelectItem>
                    </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full px-4">
                <p className="font-bold mb-2 text-lg">ขนาดต้นไม้</p>
                <Select onValueChange={setSize} required>
                    <SelectTrigger className="w-full rounded-2xl border border-black h-12">
                    <SelectValue placeholder="เลือกขนาด" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                        <SelectItem value="เล็ก">เล็ก (สูงไม่เกิน 30 ซม.)</SelectItem>
                        <SelectItem value="กลาง">กลาง (สูง 30-100 ซม.)</SelectItem>
                        <SelectItem value="ใหญ่">ใหญ่ (สูงเกิน 100 ซม.)</SelectItem>
                    </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full px-4">
                <p className="font-bold mb-2 text-lg">ความถี่การรดน้ำ</p>
                <Select onValueChange={setWater} required>
                    <SelectTrigger className="w-full rounded-2xl border border-black h-12">
                    <SelectValue placeholder="เลือกความชื้น" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                        <SelectItem value="ต่ำ">ต่ำ (รดน้ำ 1-2 ครั้ง/สัปดาห์)</SelectItem>
                        <SelectItem value="ปานกลาง">ปานกลาง (รดน้ำ 2-3 ครั้ง/สัปดาห์)</SelectItem>
                        <SelectItem value="สูง">สูง (รดน้ำทุกวัน)</SelectItem>
                    </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full px-4">
                <p className="font-bold mb-2 text-lg">วัตถุประสงค์ที่อยากปลูก</p>
                <Select onValueChange={setPurpose} required>
                    <SelectTrigger className="w-full rounded-2xl border border-black h-12">
                    <SelectValue placeholder="วัตถุประสงค์" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                        <SelectItem value="ประดับ">ประดับตกแต่ง</SelectItem>
                        <SelectItem value="ผัก">ปลูกผักสวนครัว</SelectItem>
                        <SelectItem value="สมุนไพร">ปลูกสมุนไพร</SelectItem>
                        <SelectItem value="ฟอกอากาศ">ฟอกอากาศ</SelectItem>
                        <SelectItem value="ผลไม้">ปลูกผลไม้</SelectItem>
                    </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full px-4">
                <p className="font-bold mb-2 text-lg">ประสบการณ์</p>
                <Select onValueChange={setExperience} required>
                    <SelectTrigger className="w-full rounded-2xl border border-black h-12">
                    <SelectValue placeholder="ประสบการณ์การเลี้ยงต้นไม้" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                        <SelectItem value="น้อย">มีประสบการณ์น้อย (1-2 ปี)</SelectItem>
                        <SelectItem value="ปานกลาง">มีประสบการณ์ปานกลาง (2-5 ปี)</SelectItem>
                        <SelectItem value="มาก">มีประสบการณ์มาก (5 ปีขึ้นไป)</SelectItem>
                    </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <button
            type="submit"
            disabled={loading}
            className={`text-[#E6E4BB] bg-[#373E11] mx-auto rounded-2xl px-8 max-sm:px-5 max-sm:py-3 max-sm:text-sm py-3 text-lg font-bold mt-8 hover:bg-[#454b28] transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
            {loading ? 'กำลังค้นหา...' : 'ค้นหาพืชที่เหมาะสม'}
        </button>
      </form>
    </>
  )
}

export default page
