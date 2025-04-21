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
  import { Thermometer } from 'lucide-react';

const page = () => {
  return (
    <>
    <div className='flex flex-col justify-center text-center mt-8'>
      <h1 className='text-3xl font-bold mb-3'>วิเคราะห์อาการต้นไม้</h1>
      <p className='max-sm:w-72 mx-auto'>โปรดกรอกข้อมูล เพื่อนำไปวิเคราะห์ปัญหาและรับคำแนะนำในการแก้ไข</p>
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
            <h2 className='ml-2 font-bold text-lg'>อาการที่พบ</h2>
        </div>

        <div className='w-64 md:w-[calc(50%-1rem)]'>
            <p className='mt-4 mb-2'>ส่วนที่มีปัญหา</p>
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
        <div className='w-64 md:w-[calc(50%-1rem)] mt-4'>
            <p>ลักษณะอาการ</p>
            <div className='grid lg:grid-cols-3 md:grid-cols-2 gap-x-4 gap-y-2'>
                <div>
                    <input type="checkbox" id="yellow" value="yellow" className='m-2'/>
                    <label htmlFor="yellow">ใบเหลือง</label>
                </div>
                <div>
                    <input type="checkbox" id='withered' value='witered' className='m-2'/>
                    <label htmlFor="withered">ใบเหี่ยว</label>
                </div>
                <div>
                    <input type="checkbox" id='brown' value='brown' className='m-2'/>
                    <label htmlFor="brown">ใบมีจุดสีน้ำตาล</label>
                </div>
                <div>
                    <input type="checkbox" id='fall' value='fall' className='m-2'/>
                    <label htmlFor="fall">ใบร่วง</label>
                </div>
                <div>
                    <input type="checkbox" id='rotten_stem' value='rotten_stem' className='m-2'/>
                    <label htmlFor="rotten_stem">ลำต้นเน่า</label>
                </div>
                <div>
                    <input type="checkbox" id='pest' value='pest' className='m-2'/>
                    <label htmlFor="pest">มีแมลง</label>
                </div>
                <div>
                    <input type="checkbox" id='flower_fall' value='flower_fall' className='m-2'/>
                    <label htmlFor="flower_fall">ดอกร่วง</label>
                </div>
                <div>
                    <input type="checkbox" id='not_bloom' value='not_bloom' className='m-2'/>
                    <label htmlFor="not_bloom">ไม่ออกดอก</label>
                </div>
                <div>
                    <input type="checkbox" id='root_rot' value='root_rot' className='m-2'/>
                    <label htmlFor="root_rot">รากเน่า</label>
                </div>
            </div>
        </div>

        <div>
            <div className='flex mt-4 items-center'>
                <Thermometer size={28} absoluteStrokeWidth />
                <h2 className='ml-2 font-bold text-lg'>สภาพแวดล้อม</h2>
            </div>
            <div className='flex flex-wrap justify-center gap-4 mt-4'>
                <div className='w-64 md:w-[calc(50%-1rem)]'>
                    <p>ความถี่การรดน้ำ</p>
                    
                    <Select onChange={(e) => setType(e.target.value)} required>
                        <SelectTrigger className="w-full rounded-2xl border border-black">
                        <SelectValue placeholder="เลือกความถี่" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectGroup>
                            <SelectItem value="ทุกวัน">ทุกวัน</SelectItem>
                            <SelectItem value="ทุก 2 วัน">ทุก 2 วัน</SelectItem>
                            <SelectItem value="ทุก 3 วัน">ทุก 3 วัน</SelectItem>
                            <SelectItem value="ทุกสัปดาห์">ทุกสัปดาห์</SelectItem>
                        </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className='w-64 md:w-[calc(50%-1rem)]'>
                    <p>แสงแดดที่ได้รับ</p>
                    <Select onChange={(e) => setType(e.target.value)} required>
                        <SelectTrigger className="w-full rounded-2xl border border-black">
                        <SelectValue placeholder="เลือกแสงแดด" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectGroup>
                            <SelectItem value="เต็มวัน">เต็มวัน</SelectItem>
                            <SelectItem value="ครึ่งวัน">ครึ่งวัน</SelectItem>
                            <SelectItem value="น้อยกว่า 3 ชั่วโมง">น้อยกว่า 3 ชั่วโมง</SelectItem>
                            <SelectItem value="ไม่ต้องการแสงแดด">ไม่ต้องการแสงแดด</SelectItem>
                        </SelectGroup>
                        </SelectContent>
                    </Select>  
                </div>
            </div>
            
        </div>
    </div>
    </>
  )
}

export default page
