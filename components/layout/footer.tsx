import Link from "next/link";
import Image from "next/image";
import { Mail, MessageCircle, Phone } from "lucide-react";

const links = [
  { href: "/audit-ia", label: "Audit IA" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-zinc-950/80">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Image src="/images/logo.png" alt="Logo CorsaiManager" className="h-10 w-auto" width={155} height={44} />
          <p className="mt-4 text-sm leading-relaxed text-zinc-300">CorsaiManager</p>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-zinc-400">Automatisation IA pour PME</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">Liens utiles</h3>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-zinc-400">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-cyan-200">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">Contact</h3>
          <div className="mt-4 space-y-3 text-sm text-zinc-400">
            <p className="flex items-center gap-2"><Mail size={16} /> contact@corsaimanager.com</p>
            <p className="flex items-center gap-2"><Phone size={16} /> +33 6 65 01 87 30</p>
            <a
              href="https://wa.me/33665018730?text=Bonjour%2C%20je%20souhaite%20%C3%A9changer%20au%20sujet%20d%E2%80%99un%20audit%20IA%20pour%20mon%20entreprise."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-cyan-200"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} CorsaiManager. Tous droits réservés.
      </div>
    </footer>
  );
}
