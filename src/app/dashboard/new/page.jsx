'use client'
import * as React from "react"
import {useState, useEffect} from "react"
import { useRouter } from 'next/navigation'
import { plantApi } from '@/lib/api'
import { toast } from 'sonner'
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
import thLocale from 'date-fns/locale/th'

const page = () => {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [container, setContainer] = useState('')
  const [plantHeight, setPlantHeight] = useState('')
  const [date, setDate] = useState(new Date())
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter()

  // Add function to get today's date
  const getTodayDate = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of day
    return today;
  };

  // Add function to validate date
  const validateDate = (selectedDate) => {
    const today = getTodayDate();
    return selectedDate <= today;
  };

  // Modify date selection handler
  const handleDateSelect = (selectedDate) => {
    if (validateDate(selectedDate)) {
      setDate(selectedDate);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast.error('กรุณากรอกชื่อต้นไม้');
      return false;
    }
    if (!type) {
      toast.error('กรุณาเลือกประเภทพืช');
      return false;
    }
    if (!container) {
      toast.error('กรุณาเลือกภาชนะที่ใช้ปลูก');
      return false;
    }
    if (!plantHeight) {
      toast.error('กรุณากรอกความสูงของต้นไม้');
      return false;
    }
    if (isNaN(plantHeight) || parseFloat(plantHeight) <= 0) {
      toast.error('ความสูงของต้นไม้ต้องเป็นจำนวนบวกเท่านั้น');
      return false;
    }
    if (!date) {
      toast.error('กรุณาเลือกวันที่ปลูก');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return;
    }

    setLoading(true)
    setError(null)

    try {
      let imageUrl = '';
      
      // Upload image first if exists
      if (imageFile) {
        try {
          imageUrl = await plantApi.uploadImage(imageFile);
        } catch (uploadErr) {
          console.error('Error uploading image:', uploadErr);
          toast.error('ไม่สามารถอัพโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง');
          setLoading(false);
          return;
        }
      }

      const plantData = {
        name,
        type,
        container,
        plant_height: parseFloat(plantHeight),
        plant_date: date.toISOString(),
        image_url: imageUrl || 'https://placehold.co/400x400?text=Plant+Image'
      }

      const newPlant = await plantApi.createPlant(plantData);
      
      // Store the new plant data in localStorage to trigger refresh
      localStorage.setItem('lastUpdatedPlant', JSON.stringify(newPlant));
      
      toast.success('เพิ่มข้อมูลต้นไม้สำเร็จ!');
      router.push('/dashboard');
    } catch (err) {
      toast.error('ไม่สามารถบันทึกข้อมูลต้นไม้ได้ กรุณาลองใหม่อีกครั้ง');
      console.error('Error creating plant:', err);
    } finally {
      setLoading(false);
    }
  }   

  useEffect(() => {
    let previewUrl;
    if (imageFile instanceof File) {
      previewUrl = URL.createObjectURL(imageFile);
    }
  
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [imageFile])  

  // ฟังก์ชันแปลงวันที่เป็นรูปแบบไทย (วัน เดือน ปี พ.ศ.)
  function formatThaiDate(date) {
    if (!date) return '';
    const day = date.getDate();
    const month = date.toLocaleString('th-TH', { month: 'long' });
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  }

  return (
    <>
      <h2 className='text-2xl font-bold m-4 flex justify-center'>เพิ่มข้อมูลต้นไม้</h2>
      {error && (
        <div className="text-red-600 text-center mb-4">{error}</div>
      )}
      <div className='flex justify-center items-center mt-8'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label>อัพโหลดรูปภาพต้นไม้</label>
            <Input 
              type="file" 
              accept="image/*" 
              className="border-plant-beige transition duration-150 hover:bg-[#373E11] hover:text-[#E6E4BB]"
              onChange={(e) => setImageFile(e.target.files[0])}
              disabled={loading}
            />
            {imageFile && (
              <img 
                src={URL.createObjectURL(imageFile)}
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
              disabled={loading}
            />
          </div>

          <div className='flex flex-wrap justify-center max-w-4xl gap-x-8 gap-y-4'>
            <div className='w-64 md:w-[calc(50%-1rem)]'>
              <p>ประเภทพืช</p>
              <Select 
                value={type} 
                onValueChange={(val) => setType(val)} 
                required 
                className='border-black'
                disabled={loading}
              >
                <SelectTrigger className="w-full rounded-2xl border-black">
                  <SelectValue placeholder="เลือกประเภท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ไม้ผล">ไม้ผล</SelectItem>
                    <SelectItem value="ไม้ดอก">ไม้ดอก</SelectItem>
                    <SelectItem value="ไม้ประดับ">ไม้ประดับ</SelectItem>
                    <SelectItem value="สมุนไพร">สมุนไพร</SelectItem>
                    <SelectItem value="ไม้ยืนต้น">ไม้ยืนต้น</SelectItem>
                    <SelectItem value="ไม้พุ่ม">ไม้พุ่ม</SelectItem>
                    <SelectItem value="ไม้เลื้อย">ไม้เลื้อย</SelectItem>
                    <SelectItem value="ไม้คลุมดิน">ไม้คลุมดิน</SelectItem>
                    <SelectItem value="ไม้กระถาง">ไม้กระถาง</SelectItem>
                    <SelectItem value="ไม้น้ำ">ไม้น้ำ</SelectItem>
                    <SelectItem value="พืชผักสวนครัว">พืชผักสวนครัว</SelectItem>
                    <SelectItem value="พืชใบเลี้ยงคู่">พืชใบเลี้ยงคู่</SelectItem>
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
                    disabled={loading}
                  >
                    <Calendar1Icon />
                    {date ? formatThaiDate(date) : <span>เลือกวันที่</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align='start'>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                    disabled={(date) => date > getTodayDate() || loading}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className='w-64 md:w-[calc(50%-1rem)]'>
              <p>ภาชนะที่ใช้ปลูก</p>
              <Select 
                value={container} 
                onValueChange={(val) => setContainer(val)} 
                required 
                className='border-black'
                disabled={loading}
              >
                <SelectTrigger className="w-full rounded-2xl border-black">
                  <SelectValue placeholder="เลือกประเภท"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                  <SelectItem value="กระถาง">กระถาง</SelectItem>
                  <SelectItem value="กระบะ">กระบะ</SelectItem>
                  <SelectItem value="แปลงดิน">แปลงดิน</SelectItem>
                  <SelectItem value="กระถางแขวน">กระถางแขวน</SelectItem>
                  <SelectItem value="แจกันแก้ว">แจกันแก้ว</SelectItem>
                  <SelectItem value="กระถางเซรามิก">กระถางเซรามิก</SelectItem>
                  <SelectItem value="ขวดพลาสติกดัดแปลง">ขวดพลาสติกดัดแปลง</SelectItem>
                  <SelectItem value="กล่องไม้">กล่องไม้</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="w-64 md:w-[calc(50%-1rem)]">
              <p>ความสูงของต้นไม้ (cm)</p>
              <input 
                type="number"
                value={plantHeight}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseFloat(value) >= 0 && Number.isInteger(parseFloat(value)))) {
                    setPlantHeight(value);
                  }
                }}
                className='border rounded-2xl w-full p-1.5'
                placeholder='กรอกความสูง'
                required
                disabled={loading}
                min="0"
                step="1"
              />
            </div>
          </div>
          <div className='flex justify-center'>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                router.push('/dashboard');
              }}
              className="border-[#373E11] text-[#373E11] border mx-auto rounded-2xl p-2 w-50 mt-8 mr-4"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="text-[#E6E4BB] bg-[#373E11] mx-auto rounded-2xl p-2 w-50 mt-8"
              disabled={loading}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default page