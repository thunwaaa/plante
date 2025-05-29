'use client'
import React, { useState } from 'react';
import { TriangleAlert, Thermometer } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TreeDiagnosisForm = () => {
  // State สำหรับเลือกได้ช้อยเดียว
  const [problemPart, setProblemPart] = useState('');
  const [wateringFrequency, setWateringFrequency] = useState('');
  const [sunlight, setSunlight] = useState('');
  const [soilType, setSoilType] = useState('');
  const [temperature, setTemperature] = useState('');

  // State สำหรับเลือกได้หลายช้อย
  const [symptoms, setSymptoms] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [fertilizers, setFertilizers] = useState([]);

  const symptomOptions = [
    { id: 'yellow', label: 'ใบเหลือง' },
    { id: 'withered', label: 'ใบเหี่ยว' },
    { id: 'brown', label: 'ใบมีจุดสีน้ำตาล' },
    { id: 'fall', label: 'ใบร่วง' },
    { id: 'rotten_stem', label: 'ลำต้นเน่า' },
    { id: 'pest', label: 'มีแมลง' },
    { id: 'flower_fall', label: 'ดอกร่วง' },
    { id: 'not_bloom', label: 'ไม่ออกดอก' },
    { id: 'root_rot', label: 'รากเน่า' }
  ];

  const materialOptions = [
    'ดินร่วน', 'ดินเหนียว', 'กาบมะพร้าว', 'แกลบดำ',
    'แกลบดิบ', 'ทรายหยาบ', 'พีทมอส', 'หินภูเขาไฟ'
  ];

  const fertilizerOptions = [
    'ปุ๋ยเคมี', 'ปุ๋ยอินทรีย์', 'ปุ๋ยหมัก', 'น้ำหมักชีวภาพ', 'ไม่เคยใส่ปุ๋ย'
  ];

  const handleCheckboxChange = (e, setter, values) => {
    const { value, checked } = e.target;
    if (checked) {
      setter([...values, value]);
    } else {
      setter(values.filter(item => item !== value));
    }
  };

  const handleSubmit = async () => {
    const formData = {
      problemPart,
      symptoms,
      wateringFrequency,
      sunlight,
      soilType,
      temperature,
      materials,
      fertilizers,
    };

    try {
      const response = await fetch('http://localhost:8080/api/diagnosis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to get diagnosis');
      }

      const data = await response.json();
      
      // Store the diagnosis data in sessionStorage
      sessionStorage.setItem('diagnosisData', JSON.stringify({
        ...data,
        matchScore: data.matchScore || 0.8, // Add a default match score if not provided
      }));

      // Navigate to results page
      window.location.href = '/diagnosis/results';
    } catch (error) {
      console.error('Error:', error);
      alert('เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className='flex flex-col justify-center items-center mt-10 px-6'>
        <h1 className='text-3xl md:text-4xl font-bold mb-4 text-center'>วิเคราะห์อาการต้นไม้</h1>
        <p className='text-center max-w-2xl mb-6 text-lg'>
            โปรดกรอกข้อมูล เพื่อนำไปวิเคราะห์ปัญหาและรับคำแนะนำในการดูแลรักษาต้นไม้ของคุณ
        </p>

        {/* ส่วนฟอร์ม */}
        <div className='w-full max-w-6xl px-6 rounded-xl '>

            {/* อาการที่พบ */}
            <section>
            <div className='flex justify-center items-center mb-4'>
                <TriangleAlert size={28} />
                <h2 className='ml-3 font-extrabold underline text-xl'>อาการที่พบ</h2>
            </div>

            <div className='mb-6'>
                <p className='font-semibold mb-2'>ส่วนที่มีปัญหา</p>
                <Select onValueChange={setProblemPart}>
                <SelectTrigger className="w-full rounded-xl border-black">
                    <SelectValue placeholder="เลือกส่วนที่มีปัญหา" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                    {['ใบ','ลำต้น','ราก','ดอก','ผล','ยอดอ่อน','กิ่งก้าน','ทั้งต้น'].map(part => (
                        <SelectItem key={part} value={part}>{part}</SelectItem>
                    ))}
                    </SelectGroup>
                </SelectContent>
                </Select>
            </div>

            <div>
                <p className='font-semibold mb-2'>ลักษณะอาการ (เลือกได้หลายอย่าง)</p>
                <div className='grid md:grid-cols-2 gap-3'>
                {symptomOptions.map(symptom => (
                    <label key={symptom.id} className='flex items-center'>
                    <input
                        type="checkbox"
                        value={symptom.label}
                        onChange={(e) => handleCheckboxChange(e, setSymptoms, symptoms)}
                        className='mr-2'
                    />
                    {symptom.label}
                    </label>
                ))}
                </div>
            </div>
            </section>

            {/* สภาพแวดล้อม */}
            <section>
            <div className='flex justify-center items-center mb-7 mt-2'>
                <Thermometer size={28} />
                <h2 className='ml-3 font-extrabold underline text-xl'>สภาพแวดล้อม</h2>
            </div>


            <div className='grid md:grid-cols-2 gap-6'>
                <div>
                    <p className='font-semibold mb-2'>ความถี่การรดน้ำ</p>
                    <Select onValueChange={setWateringFrequency}>
                        <SelectTrigger className="w-full rounded-xl border border-black">
                        <SelectValue placeholder="เลือกความถี่" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectGroup>
                            {['รดน้ำทุกวัน','รดน้ำวันเว้นวัน','2-3 ครั้งต่อสัปดาห์','สัปดาห์ละครั้ง','เมื่อดินแห้ง'].map(val => (
                            <SelectItem key={val} value={val}>{val}</SelectItem>
                            ))}
                        </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <p className='font-bold mb-2'>แสงแดดที่ได้รับ</p>
                    <Select onValueChange={setSunlight}>
                    <SelectTrigger className="w-full rounded-2xl border border-black">
                        <SelectValue placeholder="เลือกแสงแดด" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        <SelectItem value="แดดจัด">แดดจัด (6-8 ชม.)</SelectItem>
                        <SelectItem value="แดดปานกลาง">แดดปานกลาง (4-6 ชม.)</SelectItem>
                        <SelectItem value="แดดรำไร">แดดรำไร (2-4 ชม.)</SelectItem>
                        <SelectItem value="แดดน้อย">แดดน้อย (&lt; 2 ชม.)</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                    </Select>
                </div>

                <div>
                    <p className='font-bold mb-2'>ชนิดดิน</p>
                    <Select onValueChange={setSoilType}>
                    <SelectTrigger className="w-full rounded-2xl border border-black">
                        <SelectValue placeholder="เลือกชนิดดิน" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        <SelectItem value="ดินเหนียว">ดินเหนียว</SelectItem>
                        <SelectItem value="ดินร่วน">ดินร่วน</SelectItem>
                        <SelectItem value="ดินทราย">ดินทราย</SelectItem>
                        <SelectItem value="ดินผสม">ดินผสม</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                    </Select>
                </div>

                <div>
                    <p className='font-bold mb-2'>อุณหภูมิโดยเฉลี่ย</p>
                    <Select onValueChange={setTemperature}>
                    <SelectTrigger className="w-full rounded-2xl border border-black">
                        <SelectValue placeholder="เลือกช่วงอุณหภูมิ" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        <SelectItem value="ต่ำกว่า 15°C">ต่ำกว่า 15°C</SelectItem>
                        <SelectItem value="15-25°C">15-25°C</SelectItem>
                        <SelectItem value="26-32°C">26-32°C</SelectItem>
                        <SelectItem value="มากกว่า 32°C">มากกว่า 32°C</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                    </Select>
                </div>

            </div>
            </section>

            {/* วัสดุปลูก */}
            <section>
            <p className='font-semibold mb-2 mt-6'>วัสดุปลูก (เลือกได้หลายอย่าง)</p>
            <div className='grid md:grid-cols-2 gap-3'>
                {materialOptions.map((item, index) => (
                <label key={index} className='flex items-center'>
                    <input
                    type="checkbox"
                    value={item}
                    onChange={(e) => handleCheckboxChange(e, setMaterials, materials)}
                    className='mr-2'
                    />
                    {item}
                </label>
                ))}
            </div>
            </section>

            {/* ปุ๋ยที่ใช้ */}
            <section>
            <p className='font-semibold mb-2 mt-6'>ประเภทปุ๋ยที่ใช้ (เลือกได้หลายอย่าง)</p>
            <div className='grid md:grid-cols-2 gap-3'>
                {fertilizerOptions.map((item, index) => (
                <label key={index} className='flex items-center'>
                    <input
                    type="checkbox"
                    value={item}
                    onChange={(e) => handleCheckboxChange(e, setFertilizers, fertilizers)}
                    className='mr-2'
                    />
                    {item}
                </label>
                ))}
            </div>
            </section>

            {/* ปุ่ม */}
            <div className='flex justify-center mt-4'>
            <button
                onClick={handleSubmit}
                className='bg-[#373E11] text-[#E6E4BB] font-bold py-2 px-4 rounded-xl hover:scale-105 transition'
            >
                วิเคราะห์อาการ
            </button>
            </div>
        </div>
        </div>

  );
};

export default TreeDiagnosisForm;
