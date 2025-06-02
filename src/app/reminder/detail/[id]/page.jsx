'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Plus, Calendar, TrendingUp, X, Camera, Edit2, Trash2 } from 'lucide-react'
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
    const [editingRecord, setEditingRecord] = useState(null);
    const [showEditRecordForm, setShowEditRecordForm] = useState(false);

    // New state for delete confirmation dialog
    const [showDeleteRecordConfirmDialog, setShowDeleteRecordConfirmDialog] = useState(false);
    const [recordToDeleteId, setRecordToDeleteId] = useState(null);

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
            if (!newGrowth.height) {
                setError('กรุณาระบุความสูงของต้นไม้');
                return;
            }

            const growthData = {
                height: parseFloat(newGrowth.height),
                mood: newGrowth.mood,
                notes: newGrowth.notes,
                date: new Date(newGrowth.date).toISOString()
            };

            const updatedPlant = await plantApi.addGrowthRecord(id, growthData);
            setPlant(updatedPlant);
            
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

    const handleEditRecord = (record) => {
        setEditingRecord({
            ...record,
            date: new Date(record.date).toISOString().split('T')[0]
        });
        setShowEditRecordForm(true);
    };

    const handleUpdateRecord = async () => {
        try {
            if (!editingRecord.height) {
                setError('กรุณาระบุความสูงของต้นไม้');
                return;
            }

            const growthData = {
                height: parseFloat(editingRecord.height),
                mood: editingRecord.mood,
                notes: editingRecord.notes,
                date: new Date(editingRecord.date).toISOString()
            };

            const updatedPlant = await plantApi.updateGrowthRecord(id, editingRecord._id, growthData);
            setPlant(updatedPlant);
            setShowEditRecordForm(false);
            setEditingRecord(null);
        } catch (error) {
            setError('ไม่สามารถอัพเดทข้อมูลการเติบโตได้');
            console.error('Error updating growth record:', error);
        }
    };

    const handleDeleteRecord = async (recordId) => {
        // Use a dialog for confirmation instead of window.confirm
        setRecordToDeleteId(recordId);
        setShowDeleteRecordConfirmDialog(true);
    };

    // New function to perform the actual deletion after confirmation
    const confirmDeleteRecord = async () => {
        if (!recordToDeleteId) return; // Should not happen if dialog is shown correctly

        try {
            const updatedPlant = await plantApi.deleteGrowthRecord(id, recordToDeleteId);
            setPlant(updatedPlant);
            // Close dialog and reset state
            setShowDeleteRecordConfirmDialog(false);
            setRecordToDeleteId(null);
            // Optionally show a success message here
            // setError(null); // Clear any previous errors
        } catch (error) {
            setError('ไม่สามารถลบบันทึกการเติบโตได้'); // Display error near the records section
            console.error('Error deleting growth record:', error);
            // Close dialog and reset state
            setShowDeleteRecordConfirmDialog(false);
            setRecordToDeleteId(null);
        }
    };

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
        return records[index].height;
    }

    const fetchPlantData = async () => {
        try {
            console.log('Fetching plant data for ID:', id);
            setLoading(true);
            const data = await plantApi.getPlant(id);
            console.log('Received plant data:', data);
            setPlant(data);
            setEditedPlant({
                name: data.name || '',
                type: data.type || '',
                plant_height: data.plant_height?.toString() || '',
                container: data.container || '',
                plant_date: data.plant_date ? new Date(data.plant_date).toISOString().split('T')[0] : '',
                image_url: data.image_url || null
            });
            console.log('Plant data updated in state:', data);
        } catch (error) {
            console.error('Error fetching plant:', error);
            setError('ไม่สามารถโหลดข้อมูลต้นไม้ได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('Component mounted, fetching plant data for ID:', id);
        fetchPlantData();

        const handlePlantUpdated = () => {
            console.log('Plant updated event received, refetching data...');
            fetchPlantData();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('Page became visible, refetching data...');
                fetchPlantData();
            }
        };

        // Add event listener for page focus
        const handleFocus = () => {
            console.log('Page focused, refetching data...');
            fetchPlantData();
        };

        window.addEventListener('plantUpdated', handlePlantUpdated);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('plantUpdated', handlePlantUpdated);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [id]); // Depend on id to re-run effect when id changes

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
                    onClick={() => router.push('/reminder')}
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
                        onClick={() => router.push('/reminder')} 
                        className="border bg-[#373E11] text-[#E6E4BB] p-2 text-lg rounded-lg"
                    >
                        ย้อนกลับ
                    </button>
                </div>
                
                {/* Growth Records Timeline */}
                <div className="mt-6 bg-[#E6E4BB] rounded-lg shadow-lg p-6 border border-[#373E11]">
                    <h3 className="font-bold text-xl mb-4">บันทึกการแจ้งเตือน</h3>
                    {plant.growth_records && plant.growth_records.length > 0 ? (
                        <div className="space-y-4">
                            {plant.growth_records.map((record, index) => (
                                <div key={record._id} className="relative pl-8 pb-4 border-l-2 border-[#373E11]">
                                    {/* Timeline dot */}
                                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-[#373E11]"></div>
                                    
                                    {/* Record content */}
                                    <div className="bg-[#E6E4BB] rounded-lg p-4 shadow border">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="font-medium text-[#373E11]">
                                                    ความสูง: {record.height} cm
                                                </span>
                                                <span className={`ml-2 px-2 py-1 rounded-full text-sm ${getMoodColor(record.mood)}`}>
                                                    {record.mood}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm text-gray-600">
                                                    {formatDate(record.date)}
                                                </div>
                                                <button
                                                    onClick={() => handleEditRecord(record)}
                                                    className="p-1 hover:bg-gray-100 rounded-full"
                                                    title="แก้ไข"
                                                >
                                                    <Edit2 className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRecord(record._id)}
                                                    className="p-1 hover:bg-red-50 rounded-full"
                                                    title="ลบ"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {record.notes && (
                                            <p className="text-gray-700 mt-2">{record.notes}</p>
                                        )}
                                        
                                        {/* Growth trend indicator */}
                                        {index < plant.growth_records.length - 1 && (
                                            <div className="mt-2 flex items-center text-sm">
                                                <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                                                <span className="text-green-600">
                                                    {`เพิ่มขึ้น ${Math.abs(getGrowthTrend(plant.growth_records, index))} cm`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600">ยังไม่มีบันทึกการแจ้งเตือน</p>
                    )}
                </div>

                {/* Add growth record button */}
                <div className="mt-5">
                    <button 
                        onClick={() => {
                            // ตรวจสอบว่า id เป็น ObjectId 24 ตัวอักษร
                            if (typeof id === 'string' && id.length === 24 && /^[a-fA-F0-9]{24}$/.test(id)) {
                                router.push(`/reminder/detail/${id}/new`)
                            } else {
                                alert('ไม่พบ ObjectId ที่ถูกต้อง หรือ id ไม่ถูกต้อง')
                            }
                        }} 
                        className='flex items-center gap-2 bg-[#373E11] text-[#E6E4BB] p-2 text-lg rounded-lg hover:bg-[#4a5216] transition-colors'
                    >
                        <Plus /> เพิ่มบันทึกการแจ้งเตือน
                    </button>
                </div>

                {/* Growth Record Modal */}
                {showGrowthForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                        <div className="bg-[#E6E4BB] rounded-xl p-6 w-full max-w-md border border-[#373E11] shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-[#373E11]">บันทึกการแจ้งเตือน</h2>
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

                {/* Edit Growth Record Modal */}
                {showEditRecordForm && editingRecord && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                        <div className="bg-[#E6E4BB] rounded-xl p-6 w-full max-w-md border border-[#373E11] shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-[#373E11]">แก้ไขบันทึกการแจเ้งเตือน</h2>
                                <button onClick={() => {
                                    setShowEditRecordForm(false);
                                    setEditingRecord(null);
                                }}>
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
                                        value={editingRecord.height}
                                        onChange={(e) => setEditingRecord({ ...editingRecord, height: e.target.value })}
                                        className="w-full border border-[#373E11] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#373E11] focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[#373E11]">สภาวะโดยรวม</label>
                                    <select
                                        value={editingRecord.mood}
                                        onChange={(e) => setEditingRecord({ ...editingRecord, mood: e.target.value })}
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
                                        value={editingRecord.notes}
                                        onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                                        className="w-full border border-[#373E11] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#373E11] focus:border-transparent"
                                        rows="3"
                                        placeholder="บันทึกข้อสังเกต เช่น ใบเหลือง, รดน้ำ, ใส่ปุ๋ย"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[#373E11]">วันที่บันทึก</label>
                                    <input
                                        type="date"
                                        value={editingRecord.date}
                                        onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                                        className="w-full border border-[#373E11] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#373E11] focus:border-transparent"
                                        required
                                    />
                                </div>

                                <button
                                    onClick={handleUpdateRecord}
                                    className="w-full bg-[#373E11] hover:bg-[#4a5216] text-[#E6E4BB] py-2 px-4 rounded-lg transition-colors"
                                >
                                    บันทึกการแก้ไข
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Record Confirmation Dialog */}
                {showDeleteRecordConfirmDialog && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                         <div className="bg-[#E6E4BB] rounded-xl p-6 w-full max-w-sm border border-[#373E11] shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-[#373E11]">ยืนยันการลบบันทึก</h2>
                                <button onClick={() => {
                                    setShowDeleteRecordConfirmDialog(false);
                                    setRecordToDeleteId(null);
                                }}>
                                     <X size={24} className="text-[#373E11]" />
                                </button>
                            </div>
                            <p className="text-gray-700 mb-6">คุณแน่ใจหรือไม่ที่จะลบบันทึกแจ้งเตือนนี้?</p>
                             <div className="flex justify-end gap-3">
                                <button
                                     onClick={() => {
                                        setShowDeleteRecordConfirmDialog(false);
                                        setRecordToDeleteId(null);
                                     }}
                                     className="px-4 py-2 border rounded-lg text-[#373E11] hover:bg-gray-100 transition-colors"
                                >
                                     ยกเลิก
                                </button>
                                <button
                                     onClick={confirmDeleteRecord}
                                     className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                     ลบ
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