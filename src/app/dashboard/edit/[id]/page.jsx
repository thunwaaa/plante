'use client'
import React, { useEffect, useState} from 'react'
import { useRouter,useParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form';
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
    const {id} = useParams()
    const router = useRouter()
    const [name, setName] = useState('')
    const [type, setType] = useState('')
    const [container, setContainer] = useState('')
    const [plantHeight, setPlantHeight] = useState('')
    const [date, setDate] = useState(null)
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        const list = JSON.parse(localStorage.getItem('treeDataList') || '[]')
        const data = list[+id]
      
        if (data) {
          setName(data.name || '')
          setType(data.type || '')
          setContainer(data.container || '')
          setPlantHeight(data.plantHeight || '')
          setDate(data.date ? new Date(data.date) : null)
          if (data.image) {
            setImageFile({ preview: data.image })
          }
        } else {
          router.push('/dashboard') // ถ้า id ไม่ถูกต้องให้กลับ
        }
      }, [id])      

      const handleSubmit = (e) => {
        e.preventDefault()
        const newTree = {
          name,
          type,
          plantHeight,
          date,
          image: imageFile ? (imageFile.preview || URL.createObjectURL(imageFile)) : null,
        }
      
        const list = JSON.parse(localStorage.getItem('treeDataList') || '[]')
        list[+id] = newTree
        localStorage.setItem('treeDataList', JSON.stringify(list))
        router.push('/dashboard')
      }      

  return (
    <>
      <h2 className='text-2xl font-bold m-4 flex justify-center'>แก้ไขข้อมูลต้นไม้</h2>
      <div className='flex justify-center items-center mt-8'>
        <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label>อัพโหลดรูปภาพต้นไม้</label>
          <Input 
            type="file" 
            accept="image/*" 
            className="border-plant-beige transition duration-150 hover:bg-[#373E11] hover:text-[#E6E4BB]"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          {imageFile && (
            <img 
              src={
                imageFile instanceof File
                  ? URL.createObjectURL(imageFile)
                  : imageFile.preview // กรณี edit
              } 
              alt="Preview" 
              className="w-32 h-32 object-cover rounded-md mt-2"
            />
          )}
        </div>
          <div>
            <Input 
              type="text" 
              placeholder='ชื่อต้นไม้'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='border-black rounded-2xl p-4 w-64 font-bold'
              required
            />
          </div>

          <div className='flex flex-wrap justify-center max-w-4xl gap-x-8 gap-y-4'>
            <div className='w-64 md:w-[calc(50%-1rem)]'>
              <p>ประเภทพืช</p>
              <Select value={type} onValueChange={(val) => setType(val)} required className='border-black'>
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
                    disabled={true} // ล็อคถ้า edit
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
              <Select value={container} onValueChange={(val) => setContainer(val)} required className='border-black'>
                <SelectTrigger className="w-full rounded-2xl border-black">
                  <SelectValue placeholder="เลือกประเภท"/>
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

            <div className="w-64 md:w-[calc(50%-1rem)]">
                <p>ความสูงของต้นไม้</p>
                <input 
                    type="number"
                    value={plantHeight}
                    onChange={(e) => setPlantHeight(e.target.value)}
                    className='border rounded-2xl w-full p-1.5'
                    placeholder='กรอกขนาดพื้นที่'
                    required
                />
            </div>
          </div>
          <div className='flex justify-center'>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push('/dashboard');
              }}
              className="border-[#373E11] text-[#373E11] border mx-auto rounded-2xl p-2 w-50 mt-8 mr-4"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="text-[#E6E4BB] bg-[#373E11] mx-auto rounded-2xl p-2 w-50 mt-8"
            >
              บันทึก
            </button>
          </div>

        </form>
      </div>
    </>
  )
}

export default page
