import Image from "next/image";

export default function Home() {
  return (
    <div>
      <main>
        <div className="flex justify-between">
          <h1 className="text-3xl font-extrabold ml-12 mt-20">LET US HELP YOU <br/> TAKE CARE <br/> YOUR PLANT</h1>
          <div>
            <button 
              className=
                "flex justify-center absolute items-center border bg-[#373E11] text-[#E6E4BB] w-xs h-10 rounded-4xl hover:bg-[#E6E4BB] hover:text-[#373E11] transition delay-300">
              สร้างแจ้งเตือนการรดน้ำ หรือ ใส่ปุ๋ย
              <Image
                className="float-right ml-10"
                src="/arrow right.svg"
                alt="arrow"
                width={15}
                height={38}
              />
            </button>
            </div>
          <Image
            className="mr-12 mt-10"
            src="/function1.svg"
            alt="function1 logo"
            width={450}
            height={38}
          />
        </div>

        
        
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        
      </footer>
    </div>
  );
}
