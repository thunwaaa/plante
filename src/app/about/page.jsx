"use client";
import React from "react";
import { Leaf, Search, Calendar, TreeDeciduous } from "lucide-react";

const AboutPage = () => {
  return (
    <>
      <div className="flex flex-col justify-center items-center my-8">
        <div className="flex gap-2">
          <h1 className="font-bold text-3xl italic">Hey, this is</h1>
          <h1 className="font-bold text-3xl italic underline">Plante!</h1>
        </div>
        <p className="my-4 text-center mx-6">
          แพลตฟอร์มที่ครบครันสำหรับการดูแลและจัดการต้นไม้ของคุณ
          ด้วยเทคโนโลยีที่ทันสมัยและใส่ใจในรายละเอียด
        </p>
        <h1 className="text-2xl font-semibold italic mt-5 ">ฟีเจอร์หลักของระบบ</h1>

        <div className="grid grid-cols-2 max-md:grid-cols-1 justify-center items-center text-center gap-4 my-6">

          <div className="bg-[#E6E4BB] text-center flex flex-col items-center border px-4 py-5 rounded-2xl w-96 h-48  max-sm:w-64 transition duration-150 delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:shadow-2xl">
            <Leaf size={32} />
            <p className="text-xl my-3 font-semibold">บันทึกการเติบโต</p>
            <p className="mb-2">
              เพิ่มบันทึกการเติบโตของต้นไม้ ติดตามความสูงที่เพิ่มขึ้นตามเวลา
              เพื่อวิเคราะห์พัฒนาการ
            </p>
          </div>

          <div className="bg-[#E6E4BB] flex flex-col items-center border px-4 py-5  rounded-2xl w-96 h-48  max-sm:w-64 transition duration-150 delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:shadow-2xl">
            <Search size={32} />
            <p className="text-xl my-3 font-semibold">วิเคราะห์โรคเบื้องต้น</p>
            <p className="mb-2">
              ระบบช่วยวิเคราะห์และตรวจสอบอาการผิดปกติของต้นไม้
              เพื่อการดูแลรักษาที่ทันท่วงที
            </p>
          </div>

          <div className="bg-[#E6E4BB] flex flex-col items-center border px-4 py-5  rounded-2xl w-96 h-48  max-sm:w-64 transition duration-150 delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:shadow-2xl">
            <TreeDeciduous size={32} />
            <p className="text-xl my-3 font-semibold">
              แนะนำต้นไม้ตามสภาพแวดล้อม
            </p>
            <p className="mb-2">
              ค้นหาและแนะนำพันธุ์ต้นไม้ที่เหมาะสมกับสภาพแวดล้อมของคุณ
            </p>
          </div>

          <div className="bg-[#E6E4BB] flex flex-col items-center border px-4 py-5 rounded-2xl w-96 h-48  max-sm:w-64 transition duration-150 delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:shadow-2xl">
            <Calendar size={32} />
            <p className="text-xl my-3 font-semibold">แจ้งเตือนการดูแล</p>
            <p className="mb-2">
              ตั้งค่าแจ้งเตือนสำหรับการรดน้ำและใส่ปุ๋ย
              เพื่อให้ต้นไม้ได้รับการดูแลอย่างสม่ำเสมอ
            </p>
          </div>
          
        </div>
      </div>

      <div className="bg-[#373E11] w-full border text-[#E6E4BB] flex flex-col justify-center items-center">
        <h1 className="font-semibold text-2xl mt-12 italic">วิสัยทัศน์</h1>

        <div className="grid justify-center text-[#373E11] items-center text-center gap-4 my-6">
          <div className="bg-[#E6E4BB] text-center flex flex-col items-center border px-4 py-5 rounded-2xl w-200 max-md:w-96 max-md:h-56 max-sm:w-64 h-42 max-sm:h-56 transition duration-150 delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:shadow-2xl">
            <p className="text-xl my-3 font-semibold">เป้าหมาย</p>
            <p className="mb-2">
              เราต้องการสร้างเครื่องมือที่ช่วยให้ทุกคนสามารถดูแลต้นไม้ได้อย่างมีประสิทธิภาพ
              ไม่ว่าจะเป็นมือใหม่หรือผู้เชี่ยวชาญ ด้วยระบบที่ใช้งานง่ายและมีความแม่นยำสูง
            </p>
          </div>

          <div className="bg-[#E6E4BB] flex flex-col items-center border px-4 py-5  rounded-2xl w-200 max-sm:w-64 max-md:w-96 max-md:h-56 h-42 max-sm:h-56 transition duration-150 delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:shadow-2xl">
            <p className="text-xl my-3 font-semibold">ประโยชน์</p>
            <p className="mb-2">
              ระบบของเราจะช่วยเพิ่มอัตราการรอดชีวิตของต้นไม้ ลดเวลาในการดูแล และสร้างความรู้ความเข้าใจในการปลูกต้นไม้ที่ถูกต้องและยั่งยืน
            </p>
          </div>

        </div>

      </div>

    </>
  );
};

export default AboutPage;
