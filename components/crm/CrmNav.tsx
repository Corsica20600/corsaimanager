"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/crm", label: "Prospects" },
  { href: "/crm/new", label: "Ajouter" },
  { href: "/crm/prospection", label: "Prospection" },
  { href: "/crm/agent-review", label: "Agent review" },
  { href: "/crm/dashboard", label: "Dashboard" },
];

export function CrmNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/70">CRM CorsaiManager</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">Prospection commerciale</h1>
      </div>
      <nav className="flex flex-wrap gap-2">
        {links.map((link) => {
          const isActive = link.href === "/crm" ? pathname === "/crm" : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                isActive
                  ? "border-cyan-300/50 bg-cyan-300/15 text-cyan-100"
                  : "border-white/15 bg-white/5 text-zinc-200 hover:border-cyan-300/50 hover:text-cyan-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
