'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

const page = () => {
    const router = useRouter()
    const { id } = useParams() // Use useParams() to get the id from the route
    const [treeData, setTreeData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch data from localStorage
        const fetchData = () => {
            try {
                const treeDataList = JSON.parse(localStorage.getItem('treeDataList') || '[]')
                
                // Log for debugging
                console.log('ID from params:', id)
                console.log('Tree data list:', treeDataList)
                
                // If ID exists and there's data at that index
                if (id !== undefined && treeDataList[+id]) {
                    setTreeData(treeDataList[+id])
                } else {
                    console.log('Tree data not found for ID:', id)
                    // Optional: redirect to dashboard if tree not found
                    // router.push('/dashboard')
                }
            } catch (error) {
                console.error('Error fetching tree data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    if (loading) {
        return <p className="text-center mt-8">กำลังโหลดข้อมูล...</p>
    }

    if (!treeData) {
        return <p className="text-center mt-8">ไม่พบข้อมูลต้นไม้</p>
    }

    return (
        <div className="container mx-auto px-4 mt-8">
            <div className="w-11/12 md:w-3/4 mx-auto">
                {/* ปุ่มย้อนกลับอยู่ที่จุดเริ่มต้นของกรอบ */}
                <div className="mb-4">
                    <button 
                        onClick={() => router.push('/diary')} 
                        className="border bg-[#373E11] text-[#E6E4BB] p-2 text-lg rounded-lg"
                    >
                        ย้อนกลับ
                    </button>
                </div>
                
                {/* กรอบข้อมูลต้นไม้ */}
                <div className="bg-[#E6E4BB] rounded-lg shadow-lg p-6 border border-[#373E11]">
                    <h2 className="font-bold text-2xl">{treeData.name}</h2>
                    <div className="mt-4">
                        <p><strong>ประเภทพืช:</strong> {treeData.type}</p>
                        <p><strong>ความสูง:</strong> {treeData.plantHeight} cm</p>
                        <p><strong>ภาชนะที่ใช้ปลูก:</strong> {treeData.container}</p>
                        {treeData.date && (
                            <p><strong>วันที่ปลูก:</strong> {new Date(treeData.date).toLocaleDateString('th-TH')}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page