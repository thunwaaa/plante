'use client'
import React, {useState, useEffect} from 'react'
import { useRouter, useParams } from 'next/navigation'
import { plantApi } from '@/lib/api'
import { API_URL } from '@/lib/api'
import { BellDot, Loader2, Droplet, Sprout } from 'lucide-react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { initializeNotifications, requestNotificationPermission } from '@/lib/notification';

const PlantReminderPage = () => {
    const router = useRouter()
    const params = useParams()
    const plantId = params.id

    const [plant, setPlant] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [reminderData, setReminderData] = useState({
        type: '',
        frequency: '',
        scheduledTime: '',
        dayOfWeek: '',
        timeOfDay: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [notificationToken, setNotificationToken] = useState(null);

    useEffect(() => {
        if (plantId) {
            fetchPlant(plantId)
            checkNotificationPermission()
            // Initialize notifications when the page loads
            initializeNotifications().catch(console.error);
        }
    }, [plantId])

    const fetchPlant = async (id) => {
        try {
            setLoading(true)
            const data = await plantApi.getPlant(id)
            setPlant(data)
        } catch (err) {
            console.error(`Error fetching plant ${id}:`, err)
            setError('ไม่สามารถโหลดข้อมูลต้นไม้ได้ กรุณาลองใหม่อีกครั้ง')
            toast.error('ไม่สามารถโหลดข้อมูลต้นไม้ได้')
        } finally {
            setLoading(false)
        }
    }

    const checkNotificationPermission = async () => {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        const permission = Notification.permission;
        setNotificationPermission(permission);

        if (permission === 'granted') {
            try {
                const token = await requestNotificationPermission();
                setNotificationToken(token);
            } catch (error) {
                console.error('Failed to get notification token:', error);
            }
        }
    };

    const handleNotificationPermission = async () => {
        try {
            const token = await requestNotificationPermission();
            setNotificationToken(token);
            setNotificationPermission('granted');
            toast.success('เปิดใช้งานการแจ้งเตือนสำเร็จ!');
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            toast.error('ไม่สามารถเปิดใช้งานการแจ้งเตือนได้');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReminderData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleDateChange = (e) => {
        setReminderData(prevData => ({
            ...prevData,
            scheduledTime: e.target.value
        }));
    };

    const handleTimeChange = (e) => {
        setReminderData(prevData => ({
            ...prevData,
            timeOfDay: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Check notification permission first
        if (notificationPermission !== 'granted') {
            toast.error('กรุณาอนุญาตการแจ้งเตือนก่อนตั้งค่าการแจ้งเตือน');
            setIsSubmitting(false);
            return;
        }

        if (!reminderData.type || !reminderData.frequency) {
            setError('กรุณาเลือกประเภทและความถี่การแจ้งเตือน');
            setIsSubmitting(false);
            return;
        }
        if (reminderData.frequency === 'once' && !reminderData.scheduledTime) {
            setError('กรุณาเลือกวันที่และเวลาสำหรับการแจ้งเตือนครั้งเดียว');
            setIsSubmitting(false);
            return;
        }
        if ((reminderData.frequency === 'daily' || reminderData.frequency === 'weekly') && !reminderData.timeOfDay) {
            setError('กรุณาเลือกเวลาสำหรับการแจ้งเตือนรายวัน/รายสัปดาห์');
            setIsSubmitting(false);
            return;
        }
        if (reminderData.frequency === 'weekly' && !reminderData.dayOfWeek) {
            setError('กรุณาเลือกวันในสัปดาห์สำหรับการแจ้งเตือนรายสัปดาห์');
            setIsSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const reminderPayload = {
                plantId: plantId,
                type: reminderData.type,
                frequency: reminderData.frequency,
                scheduledTime: reminderData.frequency === 'once' ? new Date(reminderData.scheduledTime).toISOString() : undefined,
                dayOfWeek: reminderData.frequency === 'weekly' ? reminderData.dayOfWeek : undefined,
                timeOfDay: (reminderData.frequency === 'daily' || reminderData.frequency === 'weekly') ? reminderData.timeOfDay : undefined,
                fcmToken: notificationToken,
                plantName: plant.name,
            };
            
            Object.keys(reminderPayload).forEach(key => reminderPayload[key] === undefined && delete reminderPayload[key]);

            const res = await fetch(`${API_URL}/api/reminders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify(reminderPayload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create reminder');
            }

            toast.success('ตั้งค่าการแจ้งเตือนสำเร็จ!');
            router.push('/dashboard');

        } catch (err) {
            console.error('Error creating reminder:', err);
            setError(err.message);
            toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-[#373E11]" />
            </div>
        )
    }

    if (error && !plant) {
        return (
            <div className="text-red-600 text-center mt-8">เกิดข้อผิดพลาด: {error}</div>
        )
    }

    if (!plant) {
        return (
            <div className="text-gray-600 text-center mt-8">ไม่พบข้อมูลต้นไม้</div>
        );
    }

    return (
        <div className="container mx-auto p-6 bg-[#E6E4BB] min-h-screen">
            <h1 className="text-2xl font-bold text-center text-[#373E11]">ข้อมูลการแจ้งเตือนสำหรับ {plant.name}</h1>
            <p className='text-center mt-3'>กรอกข้อมูลเพื่อสร้างการแจ้งเตือนสำหรับพืชของคุณ</p>
            <div className="max-w-3xl mx-auto p-2 rounded-lg grid grid-cols-2 items-start justify-center mt-[-3]">
                <div className="mx-3 ml-12">
                        <div key={plant._id} className="p-2 rounded-xl w-64 bg-[#E6E4BB] relative mt-8">
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
                            <div className='grid gap-3 justify-center'>
                                <h2 className="text-xl font-bold underline text-center">{plant.name}</h2>
                                <p>วันที่ปลูก: {new Date(plant.plant_date).toLocaleDateString('th-TH')}</p>
                            </div>
                        </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 ml-[-12]">
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    
                    {notificationPermission !== 'granted' && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <BellDot className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        คุณต้องเปิดใช้งานการแจ้งเตือนก่อนตั้งค่าการแจ้งเตือน
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleNotificationPermission}
                                        className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                    >
                                        เปิดใช้งานการแจ้งเตือน
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className='mt-8'>
                        <label className="block text-lg font-semibold mb-2">ประเภทการแจ้งเตือน:</label>
                        <div className="grid">
                            <label className="inline-flex items-center border p-2 mb-3 rounded-lg hover:bg-[#373E11] hover:text-[#E6E4BB] transition duration-300 ease-in-out">
                                <input 
                                    type="radio" 
                                    name="type" 
                                    value="watering" 
                                    checked={reminderData.type === 'watering'}
                                    onChange={handleInputChange} 
                                    className="form-radio text-[#373E11]"
                                    required
                                />
                                <div className='flex ml-3 gap-1 items-center'>
                                    <Droplet size={20} color='#00b0eb' />
                                    <span>รดน้ำ</span>
                                </div>
                            </label>
                            <label className="inline-flex items-center border p-2 mb-3 rounded-lg hover:bg-[#373E11] hover:text-[#E6E4BB] transition duration-300 ease-in-out">
                                <input 
                                    type="radio" 
                                    name="type" 
                                    value="fertilizing" 
                                    checked={reminderData.type === 'fertilizing'}
                                    onChange={handleInputChange} 
                                    className="form-radio text-[#373E11]"
                                    required
                                />
                                <div className='flex ml-3 items-center'>
                                    <Sprout size={22} color='#018923' />
                                    <span className="ml-2">ใส่ปุ๋ย</span>

                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                         <label className="block text-lg font-semibold mb-2">ความถี่:</label>
                        <Select 
                            name="frequency" 
                            value={reminderData.frequency} 
                            onValueChange={(value) => handleInputChange({ target: { name: 'frequency', value } })}
                            required
                        >
                            <SelectTrigger className="w-full mt-1 pl-3 py-2 text-base border-[#373E11] focus:outline-none focus:ring-[#373E11] focus:border-[#373E11] sm:text-sm rounded-md">
                                <SelectValue placeholder="เลือกความถี่" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="once">ครั้งเดียว</SelectItem>
                                    <SelectItem value="daily">ทุกวัน</SelectItem>
                                    <SelectItem value="weekly">ทุกสัปดาห์</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {reminderData.frequency === 'once' && (
                        <div>
                            <label className="block text-lg font-semibold mb-2">วันที่และเวลา:</label>
                            <input 
                                type="datetime-local" 
                                name="scheduledTime" 
                                value={reminderData.scheduledTime} 
                                onChange={handleDateChange} 
                                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border focus:outline-none focus:ring-[#373E11] focus:border-[#373E11] sm:text-sm rounded-md"
                                required
                            />
                        </div>
                    )}

                    {reminderData.frequency === 'weekly' && (
                         <div>
                            <label className="block text-lg font-semibold mb-2">วันในสัปดาห์:</label>
                            <Select 
                                name="dayOfWeek" 
                                value={reminderData.dayOfWeek} 
                                onValueChange={(value) => handleInputChange({ target: { name: 'dayOfWeek', value } })}
                                required
                            >
                                <SelectTrigger className="w-full mt-1 pl-3 py-2 text-base border-[#373E11] focus:outline-none focus:ring-[#373E11] focus:border-[#373E11] sm:text-sm rounded-md">
                                    <SelectValue placeholder="เลือกวัน" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Sunday">อาทิตย์</SelectItem>
                                        <SelectItem value="Monday">จันทร์</SelectItem>
                                        <SelectItem value="Tuesday">อังคาร</SelectItem>
                                        <SelectItem value="Wednesday">พุธ</SelectItem>
                                        <SelectItem value="Thursday">พฤหัสบดี</SelectItem>
                                        <SelectItem value="Friday">ศุกร์</SelectItem>
                                        <SelectItem value="Saturday">เสาร์</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                     {(reminderData.frequency === 'daily' || reminderData.frequency === 'weekly') && ( 
                        <div>
                            <label className="block text-lg font-semibold mb-2">เวลา:</label>
                            <input 
                                type="time" 
                                name="timeOfDay" 
                                value={reminderData.timeOfDay} 
                                onChange={handleTimeChange} 
                                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-[#373E11] focus:outline-none focus:ring-[#373E11] focus:border-[#373E11] sm:text-sm rounded-md"
                                required
                            />
                        </div>
                     )}

                    <div>
                        <label className='font-semibold text-lg block mb-2'>
                            ข้อความเพิ่มเติม:
                        </label>
                        <textarea
                         placeholder='เช่น ปริมาณน้ำ หรือ ชื่อปุ๋ย'
                         className='w-full border p-2 rounded-lg text-base'
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-[#373E11] text-[#E6E4BB] p-3 rounded-md font-medium hover:bg-[#454b28] transition-colors flex items-center justify-center"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BellDot className="mr-2 h-5 w-5" />} {isSubmitting ? 'กำลังตั้งค่า...' : 'ตั้งค่าการแจ้งเตือน'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default PlantReminderPage
