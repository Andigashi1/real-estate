import muli from "@/public/flamur.png";
import Image from "next/image";
import Talkbtn from "./Talkbtn";

import { Parisienne } from "next/font/google";
const parisienne = Parisienne({ subsets: ["latin"], weight: "400" });
const Intro = () => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-end lg:justify-center gap-24 mx-8 h-screen max-h-[824px]">
      <Image
        src={muli}
        alt="Photo of Flamur Ramaj"
        width={200}
        height={400}
        className="lg:self-end w-[30vh] max-w-[250px]"
      />
      <div className="max-lg:bg-white max-lg:absolute top-[55%] p-6 space-y-4 mx-8 max-lg:text-center">
        <h1
          className={`text-4xl lg:text-5xl font-black max-lg:text-center ${parisienne.className}`}
        >
          Shtëpia jote e ëndrrave të pret në Dubai
        </h1>
        <p className="mb-8 max-w-2xl text-text">
          Zbuloni mundësitë më të mira për investime dhe jetesë në zemër të
          Dubait. Ne ju ndihmojmë të gjeni pronën ideale — qoftë për të banuar,
          për pushime apo për investime afatgjata.
        </p>

        <Talkbtn />
      </div>
    </div>
  );
};

export default Intro;
