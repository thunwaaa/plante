'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Button } from '@/components/ui/button'

const page = () => {
  const router = useRouter()
  const [treeDataList, setTreeDataList] = useState([]);
  const [openDialog, setOpenDialog] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('treeDataList') || '[]');
    setTreeDataList(stored);
  }, []);

  const goToNewPage = () => {
    router.push('/dashboard/new')
  }

  const handleDelete = (indexToDelete) => {
    const newList = treeDataList.filter((_, i) => i !== indexToDelete)
    setTreeDataList(newList)
    localStorage.setItem('treeDataList', JSON.stringify(newList))
  }

  const handleEdit = (index) => {
    localStorage.setItem('editTreeIndex', index.toString())
    router.push(`/dashboard/edit/${index}`)
  }

  return (
    <>
      <h1 className='max-sm:text-3xl md:text-4xl lg:text-5xl font-extrabold flex justify-center mt-12'>ต้นไม้ของคุณ</h1>

      { treeDataList.length === 0 ? (
        <div className="flex justify-center mt-8">
          <button
            onClick={goToNewPage}
            className='flex justify-center items-center max-sm:w-80 md:w-3xl lg:w-7xl border m-4 p-12 rounded-3xl opacity-85 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-95'
          >
            <Plus className="w-12 h-12 md:w-18 md:h-18 lg:w-20 lg:h-20 opacity-55" />
          </button>
        </div>
      ) : (
        // ถ้ามีข้อมูลต้นไม้ → แสดงการ์ดและปุ่มเพิ่มต่อท้าย
        <div className="flex flex-wrap justify-center gap-6 mt-8 mx-3">
          {openDialog !== null && (
            <Dialog open={true} onOpenChange={() => setOpenDialog(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>คุณแน่ใจหรือไม่ว่าจะลบต้นไม้นี้?</DialogTitle>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(null)}>
                    ยกเลิก
                  </Button>
                  <Button
                    className="bg-red-600 text-white"
                    onClick={() => {
                      handleDelete(openDialog)
                      setOpenDialog(null)
                    }}
                  >
                    ลบ
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {treeDataList.map((tree, index) => (
            <div key={index} className="p-4 border rounded-xl w-64 shadow-md bg-[#E6E4BB] relative">
              <div className="h-40 w-full shadow-sm rounded-md overflow-hidden mb-2 flex justify-center items-center">
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

              <div className="flex justify-end mt-4 gap-2">
                <button onClick={() => handleEdit(index)} className=" hover:text-blue-800 mr-4">
                  <Pencil size={20} />
                </button>
                <button onClick={() => setOpenDialog(index)} className=" hover:text-red-800">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          {/* ปุ่มเพิ่มต้นไม้เล็กต่อท้าย */}
          <button
            onClick={goToNewPage}
            className="p-4 border rounded-xl w-64 h-[350px] shadow-md flex flex-col justify-center items-center bg-[#E6E4BB] hover:scale-105 transition"
          >
            <Plus className="w-12 h-12 opacity-55" />
            <span className="mt-2 font-semibold">เพิ่มต้นไม้</span>
          </button>
        </div>
      )}
    </>
  )
}

export default page
