"use client"
import Image from "next/image";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
    {/* <div className="flex justify-center">
      <button className="border rounded-2xl p-2">
        <Link href="/dashboard">dashboard</Link>
      </button>
    </div> */}
      <div className="border-b h-auto">
        <div className="flex justify-between m-4">
          <p className="text-5xl max-md:text-2xl max-sm:text-lg max-sm:m-2 mx-5 my-9 lg:my-16 lg:mx-10">LET US HELP YOU <br /> TAKE CARE <br /> YOUR PLANT</p>
          <Image 
            src="/function1.svg" 
            alt="f1" 
            width={490}
            height={490}
            className="max-md:w-42 max-lg:w-72 xl:w-[490px] h-auto mt-8 lg:mt-4 lg:mr-8"
            priority
          />
        </div>
        <Link 
          href="/signup"
          className="max-md:h-12 max-md:w-80 lg:w-[436px] lg:h-14 lg:rounded-4xl w-96 h-12 rounded-3xl bg-[#373E11] text-[#E6E4BB] lg:text-2xl
          md:text-xl max-sm:text-[11px] flex items-center justify-center mx-4 md:mx-8 lg:mx-16 mb-8 max-sm:mt-[-56] md:mt-[-44] lg:mt-[-100] lg:mb-24
          transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
        >
          <span className="flex items-center">
            สร้างแจ้งเตือนการรดน้ำ หรือ ใส่ปุ๋ย
            <ArrowRight color="#E6E4BB" className="ml-8 max-md:ml-3 max-sm:ml-2 max-sm:w-4"/>
          </span>
        </Link>
      </div>
      <div className="border-b h-auto bg-[#373E11] mt-[-18]">
        <div className="flex justify-between m-4">
          <Image 
            src="/function2.svg" 
            alt="f2" 
            width={400}
            height={400}
            className="max-md:w-36 max-lg:w-56 xl:w-[400px] h-auto mt-8 lg:mt-8 sm:ml-2 lg:ml-6"
            priority
          />
          <p className="text-5xl lg:text-6xl md:text-4xl max-sm:text-lg max-sm:m-2 mx-5 my-9 lg:my-16 lg:mx-10 max-sm:mt-8 md:mt-16 lg:mt-24 text-[#E6E4BB] text-right">Find the Perfect Green <br /> Companion for Your <br />Environment!</p>
        </div>
        <div className="flex justify-end">
          <Link 
            href="/signup"
            className="max-md:h-12 max-md:w-96 md:w-[450] lg:w-[548px] lg:h-14 lg:rounded-4xl w-96 h-12 rounded-3xl bg-[#E6E4BB] text-[#373E11] lg:text-2xl
            md:text-xl max-sm:text-[11px] flex flex-row-reverse items-center justify-center mx-4 md:mx-8 lg:mx-16 mb-8 
            max-sm:mt-[-72] md:mt-[-80] md:mb-12 lg:mt-[-180] lg:mb-36 transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
          >
            <span className="flex flex-row-reverse items-center">
              ชนิดพืชที่เหมาะสำหรับสภาพแวดล้อมของคุณ!
              <ArrowLeft color="#373E11" className="mr-5 max-md:mr-3 max-sm:mr-2 max-sm:w-4"/>
            </span>
          </Link>
        </div>
      </div>
      <div className="border-b h-auto bg-[#E6E4BB] mt-[-18]">
        <div className="flex justify-between m-4">
          <p className="text-5xl lg:text-6xl md:text-4xl max-sm:text-lg max-sm:m-2 mx-5 my-9 lg:my-16 lg:mx-10 max-sm:mt-10 md:mt-20 lg:mt-28 text-[#373E11]">Get Expert Care Tips <br /> for Your Plants</p>
          <Image 
            src="/function3.svg" 
            alt="f3" 
            width={550}
            height={550}
            className="max-md:w-44 max-lg:w-80 xl:w-[550px] h-auto mt-8 lg:mt-14 lg:mb-14 max-sm:mr-[-8] lg:mr-6 max-sm:mt-8"
            priority
          />
        </div>
        <Link 
          href="/signup"
          className="max-md:h-12 max-md:w-96 md:w-[432] lg:w-[524px] lg:h-14 lg:rounded-4xl w-96 h-12 rounded-3xl bg-[#373E11] text-[#E6E4BB] lg:text-2xl
          md:text-xl max-sm:text-[11px] flex items-center justify-center mx-4 md:mx-8 lg:mx-16 mb-8 
          max-sm:mt-[-62] max-sm:mb-14 md:mt-[-80] md:mb-18 lg:mt-[-236] lg:mb-36 transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
        >
          <span className="flex items-center">
            วิเคราะห์อาการและแก้ปัญหาต้นไม้เบื้องต้น!
            <ArrowRight color="#E6E4BB" className="ml-5 max-md:ml-3 max-sm:ml-0.5 max-sm:w-4"/>
          </span>
        </Link>
      </div>
      <div className="border-b h-auto bg-[#373E11] mt-[-18]">
        <div className="flex justify-between m-4">
          <Image 
            src="/function4.svg" 
            alt="f4" 
            width={600}
            height={600}
            className="max-md:w-48 max-lg:w-80 xl:w-[600px] h-auto mt-8 lg:mt-8 sm:ml-2 lg:ml-6"
            priority
          />
          <p className="text-5xl lg:text-6xl md:text-4xl max-sm:text-lg max-sm:m-2 mx-5 my-9 lg:my-16 lg:mx-10 max-sm:mt-12 md:mt-24 lg:mt-36 text-[#E6E4BB] text-right">Track Your <br /> Plant's Growth</p>
        </div>
        <div className="flex justify-end">
          <Link 
            href="/signup"
            className="max-md:h-12 max-md:w-96 md:w-[412] lg:w-[500px] lg:h-14 lg:rounded-4xl w-96 h-12 rounded-3xl bg-[#E6E4BB] text-[#373E11] lg:text-2xl
            md:text-xl max-sm:text-[11px] flex flex-row-reverse items-center justify-center mx-4 md:mx-8 lg:mx-16 mb-8 
            max-sm:mt-[-72] md:mt-[-80] md:mb-12 lg:mt-[-180] lg:mb-36 transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
          >
            <span className="flex flex-row-reverse items-center">
              บันทึกและติดตามการเติบโตต้นไม้ของคุณ
              <ArrowLeft color="#373E11" className="mr-5 max-md:mr-3 max-sm:mr-2 max-sm:w-4"/>
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
