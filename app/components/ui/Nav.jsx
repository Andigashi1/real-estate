"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Facebook, Instagram, MenuIcon, X } from "lucide-react";
import Talkbtn from "../Talkbtn";
import Tiktok from "@/public/tiktok.png";
import { usePathname } from "next/navigation";
import Image from "next/image";

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const linkClasses = (href) =>
    pathname === href ? "text-button" : "hover:border-foreground";

  useEffect(() => {
    if (menuOpen) {
      // Disable scroll
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable scroll
      document.body.style.overflow = "";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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
        <ul className="gap-10 hidden lg:flex uppercase [&>*]:border-b-2 [&>*]:border-transparent">
          <Link href="/" className={linkClasses("/")}>
            Home
          </Link>
          <Link href="/projects" className={linkClasses("/projects")}>
            Projektet
          </Link>
          <Link href="/contact" className={linkClasses("/contact")}>
            Kontaktet
          </Link>
        </ul>
        <h1
          className={`${
            menuOpen ? "text-white" : null
          } z-50 text-2xl lg:text-3xl lg:absolute left-1/2 lg:-translate-x-1/2 leading-7 text-center`}
        >
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
          <a
            href="https://www.instagram.com/dubaibyflamur/"
            aria-label="instagram"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram />
          </a>
          <a
            href="https://www.facebook.com/dubaibyflamur/"
            aria-label="facebook"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Facebook />
          </a>
          <a
            href="https://www.tiktok.com/@dubaibyflamur/"
            aria-label="tiktok"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={Tiktok}
              alt="tiktok"
              width={32}
              height={32}
              className="w-6 h-6"
            />
          </a>
          <Talkbtn />
        </div>
        {menuOpen && (
          <div className="inset-0 text-center bg-black/75 fixed top-0 left-0 w-full h-full z-40 flex flex-col items-center justify-center">
            <ul className="flex flex-col gap-10 text-2xl uppercase text-white mb-8">
              <Link href="/" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link href="/projects" onClick={() => setMenuOpen(false)}>
                Projektet
              </Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)}>
                Kontaktet
              </Link>
            </ul>
            <div className="flex gap-6 mb-8">
              <a
                href="https://www.instagram.com/dubaibyflamur/"
                aria-label="instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram color="white" />
              </a>
              <a
                href="https://www.facebook.com/dubaibyflamur/"
                aria-label="facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook color="white" />
              </a>
              <a
                href="https://www.linkedin.com/dubaibyflamur/"
                aria-label="linkedin"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin color="white" />
              </a>
            </div>
            <button className="px-4 py-2 bg-button border-3 border-button hover:bg-background hover:text-button text-background font-bold uppercase cursor-pointer">
              Me kontakto
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
