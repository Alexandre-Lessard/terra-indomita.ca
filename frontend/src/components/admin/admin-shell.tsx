"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .me()
      .then((me) => setEmail(me.email))
      .catch(() => setEmail(null));
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#142012]">
      <header className="bg-brand-dark text-brand-light">
        <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/admin/" className="text-lg font-semibold tracking-wide">
            Terra Indomita — administration
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-brand-light/80">
            {email && <span>{email}</span>}
            <Link href="/" className="underline hover:text-brand-light">
              Voir le site
            </Link>
            <a href="/cdn-cgi/access/logout" className="underline hover:text-brand-light">
              Se déconnecter
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1000px] px-4 py-8">{children}</main>
    </div>
  );
}
