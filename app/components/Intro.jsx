import muli from "@/public/flamur.png";
import Image from "next/image";
import Talkbtn from "./Talkbtn";

const Intro = () => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-end lg:justify-center gap-24 mx-8 h-screen max-h-[824px]">
      <Image src={muli} alt="Photo of Flamur Ramaj" width={200} height={400} className="lg:self-end w-[30vh] max-w-[250px]" />
      <div className="max-lg:bg-white max-lg:absolute top-[55%] p-6 space-y-4 max-w-2xl mx-8 max-lg:text-center">
        <h1 className="text-2xl lg:text-4xl font-bold max-lg:text-center uppercase">Find Your Ideal Real Estate</h1>
        <p className="mb-8">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam
          perspiciatis nisi reprehenderit eveniet sint incidunt optio corrupti
          natus, totam veritatis quod consequatur tempore ad vel ratione
          molestiae maxime eaque similique.
        </p>
        <Talkbtn/>
      </div>
    </div>
  )
}

export default Intro