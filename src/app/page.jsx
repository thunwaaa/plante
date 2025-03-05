"use client"
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <main>
        <div>
            <div className="flex justify-between">
              <h1 className="text-4xl font-extrabold ml-22 mt-32">LET US HELP YOU <br/> TAKE CARE <br/> YOUR PLANT</h1>
              <Image
                className="mr-22 mt-10"
                src="/function1.svg"
                alt="function1 logo"
                width={550}
                height={38}
              />
            </div>
            <button className="flex justify-center mx-22 my-[-148px] text-xl p-4
                          bg-[#373E11] text-[#E6E4BB]  h-14 rounded-4xl 
                          transition delay-150 duration-300 ease-in-out 
                          hover:-translate-y-1 hover:scale-125
            ">
                สร้างแจ้งเตือนการรดน้ำ หรือ ใส่ปุ๋ย
                <Image
                  className="ml-8 mt-1"
                  src="/arrow right.svg"
                  alt="arrow"
                  width={20}
                  height={38}
                />
            </button>
        </div>
        <div className="bg-[#373E11] mt-80 h-8/12">
            <div className="flex justify-between">
              <Image
                className="ml-22 mt-8"
                src="/function2.svg"
                alt="function1 logo"
                width={400}
                height={38}
              />
              <h1 className="text-4xl text-[#E6E4BB] text-right font-extrabold mx-22 mt-36">Find the Perfect Green <br/>  Companion for Your <br/> Environment! </h1>
            </div>
            <button className="flex justify-center mx-22 my-[-196px] text-xl p-4 place-self-end
                          text-[#373E11] bg-[#E6E4BB] h-14 rounded-4xl 
                          transition delay-150 duration-300 ease-in-out 
                          hover:-translate-y-1 hover:scale-125
            ">
                ชนิดพืชที่เหมาะสำหรับสภาพแวดล้อมของคุณ
                <Image
                  className="ml-8 mt-1"
                  src="/arrowleft.svg"
                  alt="arrow"
                  width={20}
                  height={38}
                />
            </button>
        </div>
        <div className="h-9/12">
            <div className="flex justify-between">
              <h1 className="text-4xl text-[#373E11] text-left font-extrabold mx-22 mt-56">Get Expert Care Tips <br /> for Your Plants </h1>
              <Image
                className="mx-22 mt-24"
                src="/function3.svg"
                alt="function3 logo"
                width={550}
                height={38}
              />
            </div>
            <button className="flex justify-center mx-22 my-[-164px] text-xl p-4
                          bg-[#373E11] text-[#E6E4BB] h-14 rounded-4xl 
                          transition delay-150 duration-300 ease-in-out 
                          hover:-translate-y-1 hover:scale-125
            ">
                วิเคราะห์อาการและหาทางแก้เบื้องต้นให้กับต้นไม้ของคุณ
                <Image
                  className="ml-8 mt-1 "
                  src="/arrow right.svg"
                  alt="arrow"
                  width={20}
                  height={38}
                />
            </button>
        </div>
        <div className="bg-[#373E11] h-4/6">
            <div className="flex justify-between">
              <Image
                className="mx-22"
                src="/function4.svg"
                alt="function4 logo"
                width={650}
                height={38}
              />
              <h1 className="text-4xl text-[#E6E4BB] text-right font-bold mx-22 mt-48">Track Your <br /> Plant’s Growth</h1>
            </div>
            <button className="flex justify-center mx-22 my-[-220px] text-xl p-4 place-self-end
                          text-[#373E11] bg-[#E6E4BB] h-14 rounded-4xl 
                          transition delay-150 duration-300 ease-in-out 
                          hover:-translate-y-1 hover:scale-125
            ">
                บันทึกและติดตามการเติบโตต้นไม้ของคุณ
                <Image
                  className="ml-8 mt-1 "
                  src="/arrowleft.svg"
                  alt="arrow"
                  width={20}
                  height={38}
                />
            </button>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        
      </footer>
    </div>
  );
}
