'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { plantApi, API_URL } from '@/lib/api'
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
import { format } from 'date-fns'

const page = () => {
  const router = useRouter()
  const [plants, setPlants] = useState([]);
  const [openDialog, setOpenDialog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshPlants = async () => {
    try {
      setLoading(true);
      const data = await plantApi.getPlants();
      if (Array.isArray(data)) {
        setPlants(data);
      } else {
        setPlants([]);
      }
      setError(null);
    } catch (err) {
      if (err.message === 'Session expired. Please login again.') {
        // Let the API handle the redirect
        return;
      }
      setError('Failed to load plants. Please try again later.');
      console.error('Error fetching plants:', err);
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      refreshPlants();
    };

    checkAuth();

    const handleStorageChange = (e) => {
      if (e.key === 'lastUpdatedPlant') {
        refreshPlants();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshPlants();
      }
    };

    const handlePlantUpdate = () => {
      refreshPlants();
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('plantUpdated', handlePlantUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('plantUpdated', handlePlantUpdate);
    };
  }, [router]);

  const goToNewPage = () => {
    router.push('/dashboard/new')
  }

  const handleDelete = async (plantId) => {
    try {
      await plantApi.deletePlant(plantId);
      setPlants(plants.filter(plant => plant._id !== plantId));
      setOpenDialog(null);
    } catch (err) {
      setError('Failed to delete plant. Please try again.');
      console.error('Error deleting plant:', err);
    }
  }

  const handleEdit = (plantId) => {
    router.push(`/dashboard/edit/${plantId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#373E11]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={refreshPlants}>Try Again</Button>
      </div>
    );
  }

  return (
    <>
      <h1 className='max-sm:text-3xl md:text-4xl lg:text-5xl font-extrabold flex justify-center mt-12'>ต้นไม้ของคุณ</h1>

      { plants.length === 0 ? (
        <div className="flex justify-center mt-8">
          <button
            onClick={goToNewPage}
            className='flex justify-center items-center max-sm:w-80 md:w-3xl lg:w-7xl border m-4 p-12 rounded-3xl opacity-85 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-95'
          >
            <Plus className="w-12 h-12 md:w-18 md:h-18 lg:w-20 lg:h-20 opacity-55" />
          </button>
        </div>
      ) : (
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
                    onClick={() => handleDelete(openDialog)}
                  >
                    ลบ
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {plants.map((plant) => (
            <div key={plant._id} className="p-4 border rounded-xl w-64 shadow-md bg-[#E6E4BB] relative">
              <div className="h-40 w-full shadow-sm rounded-md overflow-hidden mb-2 flex justify-center items-center">
                {plant.image_url && (
                  <img
                    src={plant.image_url}
                    alt={plant.name}
                    className="w-full h-40 object-cover rounded-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/400x400?text=Plant+Image';
                    }}
                    key={`${plant._id}-${plant.image_url}`}
                  />
                )}
              </div>
              <h2 className="text-xl font-bold">{plant.name}</h2>
              <p>ประเภท: {plant.type}</p>
              <p>ความสูง: {plant.plant_height} cm</p>
              <p>วันที่ปลูก: {format(new Date(plant.plant_date), 'dd/MM/yyyy')}</p>
              <p>ภาชนะ: {plant.container}</p>

              <div className="flex justify-end mt-4 gap-2">
                <button onClick={() => handleEdit(plant._id)} className="hover:text-blue-800 mr-4">
                  <Pencil size={20} />
                </button>
                <button onClick={() => setOpenDialog(plant._id)} className="hover:text-red-800">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={goToNewPage}
            className="p-4 border rounded-xl w-64 h-96 shadow-md flex flex-col justify-center items-center bg-[#E6E4BB] hover:scale-105 transition"
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