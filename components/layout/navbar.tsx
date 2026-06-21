"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/agence-ia-france", label: "Agence IA" },
  { href: "/services", label: "Services" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/audit-ia", label: "Audit IA" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex h-24 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center py-1"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/images/logo.png"
            alt="Logo CorsaiManager"
            className="h-[4.5rem] w-auto object-contain sm:h-[5rem] lg:h-[6rem]"
            width={500}
            height={140}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm text-zinc-300 transition hover:text-cyan-300",
                pathname === link.href && "text-cyan-300"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/audit-ia"
            className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-5 py-2.5 text-sm font-medium text-cyan-200 transition hover:border-cyan-200/60 hover:bg-cyan-300/20"
          >
            Audit IA Gratuit
          </Link>
        </div>

        <button
          aria-label="Ouvrir le menu"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-md border border-white/10 p-2 text-zinc-200 md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-zinc-950/95 px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-cyan-300",
                  pathname === link.href && "bg-white/5 text-cyan-300"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/audit-ia"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-center text-sm font-medium text-cyan-200"
            >
              Audit IA Gratuit
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
