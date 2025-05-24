'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Plus, Calendar, TrendingUp, X, Camera } from 'lucide-react'
import { treeService } from '@/app/services/treeService'

const page = () => {
    const router = useRouter()
    const { id } = useParams()
    const [treeData, setTreeData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showGrowthForm, setShowGrowthForm] = useState(false)
    const [error, setError] = useState(null)

    const [newGrowth, setNewGrowth] = useState({
        height: '',
        mood: 'ปานกลาง',
        notes: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [editedTree, setEditedTree] = useState({
        name: '',
        type: '',
        plantHeight: '',
        container: '',
        date: '',
        image: null
    })

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setEditedTree({...editedTree, image: e.target.result})
            }
            reader.readAsDataURL(file)
        }
    }

    const handleUpdateTree = async () => {
        try {
            await treeService.updateTree(id, {
                ...editedTree,
                plantHeight: parseFloat(editedTree.plantHeight),
                plantingDate: new Date(editedTree.date)
            });
            
            // Refresh tree data
            fetchTreeData();
            setShowEditForm(false);
        } catch (error) {
            setError(error.message);
        }
    }

    const handleAddGrowthRecord = async () => {
        try {
            if (!newGrowth.height) return;

            const recordData = {
                height: parseFloat(newGrowth.height),
                mood: newGrowth.mood,
                notes: newGrowth.notes,
                date: new Date(newGrowth.date)
            };

            await treeService.addGrowthRecord(id, recordData);
            
            // Refresh tree data
            fetchTreeData();
            setNewGrowth({ 
                height: '', 
                mood: 'ปานกลาง', 
                notes: '', 
                date: new Date().toISOString().split('T')[0] 
            });
            setShowGrowthForm(false);
        } catch (error) {
            setError(error.message);
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

    const fetchTreeData = async () => {
        try {
            setLoading(true);
            const data = await treeService.getTree(id);
            setTreeData(data);
            setEditedTree({
                name: data.name || '',
                type: data.type || '',
                plantHeight: data.plantHeight || '',
                container: data.container || '',
                date: data.plantingDate ? new Date(data.plantingDate).toISOString().split('T')[0] : '',
                image: data.image || null
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTreeData();
    }, [id]);

    if (loading) {
        return <p className="text-center mt-8">กำลังโหลดข้อมูล...</p>
    }

    if (error) {
        return <p className="text-center mt-8 text-red-600">เกิดข้อผิดพลาด: {error}</p>
    }

    if (!treeData) {
        return <p className="text-center mt-8">ไม่พบข้อมูลต้นไม้</p>
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
                
                {/* Tree info card */}
                <div className="bg-[#E6E4BB] rounded-lg shadow-lg p-6 border border-[#373E11]">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="font-bold text-2xl text-[#373E11]">{treeData.name}</h2>
                        <button 
                            onClick={() => setShowEditForm(true)}
                            className="text-[#373E11] hover:text-[#4a5216] transition-colors"
                        >
                            แก้ไขข้อมูล
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {treeData.image ? (
                                <img 
                                    src={treeData.image} 
                                    alt={treeData.name}
                                    className="w-full h-48 object-cover rounded-lg border border-[#373E11]"
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-100 rounded-lg border border-[#373E11] flex items-center justify-center">
                                    <Camera className="w-12 h-12 text-gray-400" />
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                            <p><strong className="text-[#373E11]">ประเภทพืช:</strong> {treeData.type}</p>
                            <p><strong className="text-[#373E11]">ความสูงปัจจุบัน:</strong> {treeData.plantHeight} cm</p>
                            <p><strong className="text-[#373E11]">ภาชนะที่ใช้ปลูก:</strong> {treeData.container}</p>
                            {treeData.plantingDate && (
                                <p><strong className="text-[#373E11]">วันที่ปลูก:</strong> {formatDate(treeData.plantingDate)}</p>
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
                    
                    {treeData.growthRecords && treeData.growthRecords.length > 0 ? (
                        <div className="space-y-4">
                            {treeData.growthRecords.map((record, index) => (
                                <div key={record._id} className="rounded-lg p-4 border border-[#373E11] relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-medium text-[#373E11]">{formatDate(record.date)}</div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMoodColor(record.mood)}`}>
                                            {record.mood}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="text-lg font-bold text-[#373E11]">ความสูง: {record.height} cm</div>
                                        {getGrowthTrend(treeData.growthRecords, index) !== 0 && (
                                            <div className="flex items-center gap-1 text-sm">
                                                <TrendingUp size={16} className={getGrowthTrend(treeData.growthRecords, index) > 0 ? 'text-green-600' : 'text-red-600'} />
                                                <span className={getGrowthTrend(treeData.growthRecords, index) > 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {getGrowthTrend(treeData.growthRecords, index) > 0 ? '+' : ''}{getGrowthTrend(treeData.growthRecords, index).toFixed(1)} cm
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {record.notes && (
                                        <div className="text-gray-600 text-sm mt-2">{record.notes}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600">ยังไม่มีบันทึกการเติบโต</p>
                    )}
                </div>

                {/* Edit Tree Modal */}
                {showEditForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-[#E6E4BB] rounded-xl p-6 w-full max-w-md border border-[#373E11]">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-[#373E11]">แก้ไขข้อมูลต้นไม้</h2>
                                <button onClick={() => setShowEditForm(false)}>
                                    <X size={24} className="text-[#373E11]" />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[#373E11]">ชื่อต้นไม้</label>
                                    <input
                                        type="text"
                                        value={editedTree.name}
                                        onChange={(e) => setEditedTree({...editedTree, name: e.target.value})}
                                        className="w-full border border-[#373E11] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#373E11] focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[#373E11]">ประเภทต้นไม้</label>
                                    <input
                                        type="text"
                                        value={editedTree.type}
                                        onChange={(e) => setEditedTree({...editedTree, type: e.target.value})}
                                        className="w-full border border-[#373E11] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#373E11] focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[#373E11]">ความสูง (cm)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={editedTree.plantHeight}
                                        onChange={(e) => setEditedTree({...editedTree, plantHeight: e.target.value})}
                                        className="w-full border border-[#373E11] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#373E11] focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[#373E11]">ภาชนะที่ใช้ปลูก</label>
                                    <input
                                        type="text"
                                        value={editedTree.container}
                                        onChange={(e) => setEditedTree({...editedTree, container: e.target.value})}
                                        className="w-full border border-[#373E11] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#373E11] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[#373E11]">วันที่ปลูก</label>
                                    <input
                                        type="date"
                                        value={editedTree.date}
                                        onChange={(e) => setEditedTree({...editedTree, date: e.target.value})}
                                        className="w-full border border-[#373E11] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#373E11] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[#373E11]">รูปภาพ</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="w-full border border-[#373E11] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#373E11] focus:border-transparent"
                                    />
                                </div>

                                <button
                                    onClick={handleUpdateTree}
                                    className="w-full bg-[#373E11] hover:bg-[#4a5216] text-[#E6E4BB] py-2 px-4 rounded-lg transition-colors"
                                >
                                    บันทึกการแก้ไข
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Growth Record Modal */}
                {showGrowthForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-[#E6E4BB] rounded-xl p-6 w-full max-w-md border border-[#373E11]">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-[#373E11]">บันทึกการเติบโต</h2>
                                <button onClick={() => setShowGrowthForm(false)}>
                                    <X size={24} className="text-[#373E11]" />
                                </button>
                            </div>
                            
                            <div className="mb-4 p-3 rounded-lg border border-[#373E11]">
                                <div className="font-medium text-[#373E11]">{treeData.name}</div>
                                <div className="text-sm text-gray-600">ความสูงปัจจุบัน: {treeData.plantHeight} cm</div>
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

export default page