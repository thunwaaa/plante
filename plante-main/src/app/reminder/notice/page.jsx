'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const ReminderNotice = () => {
  const router = useRouter();

  const [reminders, setReminders] = useState([
    { id: 1, plant: 'ต้นบอน', time: '08:00', frequency: 'รดน้ำต้นไม้' },
    { id: 2, plant: 'ต้นเฟิร์น', time: '19:30', frequency: 'ใส่ปุ๋ยต้นไม้' },
  ]);

  const handleDelete = (id) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  const handleAddNew = () => {
    router.push('/reminder');
  };

  return (
    <div className="min-h-screen bg-[#E6E4BB] flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-bold text-[#373E11] mb-6">แจ้งเตือนรดน้ำต้นไม้</h1>
      {reminders.length === 0 ? (
        <p className="text-[#373E11] text-center mb-6">ไม่มีการแจ้งเตือนรดน้ำต้นไม้ในขณะนี้</p>
      ) : (
        <ul className="w-full max-w-xl bg-[#F1F1D0] rounded-2xl shadow-md p-6 space-y-4">
          {reminders.map(({ id, plant, time, frequency }) => (
            <li
              key={id}
              className="flex justify-between items-center border border-[#373E11] rounded-xl px-4 py-3 bg-white"
            >
              <div className="text-[#373E11] font-semibold">
                <p>ต้นไม้: {plant}</p>
                <p>เวลาที่แจ้งเตือน: {time}</p>
                <p>ความต้องการ: {frequency === 'รดน้ำต้นไม้' ? 'รดน้ำ' : 'ใส่ปุ๋ย'}</p>
              </div>
              <button
                onClick={() => handleDelete(id)}
                className="text-red-600 font-bold hover:text-red-800 transition"
                aria-label={`ลบแจ้งเตือน ${plant}`}
              >
                ลบ
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={handleAddNew}
        className="mt-8 bg-[#373E11] text-[#E6E4BB] px-8 py-3 rounded-2xl font-bold hover:bg-[#454b28] transition-colors"
      >
        เพิ่มการแจ้งเตือนใหม่
      </button>
    </div>
  )
}

export default ReminderNotice
