'use client'
import * as React from "react"
import {useState} from "react"
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { Calendar1Icon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const page = () => {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [plantingDate, setPlantingDate] = useState(null)
  const [date, setDate] = useState(Date)
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault()

    //save data
    const treeData = {name, type}
    localStorage.setItem('treeData', JSON.stringify(treeData))

    router.push('/dashboard')
  }

  return (
    <>
      <h2 className='text-2xl font-bold m-4 flex justify-center'>เพิ่มข้อมูลต้นไม้</h2>
      <div className='flex justify-center'>
        <Input 
          type="text" 
          placeholder='ชื่อต้นไม้'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='border-black rounded-2xl p-4 w-64 font-bold'
          required
        />
      </div>
      <div className='flex justify-center items-center mt-8'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='flex flex-wrap justify-center max-w-4xl gap-x-8 gap-y-4'>
            <div className='w-64 md:w-[calc(50%-1rem)]'>
              <p>ประเภทพืช</p>
              <Select onChange={(e) => setType(e.target.value)} required className='border-black'>
                <SelectTrigger className="w-full rounded-2xl border-black">
                  <SelectValue placeholder="เลือกประเภท" />
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

            <div className='w-64 md:w-[calc(50%-1rem)]'>
              <p>วันที่ปลูก</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant={"outline"} 
                    className={cn(
                      "w-full justify-start text-left border-black font-normal rounded-2xl",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <Calendar1Icon />
                    {date ? format(date, "PPP") : <span>เลือกวันที่</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align='start'>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className='w-64 md:w-[calc(50%-1rem)]'>
              <p>ภาชนะที่ใช้ปลูก</p>
              <Select onChange={(e) => setType(e.target.value)} required className='border-black'>
                <SelectTrigger className="w-full rounded-2xl border-black">
                  <SelectValue placeholder="เลือกประเภท" />
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
          </div>
        </form>
      </div>

    </>
  )
}

export default page
