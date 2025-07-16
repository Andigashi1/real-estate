import { Facebook, Instagram, Mail, Music2 } from "lucide-react";
import { Parisienne } from "next/font/google";

const socials = [
  { icon: <Instagram size={32} />, label: "Instagram", text: "dubaibyflamur", href: "https://www.instagram.com/dubaibyflamur/" },
  { icon: <Facebook size={32} />, label: "Facebook", text: "facebook", href: "https://www.facebook.com/dubaibyflamur/" },
  { icon: <Music2 size={32} />, label: "Tiktok", text: "Tiktok", href: "https://www.tiktok.com/@dubaibyflamur/" },
  { icon: <Mail size={32} />, label: "Email", text: "mail", href: "#" },
];

const parisienne = Parisienne({ subsets: ["latin"], weight: "400" });

const Page = () => {
  return (
    <div className="pt-36 flex flex-col items-center gap-12 text-center px-4">
      <div className="space-y-2">
        <h1 className={`text-2xl md:text-4xl font-bold ${parisienne.className}`}>
          Një mesazh larg shtëpisë në Dubai
        </h1>
        <p>Kliko ikonat për t’i hapur</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl md:text-2xl font-bold uppercase">
          Social Media
        </h2>

        <div className="flex flex-wrap justify-center gap-6">
          {socials.map(({ icon, text, label, href }, i) => (
            <a
              key={i}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noopener noreferrer"
              className="w-32 h-32 flex flex-col items-center justify-center rounded-xl border-3 border-transparent hover:border-foreground bg-neutral-100 hover:bg-neutral-200 transition-all shadow-sm"
            >
              {icon}
              <p className="mt-2 text-sm font-medium text-neutral-700">{text}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
