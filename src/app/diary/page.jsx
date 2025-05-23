'use client'
import React, {useState, useEffect} from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
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
import { Input } from '@/components/ui/input'
import { Smile, Meh, Frown } from 'lucide-react';
import { useRouter } from 'next/navigation'

const page = () => {
    const router = useRouter()
    const [date, setDate] = useState(Date)
    const [treeDataList, setTreeDataList] = useState([]);
    const [openDialog, setOpenDialog] = useState(null);


    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('treeDataList') || '[]');
        setTreeDataList(stored);
      }, []);

    const handleMoodClick = (mood) => {
        form.setValue('mood', mood)
    }

    const handleDetail = (index) => {
        router.push(`/diary/detail/${index}`)
      }
    return (
    <>
        {/* <div className='flex justify-center'>
        <h1 className='font-extrabold text-2xl md:text-4xl mt-8'>สมุดจดบันทึกต้นไม้</h1>
        </div>
        <div className='flex justify-center mt-4'>
        <div className='w-11/12 md:w-3/4 bg-[#E6E4BB] rounded-lg shadow-lg p-6 border border-[#373E11]'>
            <h2 className='font-bold underline'>ชื่อต้นไม้</h2>
            <div className='flex justify-between mt-4'>
                <p>ประเภทพืช:</p>
                <p>วันที่ปลูก: dd/mm/yyyy</p>
            </div>
        </div>
        </div>
        <div className='flex justify-start mt-4 ml-4 md:ml-25 lg:ml-48'>
        <Dialog>
        <DialogTrigger asChild>
            <button type="submit" className='border-2 border-[#373E11] bg-[#373E11] text-[#E6E4BB] rounded-lg w-48 h-12 flex items-center justify-center transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 relative'>
                <Plus className='absolute left-4' color="#E6E4BB" size={24} />เพิ่มบันทึกใหม่
            </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="flex flex-col items-center">
            <DialogTitle>บันทึกการเติบโต</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center mt-4">
                <div className="grid grid-cols-1 items-center gap-4">
                    <div>
                        <label htmlFor="name" className="text-left font-bold">
                            วันที่บันทึก
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button 
                                variant={"outline"} 
                                className={cn(
                                "w-full justify-start text-left border font-normal rounded-lg",
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
                    <div>
                        <label htmlFor="height" className="text-left font-bold">
                            ความสูง (cm)
                        </label>
                        <Input id='height' type='number' className='border border-[#373E11]'/>
                    </div>
                    <div>
                        <label htmlFor="note" className="text-left font-bold">
                            บันทึกเพิ่มเติม
                        </label>
                        <textarea id='note' rows='4' className='border border-[#373E11] rounded-lg w-full p-2'/>
                    </div>
                    <div>
                        <label htmlFor="note" className="text-left font-bold">
                            ประเมินอารมณ์
                        </label>
                        <div className="flex justify-center gap-6 mt-2">
                            <button type='button' onClick={() => handleMoodClick('happy')} className='flex items-center'>
                                <Smile className="h-6 w-6 text-green-500" size={24} />
                                <span className="text-xs mt-1">ดีใจ</span>
                            </button>
                            <button type='button' onClick={() => handleMoodClick('neutral')} className='flex items-center'>
                                <Meh className="h-6 w-6 text-yellow-500"  size={24} />
                                <span className="text-xs mt-1">เฉยๆ</span>
                            </button>
                            <button type='button' onClick={() => handleMoodClick('sad')} className='flex items-center'>
                                <Frown className="h-6 w-6 text-red-500"  size={24} />
                                <span className="text-xs mt-1">เสียใจ</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter>
            <button type="submit">บันทึก</button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
        </div> */}

        <div className='flex justify-center'>
            <h1 className='font-extrabold text-2xl md:text-4xl mt-8'>สมุดจดบันทึกต้นไม้</h1>
        </div>

        <div className="flex flex-wrap justify-center mt-8 mx-3">
            {treeDataList.map((tree, index) => (
                <div key={index} className="p-4 border rounded-xl w-64 shadow-md bg-[#E6E4BB] relative mx-3 mt-8">
                    <div className="h-40 w-full bg-white rounded-md overflow-hidden mb-2 flex justify-center items-center">
                        {tree.image && (
                            <img
                            src={tree.image}
                            alt={tree.name}
                            className="w-full h-40 object-cover rounded-md mb-2"
                            />
                        )}
                    </div>
                    <h2 className="text-xl font-bold">{tree.name}</h2>
                    <p>ประเภท: {tree.type}</p>
                    <p>ความสูง: {tree.plantHeight}</p>
                    <p>วันที่ปลูก: {new Date(tree.date).toLocaleDateString()}</p>

                    <div className="flex justify-center mt-4 gap-2">
                        <button onClick={() => handleDetail(index)} className=" border hover:bg-[#373E11] mr-4 p-2 rounded-lg text-[#E6E4BB] bg-[#4f5c03]">
                            View Details
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </>
    )
}

export default page
