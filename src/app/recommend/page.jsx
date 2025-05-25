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

const page = () => {
  return (
    <>
      <h1 className='text-3xl font-bold text-center m-3'>พืชที่เหมาะสมกับคุณ</h1>
      <p className='text-center'>ค้นหาต้นไม้ที่เหมาะสมกับสภาพแวดล้อมและไลฟ์สไตล์ของคุณ</p>
      <form className='m-4 p-2 flex flex-col items-center w-full'>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto p-6 w-full">
            <div className="w-full px-4">
                <p className="font-bold mb-2 text-lg">พื้นที่ปลูก</p>
                <Select onChange={(e) => setType(e.target.value)} required>
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
                <Select onChange={(e) => setType(e.target.value)} required>
                    <SelectTrigger className="w-full rounded-2xl border border-black h-12">
                    <SelectValue placeholder="เลือกปริมาณแสง" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                        <SelectItem value="มาก">มาก</SelectItem>
                        <SelectItem value="ปานกลาง">ปานกลาง</SelectItem>
                        <SelectItem value="น้อย">น้อย</SelectItem>
                    </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full px-4">
                <p className="font-bold mb-2 text-lg">ขนาดต้นไม้</p>
                <Select onChange={(e) => setType(e.target.value)} required>
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
                <Select onChange={(e) => setType(e.target.value)} required>
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
                <Select onChange={(e) => setType(e.target.value)} required>
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
                <Select onChange={(e) => setType(e.target.value)} required>
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
            className="text-[#E6E4BB] bg-[#373E11] mx-auto rounded-2xl px-8 py-3 text-lg font-bold mt-8 hover:bg-[#454b28] transition-colors"
        >
            ค้นหาพืชที่เหมาะสม
        </button>
        </form>

    
    </>
  )
}

export default page
