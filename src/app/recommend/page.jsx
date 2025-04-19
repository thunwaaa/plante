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
      <form className='m-4 p-2 flex flex-col items-center'>
        <div className="flex flex-wrap justify-center max-w-4xl gap-4 mx-auto p-4">
            <div className="w-full md:w-[calc(33.333%-1rem)]">
                <p>พื้นที่ปลูก</p>
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

            <div className="w-full md:w-[calc(33.333%-1rem)]">
                <p>ปริมาณแสง</p>
                <Select onChange={(e) => setType(e.target.value)} required>
                    <SelectTrigger className="w-full rounded-2xl border border-black">
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

            <div className="w-full md:w-[calc(33.333%-1rem)]">
                <p>เวลาดูแล</p>
                <Select onChange={(e) => setType(e.target.value)} required>
                    <SelectTrigger className="w-full rounded-2xl border border-black">
                    <SelectValue placeholder="เลือกเวลาดูแล" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                        <SelectItem value="เช้า">เช้า</SelectItem>
                        <SelectItem value="เย็น">เย็น</SelectItem>
                        <SelectItem value="ตลอดวัน">ตลอดวัน</SelectItem>
                    </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full md:w-[calc(33.333%-1rem)]">
                <p>ขนาดพื้นที่ (ตร.ม.)</p>
                <input 
                    type="number" 
                    className='border border-black rounded-2xl w-full p-1.5'
                    placeholder='กรอกขนาดพื้นที่'
                    required
                />
            </div>

            <div className="w-full md:w-[calc(33.333%-1rem)]">
                <p>ขนาดต้นไม้</p>
                <Select onChange={(e) => setType(e.target.value)} required>
                    <SelectTrigger className="w-full rounded-2xl border border-black">
                    <SelectValue placeholder="เลือกขนาด" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                        <SelectItem value="เช้า">เช้า</SelectItem>
                        <SelectItem value="เย็น">เย็น</SelectItem>
                        <SelectItem value="ตลอดวัน">ตลอดวัน</SelectItem>
                    </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full md:w-[calc(33.333%-1rem)]">
                <p>ความชื้น</p>
                <Select onChange={(e) => setType(e.target.value)} required>
                    <SelectTrigger className="w-full rounded-2xl border border-black">
                    <SelectValue placeholder="เลือกความชื้น" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                        <SelectItem value="เช้า">เช้า</SelectItem>
                        <SelectItem value="เย็น">เย็น</SelectItem>
                        <SelectItem value="ตลอดวัน">ตลอดวัน</SelectItem>
                    </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full md:w-[calc(33.333%-1rem)]">
                <p>วัตถุประสงค์ที่อยากปลูก</p>
                <Select onChange={(e) => setType(e.target.value)} required>
                    <SelectTrigger className="w-full rounded-2xl border border-black">
                    <SelectValue placeholder="วัตถุประสงค์" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                        <SelectItem value="เช้า">เช้า</SelectItem>
                        <SelectItem value="เย็น">เย็น</SelectItem>
                        <SelectItem value="ตลอดวัน">ตลอดวัน</SelectItem>
                    </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full md:w-[calc(33.333%-1rem)]">
                <p>ประสบการณ์</p>
                <Select onChange={(e) => setType(e.target.value)} required>
                    <SelectTrigger className="w-full rounded-2xl border border-black">
                    <SelectValue placeholder="ประสบการณ์การเลี้ยงต้นไม้" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                        <SelectItem value="เช้า">เช้า</SelectItem>
                        <SelectItem value="เย็น">เย็น</SelectItem>
                        <SelectItem value="ตลอดวัน">ตลอดวัน</SelectItem>
                    </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <button
            type="submit"
            className="text-[#E6E4BB] bg-[#373E11] mx-auto rounded-2xl p-2 w-50 mt-8"
        >
            ค้นหาพืชที่เหมาะสม
        </button>
        </form>

    
    </>
  )
}

export default page
