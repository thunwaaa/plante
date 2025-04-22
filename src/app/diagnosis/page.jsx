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
        <div className='flex items-center'>
            <BookText size={28} absoluteStrokeWidth />
            <h2 className='ml-2 font-extrabold underline text-lg'>ข้อมูลเบื้องต้น</h2>
        </div>

        <div className='flex flex-wrap justify-center max-w-4xl gap-4 mt-4 w-full'>
            <div className='w-64 lg:w-[calc(50%-1rem)]'>
                <p className='font-bold mb-2'>ชนิดต้นไม้</p>
                <input 
                    type="text" placeholder='ชนิดต้นไม้' 
                    className='border rounded-2xl p-1.5 w-full font-bold'/>
            </div>

            <div className='w-64 lg:w-[calc(50%-1rem)]'>
                <p className='font-bold mb-2'>อายุต้นไม้</p>
                <input 
                    type="text" placeholder='เช่น 5 เดือน หรือ 1 ปี' 
                    className='border rounded-2xl p-1.5 w-full font-bold'/>
            </div>
        </div>

        <div className='flex mt-8'>
            <TriangleAlert size={28} absoluteStrokeWidth />
            <h2 className='ml-2 font-extrabold underline text-lg'>อาการที่พบ</h2>
        </div>
        <div className='flex flex-wrap justify-center max-w-4xl gap-4 mt-4 w-full'>
            <div className='w-64 lg:w-[calc(100%-1rem)] md:w-[calc(66%-1rem)]'>
                <p className='mb-2 font-bold'>ส่วนที่มีปัญหา</p>
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

            <div className='w-64 md:w-[calc(65%-1rem)] lg:w-[calc(100%-1rem)] mt-2 flex flex-col gap-2'>
                <p className='font-bold'>ลักษณะอาการ</p>
                <div className='grid md:grid-cols-3 gap-2 grid-cols-1'>
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
        </div>
        
        <div className='flex flex-col items-center mt-4 w-full'>
            <div className='flex items-center'>
                <Thermometer size={28} absoluteStrokeWidth />
                <h2 className='ml-2 font-extrabold underline text-lg'>สภาพแวดล้อม</h2>
            </div>
            
            <div className='w-full max-w-4xl px-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-y-4 mt-4'>
                    {/* สำหรับความถี่การรดน้ำ */}
                    <div className='mx-auto w-full max-w-62 lg:max-w-[calc(100%-1rem)] md:max-w-[calc(67%-1rem)] md:mr-2'>
                        <p className='font-bold mb-2'>ความถี่การรดน้ำ</p>
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

                    {/* สำหรับแสงแดดที่ได้รับ */}
                    <div className='mx-auto w-full max-w-62 lg:max-w-[calc(100%-1rem)] md:max-w-[calc(67%-1rem)] md:ml-2'>
                        <p className='font-bold mb-2'>แสงแดดที่ได้รับ</p>
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

                    {/* สำหรับชนิดดิน */}
                    <div className='mx-auto w-full max-w-62 lg:max-w-[calc(100%-1rem)] md:max-w-[calc(67%-1rem)] md:mr-2'>
                        <p className='font-bold mb-2'>ชนิดดิน</p>
                        <Select onChange={(e) => setType(e.target.value)} required>
                            <SelectTrigger className="w-full rounded-2xl border border-black">
                            <SelectValue placeholder="เลือกชนิดดิน" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectGroup>
                                <SelectItem value="ดินเหนียว">ดินเหนียว</SelectItem>
                                <SelectItem value="ดินร่วน">ดินร่วน</SelectItem>
                                <SelectItem value="ดินทราย">ดินทราย</SelectItem>
                                <SelectItem value="ดินผสม">ดินผสม</SelectItem>
                            </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* สำหรับใส่ปุ๋ยครั้งล่าสุด */}
                    <div className='mx-auto w-full max-w-62 lg:max-w-[calc(100%-1rem)] md:max-w-[calc(67%-1rem)] md:ml-2'>
                        <p className='font-bold mb-2'>ใส่ปุ๋ยครั้งล่าสุด</p>
                        <Select onChange={(e) => setType(e.target.value)} required>
                            <SelectTrigger className="w-full rounded-2xl border border-black">
                            <SelectValue placeholder="เลือกวันที่" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectGroup>
                                <SelectItem value="วันนี้">วันนี้</SelectItem>
                                <SelectItem value="เมื่อวาน">เมื่อวาน</SelectItem>
                                <SelectItem value="เมื่อ 3 วันก่อน">เมื่อ 3 วันก่อน</SelectItem>
                                <SelectItem value="เมื่อ 1 สัปดาห์ก่อน">เมื่อ 1 สัปดาห์ก่อน</SelectItem>
                            </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>

        <button className='mt-2' type='submit'>
            <div className='bg-[#373E11] transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 text-[#E6E4BB] border font-bold py-2 px-4 rounded-2xl mt-8'>
                วิเคราะห์อาการ
            </div>
        </button>
    </div>
    </>
  )
}

export default page
