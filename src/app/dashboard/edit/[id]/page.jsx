'use client'
import * as React from "react"
import {useState, useEffect} from "react"
import { useRouter } from 'next/navigation'
import { plantApi } from '@/lib/api'
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
import { API_URL } from '@/lib/api'

const EditPlantPage = ({ params }) => {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const router = useRouter()
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [container, setContainer] = useState('')
  const [plantHeight, setPlantHeight] = useState('')
  const [date, setDate] = useState(new Date())
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchPlantData();
    }
  }, [id]);

  const fetchPlantData = async () => {
    try {
      setLoading(true);
      const plant = await plantApi.getPlant(id);
      if (!plant) {
        throw new Error('Plant not found');
      }
      
      // Ensure all data is properly set
      setName(plant.name || '');
      setType(plant.type || '');
      setContainer(plant.container || '');
      setPlantHeight(plant.plant_height ? plant.plant_height.toString() : '');
      setDate(plant.plant_date ? new Date(plant.plant_date) : new Date());
      setCurrentImage(plant.image_url || null);
      setImagePreview(null);
      setError(null);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลต้นไม้ได้ กรุณาลองใหม่อีกครั้ง');
      console.error('Error fetching plant:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!name || !type || !container || !plantHeight || !date) {
        throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
      }

      const plantData = {
        name: name.trim(),
        type: type.trim(),
        container: container.trim(),
        plant_height: parseFloat(plantHeight),
        plant_date: date.toISOString(),
        // Keep the existing image URL if no new image is uploaded
        image_url: currentImage
      };

      // Only update image if a new one is uploaded
      const updatedPlant = await plantApi.updatePlant(id, plantData, imageFile);
      
      if (!updatedPlant) {
        throw new Error('Failed to update plant');
      }

      // Store the updated plant data in localStorage
      localStorage.setItem('lastUpdatedPlant', JSON.stringify(updatedPlant));
      
      // Trigger a custom event to notify about the update
      window.dispatchEvent(new Event('plantUpdated'));
      
      // Navigate back to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'ไม่สามารถบันทึกข้อมูลต้นไม้ได้ กรุณาลองใหม่อีกครั้ง');
      console.error('Error updating plant:', err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    // Cleanup function to revoke any existing blob URLs
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Revoke the previous preview URL if it exists
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
      // Create a new preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      setImageFile(file)
      // Clear the current image since we're uploading a new one
      setCurrentImage(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#373E11]"></div>
      </div>
    );
  }

  return (
    <>
      <h2 className='text-2xl font-bold m-4 flex justify-center'>แก้ไขข้อมูลต้นไม้</h2>
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
              onChange={handleImageChange}
              disabled={saving}
            />
            {(imagePreview || currentImage) && (
              <img 
                src={imagePreview || `${API_URL.replace('/api', '')}${currentImage}`}
                alt="Preview" 
                className="w-32 h-32 object-cover rounded-md mt-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/400x400?text=Plant+Image';
                }}
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
              disabled={saving}
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
                disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
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
                disabled={saving}
              >
                <SelectTrigger className="w-full rounded-2xl border-black">
                  <SelectValue placeholder="เลือกประเภท"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="กระถาง">กระถาง</SelectItem>
                    <SelectItem value="ถุงพลาสติก">ถุงพลาสติก</SelectItem>
                    <SelectItem value="กระบะ">กระบะ</SelectItem>
                    <SelectItem value="แปลงดิน">แปลงดิน</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="w-64 md:w-[calc(50%-1rem)]">
              <p>ความสูงของต้นไม้ (เซนติเมตร)</p>
              <input 
                type="number"
                value={plantHeight}
                onChange={(e) => setPlantHeight(e.target.value)}
                className='border rounded-2xl w-full p-1.5'
                placeholder='กรอกความสูง'
                required
                disabled={saving}
                min="0"
                step="0.1"
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
              disabled={saving}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="text-[#E6E4BB] bg-[#373E11] mx-auto rounded-2xl p-2 w-50 mt-8"
              disabled={saving}
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default EditPlantPage