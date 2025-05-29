'use client'
import React, {useState, useEffect} from 'react'
import { useRouter } from 'next/navigation'
import { plantApi } from '@/lib/api'
import { API_URL } from '@/lib/api'

const DiaryPage = () => {
    const router = useRouter()
    const [plants, setPlants] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchPlants()
    }, [])

    const fetchPlants = async () => {
        try {
            setLoading(true)
            const data = await plantApi.getPlants()
            setPlants(data)
        } catch (err) {
            console.error('Error fetching plants:', err)
            setError('ไม่สามารถโหลดข้อมูลต้นไม้ได้ กรุณาลองใหม่อีกครั้ง')
        } finally {
            setLoading(false)
        }
    }

    const handleDetail = (plantId) => {
        router.push(`/diary/detail/${plantId}`)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#373E11]"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-red-600 text-center mt-8">{error}</div>
        )
    }

    return (
        <>
            <div className='flex justify-center'>
                <h1 className='font-extrabold text-3xl md:text-4xl mt-8'>สมุดจดบันทึกต้นไม้</h1>
            </div>

            <div className="flex flex-wrap justify-center mx-3">
                {plants.map((plant) => (
                    <div key={plant._id} className="p-4 border rounded-xl w-64 shadow-md bg-[#E6E4BB] relative mx-3 mt-8">
                        <div className="h-40 w-full rounded-md overflow-hidden mb-2 flex justify-center items-center">
                            {plant.image_url ? (
                                <img
                                    src={plant.image_url}
                                    alt={plant.name}
                                    className="w-full h-40 object-cover rounded-md mb-2"
                                    onError={(e) => {
                                        e.target.onerror = null
                                        e.target.src = 'https://placehold.co/400x400?text=Plant+Image'
                                    }}
                                />
                            ) : (
                                <img
                                    src="https://placehold.co/400x400?text=Plant+Image"
                                    alt={plant.name}
                                    className="w-full h-40 object-cover rounded-md mb-2"
                                />
                            )}
                        </div>
                        <h2 className="text-xl font-bold">{plant.name}</h2>
                        <p>ประเภท: {plant.type}</p>
                        <p>ความสูง: {plant.plant_height} cm</p>
                        <p>วันที่ปลูก: {new Date(plant.plant_date).toLocaleDateString('th-TH')}</p>

                        <div className="flex justify-center mt-4 gap-2">
                            <button 
                                onClick={() => handleDetail(plant._id)} 
                                className="border hover:bg-[#373E11] mr-4 p-2 rounded-lg text-[#E6E4BB] bg-[#4f5c03] transition-colors duration-200"
                            >
                                ดูบันทึก
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {plants.length === 0 && (
                <div className="text-center mt-8 text-gray-600">
                    ยังไม่มีข้อมูลต้นไม้ กรุณาเพิ่มต้นไม้ในหน้าแดชบอร์ด
                </div>
            )}
        </>
    )
}

export default DiaryPage
