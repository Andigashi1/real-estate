"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, MenuIcon, X } from "lucide-react";
import Talkbtn from "../Talkbtn";

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  //close menu on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  return (
    <div className="py-6 px-8 lg:px-12 font-bold shrink-0 absolute w-full bg-background">
      <div className="relative flex items-center justify-between gap-10">
        <ul className="gap-10 hidden lg:flex uppercase">
          <Link href='/'>Home</Link>
          <Link href='/projects'>Projects</Link>
          <Link href='/contact'>Contact</Link>
        </ul>
        <h1 className={`${menuOpen ? 'text-white' : null} z-50 text-2xl lg:text-3xl lg:absolute left-1/2 lg:-translate-x-1/2 leading-7 text-center`}>
          Dubai By <br /> Flamur
        </h1>
        <div className="lg:hidden flex items-center justify-center">
          {menuOpen ? (
            <X
              size={32}
              onClick={() => setMenuOpen(false)}
              className="cursor-pointer z-50 text-white"
            />
          ) : (
            <MenuIcon
              size={32}
              onClick={() => setMenuOpen(true)}
              className="cursor-pointer"
            />
          )}
        </div>
        <div className="hidden lg:flex gap-6 items-center">
          <Instagram />
          <Facebook />
          <Linkedin />
          <Talkbtn/>
        </div>
        {menuOpen && (
          <div className="inset-0 text-center bg-black/75 fixed top-0 left-0 w-full h-full z-40 flex flex-col items-center justify-center">
            <ul className="flex flex-col gap-10 text-2xl uppercase text-white mb-8">
              <Link href='/' onClick={() => setMenuOpen(false)}>Home</Link>
              <Link href='/projects' onClick={() => setMenuOpen(false)}>Projects</Link>
              <Link href='/contact' onClick={() => setMenuOpen(false)}>Contact</Link>
            </ul>
            <div className="flex gap-6 mb-8">
              <Instagram color="white" />
              <Facebook color="white" />
              <Linkedin color="white" />
            </div>
            <button className="px-4 py-2 bg-button border-3 border-button hover:bg-background hover:text-button text-background font-bold uppercase cursor-pointer">
              Let's talk
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Nav;

{
  /* <ul className="gap-10 []">
  <li>Home</li>
  <li>Projects</li>
  <li>Contact</li>
</ul>

<h1 className="absolute left-1/2 -translate-x-1/2 text-3xl leading-7 text-center">Dubai By <br/> Flamur</h1>

<div className="gap-6">
  <Instagram />
  <Facebook />
  <Linkedin />
  <button className="ml-32 px-4 py-2 bg-button border-3 border-button hover:bg-background hover:text-button text-background font-bold uppercase cursor-pointer">
    Let's talk
  </button>
</div> */
}
