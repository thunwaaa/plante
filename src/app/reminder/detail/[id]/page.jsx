'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Plus, X, Bell, BellOff, Droplet, Sprout } from 'lucide-react'
import { API_URL } from '@/lib/api'

const ReminderDetailPage = () => {
    const router = useRouter()
    const { id } = useParams()
    const [plant, setPlant] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [reminders, setReminders] = useState([])
    const [loadingReminders, setLoadingReminders] = useState(true)
    const [showDeleteReminderConfirmDialog, setShowDeleteReminderConfirmDialog] = useState(false)
    const [reminderToDeleteId, setReminderToDeleteId] = useState(null)

    const fetchPlantData = async () => {
        try {
            console.log('Fetching plant data for ID:', id)
            setLoading(true)
            const response = await fetch(`${API_URL}/api/plants/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            })
            
            if (!response.ok) {
                throw new Error('Failed to fetch plant data')
            }
            
            const data = await response.json()
            console.log('Received plant data:', data)
            setPlant(data)
        } catch (error) {
            console.error('Error fetching plant:', error)
            setError('ไม่สามารถโหลดข้อมูลต้นไม้ได้')
        } finally {
            setLoading(false)
        }
    }

    const fetchReminders = async () => {
        try {
            setLoadingReminders(true)
            const response = await fetch(`${API_URL}/api/reminders/plant/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to fetch reminders')
            }
            
            const data = await response.json()
            console.log('Fetched reminders:', data)
            setReminders(data.reminders || [])
        } catch (error) {
            console.error('Error fetching reminders:', error)
            setError('ไม่สามารถโหลดข้อมูลการแจ้งเตือนได้: ' + error.message)
        } finally {
            setLoadingReminders(false)
        }
    }

    const handleDeleteReminder = async (reminderId) => {
        setReminderToDeleteId(reminderId)
        setShowDeleteReminderConfirmDialog(true)
    }

    const confirmDeleteReminder = async () => {
        if (!reminderToDeleteId) return

        try {
            const response = await fetch(`${API_URL}/api/reminders/${reminderToDeleteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!response.ok) throw new Error('Failed to delete reminder')

            // Refresh reminders list
            await fetchReminders()
            setShowDeleteReminderConfirmDialog(false)
            setReminderToDeleteId(null)
        } catch (error) {
            console.error('Error deleting reminder:', error)
            setError('ไม่สามารถลบการแจ้งเตือนได้')
            setShowDeleteReminderConfirmDialog(false)
            setReminderToDeleteId(null)
        }
    }

    const formatReminderTime = (dateInput) => {
        console.log("[DEBUG] raw dateInput:", dateInput);
        let date;
        if (typeof dateInput === 'object' && dateInput !== null && dateInput.$date) {
            // If the input is an object with a $date property, use that string
            date = new Date(dateInput.$date);
            console.log("[DEBUG] parsed from $date:", date);
        } else if (typeof dateInput === 'string') {
            // If the input is already a string, use it directly
            date = new Date(dateInput);
            console.log("[DEBUG] parsed from string:", date);
        } else {
            // Handle other cases, maybe return a default or indicate error
            console.log("[DEBUG] unhandled dateInput type:", typeof dateInput);
            return 'Invalid Date';
        }

        // Check if the date is valid before formatting
        if (isNaN(date.getTime())) {
            console.error("[DEBUG] Invalid Date generated for input:", dateInput);
            return 'Invalid Date';
        }

        return date.toLocaleString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getReminderStatus = (reminder) => {
        const now = new Date()
        // Safely extract the date string before creating the Date object
        const scheduledDateString = reminder.scheduledTime && reminder.scheduledTime.$date ? reminder.scheduledTime.$date : reminder.scheduledTime;
        const reminderTime = new Date(scheduledDateString);

        // Check if reminderTime is a valid date before comparing
        if (isNaN(reminderTime.getTime())) {
             // If date is invalid, and reminder is active, maybe indicate an error or unknown status?
             // For now, if active, let's treat it as pending, otherwise cancelled.
             return reminder.is_active ? 'รอดำเนินการ (ข้อผิดพลาดเวลา)' : 'ยกเลิกแล้ว';
        }

        if (reminder.is_active) {
            if (reminder.frequency === 'once') {
                return reminderTime > now ? 'รอดำเนินการ' : 'หมดอายุ';
            } else {
                // Recurring active reminders are always considered pending in this view
                return 'รอดำเนินการ';
            }
        }
        return 'ยกเลิกแล้ว';
    }

    const getReminderStatusColor = (status) => {
        switch (status) {
            case 'รอดำเนินการ': return 'text-green-600 bg-green-100'
            case 'หมดอายุ': return 'text-yellow-600 bg-yellow-100'
            case 'ยกเลิกแล้ว': return 'text-gray-600 bg-gray-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    // Mapping for English day names to Thai
    const thaiDaysOfWeek = {
        Sunday: 'วันอาทิตย์',
        Monday: 'วันจันทร์',
        Tuesday: 'วันอังคาร',
        Wednesday: 'วันพุธ',
        Thursday: 'วันพฤหัสบดี',
        Friday: 'วันศุกร์',
        Saturday: 'วันเสาร์',
    };

    useEffect(() => {
        console.log('Component mounted, fetching data for ID:', id)
        fetchPlantData()
        fetchReminders()

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('Page became visible, refetching data...')
                fetchReminders()
            }
        }

        const handleFocus = () => {
            console.log('Page focused, refetching data...')
            fetchReminders()
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('focus', handleFocus)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('focus', handleFocus)
        }
    }, [id])

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
                    onClick={() => router.push('/reminder')}
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

                {/* Plant Info */}
                <div className="mb-6 bg-[#E6E4BB] rounded-lg shadow-lg p-6 border border-[#373E11]">
                    <h2 className="text-2xl font-bold text-[#373E11] mb-2">{plant.name}</h2>
                    <p className="text-gray-600">ประเภท: {plant.type}</p>
                    {plant.container && <p className="text-gray-600">ภาชนะ: {plant.container}</p>}
                </div>

                {/* Reminders Section */}
                <div className="bg-[#E6E4BB] rounded-lg shadow-lg p-6 border border-[#373E11]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-xl">การแจ้งเตือน</h3>
                        <button 
                            onClick={() => router.push(`/reminder/detail/${id}/new`)}
                            className="flex items-center gap-2 bg-[#373E11] text-[#E6E4BB] px-3 py-1 max-sm:px-2 max-sm:py-2 max-sm:text-sm rounded-lg hover:bg-[#4a5216] transition-colors"
                        >
                            <Plus size={16} /> เพิ่มการแจ้งเตือน
                        </button>
                    </div>

                    {loadingReminders ? (
                        <div className="flex justify-center items-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#373E11]"></div>
                        </div>
                    ) : reminders.length > 0 ? (
                        <div className="space-y-4">
                            {[...reminders]
                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                .map((reminder) => {
                                // Determine status based on activity, frequency, and scheduled time for 'once' reminders.
                                const now = new Date();
                                const reminderTime = new Date(reminder.scheduledTime && reminder.scheduledTime.$date ? reminder.scheduledTime.$date : reminder.scheduledTime);

                                return (
                                    <div key={reminder.id} className="rounded-lg p-4 shadow border transition delay-75 duration-100 ease-in-out hover:-translate-y-1 hover:scale-95 bg-[#E6E4BB]">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Bell className="w-5 h-5 text-[#373E11]" color='#d20f0f'/>
                                                    <h4 className="font-medium text-[#373E11]">
                                                        {reminder.type === 'watering' ? (
                                                            <div className="flex items-center gap-1">
                                                                <span className='text-lg italic font-semibold'>อย่าลืมรดน้ำ!</span>
                                                            </div>
                                                        ) : reminder.type === 'fertilizing' ? (
                                                            <div className="flex items-center gap-1">
                                                                <span className='text-lg italic font-semibold'>อย่าลืมใส่ปุ๋ย!</span>
                                                            </div>
                                                        ) : (
                                                            <span>{reminder.type}</span> // Fallback for other types
                                                        )}
                                                    </h4>
                                                </div>
                                                <div className='my-2'>
                                                    <span className="px-2 py-2 rounded-full text-sm bg-blue-100 text-blue-600">
                                                        {reminder.frequency === 'once' ? 'ครั้งเดียว' : reminder.frequency === 'daily' ? 'ทุกวัน' : 'ทุกสัปดาห์'}
                                                    </span>
                                                </div>
                                                {/* Display time/day based on frequency */}
                                                <div className='grid grid-cols-1 gap-2'>
                                                    {reminder.frequency === 'once' && (
                                                        <div className="mt-2 text-sm ">
                                                            เวลาที่กำหนด: {
                                                                reminder.scheduledTime 
                                                                ? formatReminderTime(reminder.scheduledTime)
                                                                : 'เวลาที่กำหนดไม่พร้อมใช้งาน'
                                                            }
                                                        </div>
                                                    )}
                                                    {(reminder.frequency === 'daily' || reminder.frequency === 'weekly') && (
                                                        <div className="mt-2 text-sm ">
                                                            เวลา: {
                                                                reminder.timeOfDay 
                                                                ? reminder.timeOfDay
                                                                : 'เวลาไม่พร้อมใช้งาน'
                                                            }
                                                        </div>
                                                    )}
                                                    {reminder.frequency === 'weekly' && (
                                                        <div className="mt-1 text-sm ">
                                                            วัน: {
                                                                reminder.dayOfWeek 
                                                                ? thaiDaysOfWeek[reminder.dayOfWeek] || reminder.dayOfWeek // Use Thai name, fallback to English if not found
                                                                : 'วันไม่พร้อมใช้งาน'
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {reminder.is_active && (
                                                <button
                                                    onClick={() => handleDeleteReminder(reminder._id)}
                                                    className="p-2 hover:bg-red-50 rounded-full text-red-600"
                                                    title="ยกเลิกการแจ้งเตือน"
                                                >
                                                    <BellOff className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600 py-4">ยังไม่มีการแจ้งเตือน</p>
                    )}
                </div>

                {/* Delete Reminder Confirmation Dialog */}
                {showDeleteReminderConfirmDialog && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                        <div className="bg-[#E6E4BB] rounded-xl p-6 w-full max-w-sm border border-[#373E11] shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-[#373E11]">ยืนยันการยกเลิกแจ้งเตือน</h2>
                                <button onClick={() => {
                                    setShowDeleteReminderConfirmDialog(false)
                                    setReminderToDeleteId(null)
                                }}>
                                    <X size={24} className="text-[#373E11]" />
                                </button>
                            </div>
                            <p className="text-gray-700 mb-6">คุณแน่ใจหรือไม่ที่จะยกเลิกการแจ้งเตือนนี้?</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteReminderConfirmDialog(false)
                                        setReminderToDeleteId(null)
                                    }}
                                    className="px-4 py-2 border rounded-lg text-[#373E11] hover:bg-gray-100 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={confirmDeleteReminder}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    ยืนยัน
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReminderDetailPage