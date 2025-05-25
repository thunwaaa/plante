'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Plus, Calendar, TrendingUp, X, Camera } from 'lucide-react'
import { plantApi } from '@/lib/api'
import { API_URL } from '@/lib/api'

const DiaryDetailPage = () => {
    const router = useRouter()
    const { id } = useParams()
    const [plant, setPlant] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showGrowthForm, setShowGrowthForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [error, setError] = useState(null)

    const [newGrowth, setNewGrowth] = useState({
        height: '',
        mood: 'ปานกลาง',
        notes: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [editedPlant, setEditedPlant] = useState({
        name: '',
        type: '',
        plant_height: '',
        container: '',
        plant_date: '',
        image_url: null
    })

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (file) {
            try {
                const imageUrl = await plantApi.uploadImage(file)
                setEditedPlant({...editedPlant, image_url: imageUrl})
            } catch (err) {
                setError('ไม่สามารถอัพโหลดรูปภาพได้')
                console.error('Error uploading image:', err)
            }
        }
    }

    const handleUpdatePlant = async () => {
        try {
            const updatedPlant = await plantApi.updatePlant(id, {
                ...editedPlant,
                plant_height: parseFloat(editedPlant.plant_height),
                plant_date: new Date(editedPlant.plant_date).toISOString()
            });
            
            // Refresh plant data
            fetchPlantData();
            setShowEditForm(false);
        } catch (error) {
            setError('ไม่สามารถอัพเดทข้อมูลต้นไม้ได้');
            console.error('Error updating plant:', error);
        }
    }

    const handleAddGrowthRecord = async () => {
        try {
            if (!newGrowth.height) return;

            // TODO: Implement growth record API endpoint
            // For now, we'll just show an error
            setError('ฟีเจอร์บันทึกการเติบโตกำลังอยู่ในระหว่างการพัฒนา');
            
            // Reset form
            setNewGrowth({ 
                height: '', 
                mood: 'ปานกลาง', 
                notes: '', 
                date: new Date().toISOString().split('T')[0] 
            });
            setShowGrowthForm(false);
        } catch (error) {
            setError('ไม่สามารถบันทึกข้อมูลการเติบโตได้');
            console.error('Error adding growth record:', error);
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getMoodColor = (mood) => {
        switch (mood) {
            case 'ดีมาก': return 'text-green-600 bg-green-100';
            case 'ดี': return 'text-blue-600 bg-blue-100';
            case 'ปานกลาง': return 'text-yellow-600 bg-yellow-100';
            case 'ไม่ดี': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    }

    const getGrowthTrend = (records, index) => {
        if (index >= records.length - 1) return 0;
        const current = records[index];
        const previous = records[index + 1];
        return current.height - previous.height;
    }

    const fetchPlantData = async () => {
        try {
            setLoading(true);
            const data = await plantApi.getPlant(id);
            setPlant(data);
            setEditedPlant({
                name: data.name || '',
                type: data.type || '',
                plant_height: data.plant_height?.toString() || '',
                container: data.container || '',
                plant_date: data.plant_date ? new Date(data.plant_date).toISOString().split('T')[0] : '',
                image_url: data.image_url || null
            });
        } catch (error) {
            setError('ไม่สามารถโหลดข้อมูลต้นไม้ได้');
            console.error('Error fetching plant:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlantData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#373E11]"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-red-600 text-center mt-8">
                {error}
                <button 
                    onClick={() => router.push('/diary')}
                    className="block mx-auto mt-4 border bg-[#373E11] text-[#E6E4BB] p-2 rounded-lg"
                >
                    กลับไปหน้ารายการ
                </button>
            </div>
        )
    }

    if (!plant) {
        return (
            <div className="text-center mt-8">
                ไม่พบข้อมูลต้นไม้
                <button 
                    onClick={() => router.push('/diary')}
                    className="block mx-auto mt-4 border bg-[#373E11] text-[#E6E4BB] p-2 rounded-lg"
                >
                    กลับไปหน้ารายการ
                </button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 mt-8">
            <div className="w-11/12 md:w-3/4 mx-auto">
                {/* Back button */}
                <div className="mb-4">
                    <button 
                        onClick={() => router.push('/diary')} 
                        className="border bg-[#373E11] text-[#E6E4BB] p-2 text-lg rounded-lg"
                    >
                        ย้อนกลับ
                    </button>
                </div>
                
                {/* Plant info card */}
                <div className="bg-[#E6E4BB] rounded-lg shadow-lg p-6 border border-[#373E11]">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="font-bold text-2xl text-[#373E11]">{plant.name}</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {plant.image_url ? (
                                <img 
                                    src={`${API_URL.replace('/api', '')}${plant.image_url}`}
                                    alt={plant.name}
                                    className="w-full h-48 object-cover rounded-lg border border-[#373E11]"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/400x400?text=Plant+Image';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-100 rounded-lg border border-[#373E11] flex items-center justify-center">
                                    <Camera className="w-12 h-12 text-gray-400" />
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                            <p><strong className="text-[#373E11]">ประเภทพืช:</strong> {plant.type}</p>
                            <p><strong className="text-[#373E11]">ความสูงปัจจุบัน:</strong> {plant.plant_height} cm</p>
                            <p><strong className="text-[#373E11]">ภาชนะที่ใช้ปลูก:</strong> {plant.container}</p>
                            {plant.plant_date && (
                                <p><strong className="text-[#373E11]">วันที่ปลูก:</strong> {formatDate(plant.plant_date)}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add growth record button */}
                <div className="mt-5">
                    <button 
                        onClick={() => setShowGrowthForm(true)}
                        className='flex items-center gap-2 bg-[#373E11] text-[#E6E4BB] p-2 text-lg rounded-lg hover:bg-[#4a5216] transition-colors'
                    >
                        <Plus /> เพิ่มบันทึกการเติบโต
                    </button>
                </div>

                {/* Growth Records Timeline */}
                <div className="mt-6 bg-[#E6E4BB] rounded-lg shadow-lg p-6 border border-[#373E11]">
                    <h3 className="font-bold text-xl mb-4">บันทึกการเจริญเติบโต</h3>
                    <p className="text-center text-gray-600">ฟีเจอร์บันทึกการเติบโตกำลังอยู่ในระหว่างการพัฒนา</p>
                </div>

                {/* Growth Record Modal */}
                {showGrowthForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                        <div className="bg-[#E6E4BB] rounded-xl p-6 w-full max-w-md border border-[#373E11] shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-[#373E11]">บันทึกการเติบโต</h2>
                                <button onClick={() => setShowGrowthForm(false)}>
                                    <X size={24} className="text-[#373E11]" />
                                </button>
                            </div>
                            
                            <div className="mb-4 p-3 rounded-lg border border-[#373E11]">
                                <div className="font-medium text-[#373E11]">{plant.name}</div>
                                <div className="text-sm text-gray-600">ความสูงปัจจุบัน: {plant.plant_height} cm</div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[#373E11]">ความสูง (cm)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={newGrowth.height}
                                        onChange={(e) => setNewGrowth({ ...newGrowth, height: e.target.value })}
                                        className="w-full border border-[#373E11] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#373E11] focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[#373E11]">สภาวะโดยรวม</label>
                                    <select
                                        value={newGrowth.mood}
                                        onChange={(e) => setNewGrowth({ ...newGrowth, mood: e.target.value })}
                                        className="w-full border border-[#373E11] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#373E11] focus:border-transparent"
                                    >
                                        <option value="ดีมาก">ดีมาก</option>
                                        <option value="ดี">ดี</option>
                                        <option value="ปานกลาง">ปานกลาง</option>
                                        <option value="ไม่ดี">ไม่ดี</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[#373E11]">หมายเหตุ</label>
                                    <textarea
                                        value={newGrowth.notes}
                                        onChange={(e) => setNewGrowth({ ...newGrowth, notes: e.target.value })}
                                        className="w-full border border-[#373E11] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#373E11] focus:border-transparent"
                                        rows="3"
                                        placeholder="บันทึกข้อสังเกต เช่น ใบเหลือง, รดน้ำ, ใส่ปุ๋ย"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[#373E11]">วันที่บันทึก</label>
                                    <input
                                        type="date"
                                        value={newGrowth.date}
                                        onChange={(e) => setNewGrowth({ ...newGrowth, date: e.target.value })}
                                        className="w-full border border-[#373E11] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#373E11] focus:border-transparent"
                                        required
                                    />
                                </div>

                                <button
                                    onClick={handleAddGrowthRecord}
                                    className="w-full bg-[#373E11] hover:bg-[#4a5216] text-[#E6E4BB] py-2 px-4 rounded-lg transition-colors"
                                >
                                    บันทึกข้อมูล
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DiaryDetailPage