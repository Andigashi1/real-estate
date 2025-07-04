import Intro from "./components/Intro";
import Projects from "./components/Projects";

const page = () => {
  return (
    <div className="flex flex-col">
      <Intro />
      <Projects/>
    </div>
  );
};

export default page;
