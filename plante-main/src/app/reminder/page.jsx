'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select" 

const WaterReminder = () => {
  const [plant, setPlant] = useState('');
  const [time, setTime] = useState('');
  const [frequency, setFrequency] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSet, setIsSet] = useState(false); 

  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!frequency) {
      setLoading(false);
      setError('กรุณาเลือกความต้องการ');
      return;
    }

    setTimeout(() => {
      setLoading(false);
      setSuccess(`ตั้งการแจ้งเตือน${frequency === 'รดน้ำต้นไม้' ? 'รดน้ำ' : 'ใส่ปุ๋ย'}ต้นไม้ "${plant}" เรียบร้อยแล้ว!`);
      setIsSet(true);
    }, 1500);
  };

  const handleViewNotice = () => {
    router.push('/reminder/notice');
  };

  return (
    <div className="min-h-screen bg-[#E6E4BB] flex flex-col items-center justify-start py-12 px-4">
      <h1 className="text-4xl font-bold text-[#373E11] mb-4 text-center">สร้างการแจ้งเตือนรดน้ำต้นไม้หรือใส่ปุ๋ย</h1>
      <p className="text-[#373E11] mb-8 max-w-xl text-center">
        ตั้งเวลาการแจ้งเตือนเพื่อให้คุณไม่ลืมรดน้ำต้นไม้หรือใส่ปุ๋ยอย่างสม่ำเสมอ
      </p>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {success && <div className="text-green-700 mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-[#F1F1D0] p-6 rounded-2xl w-full max-w-xl shadow-md">
        <div className="mb-6">
          <label className="block text-[#373E11] font-semibold mb-2">ชื่อต้นไม้ที่ต้องการตั้งแจ้งเตือน</label>
          <input
            type="text"
            value={plant}
            onChange={(e) => setPlant(e.target.value)}
            required
            placeholder="ใส่ชื่อต้นไม้ของคุณ"
            className="w-full rounded-2xl px-4 py-3 text-[#373E11] font-semibold border border-[#373E11] focus:outline-none"
            disabled={isSet} 
          />
        </div>

        <div className="mb-6">
          <label className="block text-[#373E11] font-semibold mb-2">เวลาที่ต้องการให้แจ้งเตือน</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="w-full rounded-2xl px-4 py-3 text-[#373E11] font-semibold border border-[#373E11] focus:outline-none"
            disabled={isSet}
          />
        </div>

        {/* เพิ่มส่วนนี้ */}
        <div className="mb-6">
          <label className="block text-[#373E11] font-semibold mb-2">ความต้องการ</label> 
          <Select 
            onValueChange={setFrequency} 
            required 
            disabled={isSet}
            value={frequency}
          >
            <SelectTrigger className="w-full rounded-2xl border border-[#373E11] h-12">
              <SelectValue placeholder="เลือกความต้องการ" /> 
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="รดน้ำต้นไม้">รดน้ำต้นไม้</SelectItem> 
                <SelectItem value="ใส่ปุ๋ยต้นไม้">ใส่ปุ๋ยต้นไม้</SelectItem> 
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {!isSet ? (
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-[#E6E4BB] bg-[#373E11] rounded-2xl py-3 font-bold text-lg hover:bg-[#454b28] transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'กำลังตั้งค่าแจ้งเตือน...' : 'ตั้งการแจ้งเตือน'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleViewNotice}
            className="w-full text-[#E6E4BB] bg-[#373E11] rounded-2xl py-3 font-bold text-lg hover:bg-[#454b28] transition-colors"
          >
            ดูการแจ้งเตือน
          </button>
        )}
      </form>
    </div>
  )
}

export default WaterReminder
