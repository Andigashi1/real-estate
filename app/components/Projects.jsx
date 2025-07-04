import { TrendingUp, Building2, MapPin } from "lucide-react";
import Link from "next/link";

const Projects = () => {
  const stats = [
    {
      icon: <TrendingUp className="w-6 h-6 mx-auto" />,
      label: "Projects",
      value: "152",
    },
    {
      icon: <Building2 className="w-6 h-6 mx-auto" />,
      label: "Companies",
      value: "34",
    },
    {
      icon: <MapPin className="w-6 h-6 mx-auto" />,
      label: "Locations",
      value: "21",
    },
    {
      icon: <MapPin className="w-6 h-6 mx-auto" />,
      label: "Locations",
      value: "21",
    },
  ];
  return (
    <div className="bg-white py-22 space-y-8 text-center px-8">
      <h1 className="font-bold text-4xl uppercase">
        Sneak peek of my projects
      </h1>

      <div className="flex justify-center">
        <div className="grid grid-cols-2 md:grid-cols-4 place-items-center gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-background text-center space-y-2 pt-8 max-sm:w-36 max-sm:h-36 w-46 h-46"
            >
              {stat.icon}
              <h2 className="text-xl font-semibold">{stat.label}</h2>
              <p className="text-3xl">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-background w-64 h-80"></div>
          <div className="bg-background w-64 h-80"></div>
          <div className="bg-background w-64 h-80"></div>
          <div className="bg-background w-64 h-80"></div>
        </div>
      </div>
      <Link href="/projects" passHref>
        <p
          className="px-4 py-2 bg-button border-3 border-button hover:bg-transparent hover:text-button text-background font-bold uppercase cursor-pointer max-w-[15rem] mx-auto"
        >
          Go To Projects
        </p>
      </Link>
    </div>
  );
};

export default Projects;
