'use client'
import React from 'react'
import { BookText } from 'lucide-react';
import { TriangleAlert } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

const page = () => {
  return (
    <>
    <div className='flex flex-col justify-center items-center mt-8'>
      <h1 className='text-3xl font-bold mb-3'>วิเคราะห์อาการต้นไม้</h1>
      <p>โปรดกรอกข้อมูล เพื่อนำไปวิเคราะห์ปัญหาและรับคำแนะนำในการแก้ไข</p>
    </div>
    <div className='flex flex-col justify-center items-center mt-8'>
        <div className='flex'>
            <BookText size={28} absoluteStrokeWidth />
            <h2 className='ml-2 font-bold text-lg'>ข้อมูลเบื้องต้น</h2>
        </div>

        <div className='flex flex-wrap justify-center max-w-4xl gap-4 mt-4'>
            <div className='w-64 md:w-[calc(50%-1rem)]'>
                <p>ชนิดต้นไม้</p>
                <input 
                    type="text" placeholder='ชนิดต้นไม้' 
                    className='border rounded-2xl p-1.5 w-full font-bold'/>
            </div>

            <div className='w-64 md:w-[calc(50%-1rem)]'>
                <p>อายุต้นไม้</p>
                <input 
                    type="text" placeholder='เช่น 5 เดือน หรือ 1 ปี' 
                    className='border rounded-2xl p-1.5 w-full font-bold'/>
            </div>
        </div>

        <div className='flex mt-8'>
            <TriangleAlert size={28} absoluteStrokeWidth />
            <h2 className='ml-2 font-bold text-lg'>ข้อมูลเบื้องต้น</h2>
        </div>

        <div className='w-96 md:w-[calc(100%-1rem)]'>
            <p>ส่วนที่มีปัญหา</p>
            <Select onChange={(e) => setType(e.target.value)} required>
                <SelectTrigger className="w-full rounded-2xl border border-black">
                <SelectValue placeholder="เลือกพื้นที่" />
                </SelectTrigger>
                <SelectContent>
                <SelectGroup>
                    <SelectItem value="ไม้ผล">ไม้ผล</SelectItem>
                    <SelectItem value="ไม้ดอก">ไม้ดอก</SelectItem>
                    <SelectItem value="ไม้ประดับ">ไม้ประดับ</SelectItem>
                    <SelectItem value="สมุนไพร">สมุนไพร</SelectItem>
                </SelectGroup>
                </SelectContent>
            </Select>
        </div>

        <div>
             
        </div>
        
    </div>
    </>
  )
}

export default page
