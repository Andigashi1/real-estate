"use client";

import { TrendingUp, Building2, MapPin, DollarSign } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Projects = () => {
  const containerRef = useRef(null);
  const [stats, setStats] = useState([
    {
      icon: <TrendingUp className="w-6 h-6 mx-auto" />,
      label: "Projekte",
      value: "...",
    },
    {
      icon: <Building2 className="w-6 h-6 mx-auto" />,
      label: "Kompani",
      value: "...",
    },
    {
      icon: <MapPin className="w-6 h-6 mx-auto" />,
      label: "Lokacione",
      value: "...",
    },
    {
      icon: <DollarSign className="w-6 h-6 mx-auto" />,
      label: "Cmime",
      value: "...",
    },
  ]);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.fromTo(
      containerRef.current.children,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          once: true, // Trigger the animation only once
        },
      }
    );
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        const data = await response.json();

        setStats([
          {
            icon: <TrendingUp className="w-6 h-6 mx-auto" />,
            label: "Projekte",
            value: data.projectCount?.toString() || "0",
          },
          {
            icon: <Building2 className="w-6 h-6 mx-auto" />,
            label: "Kompani",
            value: data.companyCount?.toString() || "0",
          },
          {
            icon: <MapPin className="w-6 h-6 mx-auto" />,
            label: "Lokacione",
            value: data.locationCount?.toString() || "0",
          },
          {
            icon: <DollarSign className="w-6 h-6 mx-auto" />,
            label: "Cmime",
            value: data.priceRange || "N/A",
          },
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="bg-foreground py-22 space-y-8 text-center px-8 max-md:h-screen">
      <h1 className="font-bold text-background text-4xl uppercase">
        Një Pasqyrë e Shkurtër e Projekteve
      </h1>

      <div className="flex justify-center">
        <div
          ref={containerRef}
          className="grid grid-cols-2 md:grid-cols-4 place-items-center gap-6"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-background text-center space-y-2 p-4 lg:py-8 max-sm:w-36 max-sm:h-36 w-46 h-46"
            >
              {stat.icon}
              <h2 className="text-xl font-semibold">{stat.label}</h2>
              <p className="lg:text-2xl">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <Link href="/projects" passHref>
        <p className="px-4 py-2 bg-button border-3 border-button hover:bg-transparent hover:text-button text-background font-bold uppercase cursor-pointer max-w-[15rem] mx-auto">
          Shiko Projektet
        </p>
      </Link>
    </div>
  );
};

export default Projects;
