import Link from "next/link";

const links = [
  { href: "/crm", label: "Prospects" },
  { href: "/crm/new", label: "Ajouter" },
  { href: "/crm/prospection", label: "Prospection" },
  { href: "/crm/dashboard", label: "Dashboard" },
];

export function CrmNav() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/70">CRM CorsaiManager</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">Prospection commerciale</h1>
      </div>
      <nav className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:border-cyan-300/50 hover:text-cyan-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

