"use client";

export function Footer() {
  return (
    <footer className="bg-[#020f08] pb-8 pt-6 text-center text-[0.85rem] text-white/50">
      <div className="mx-auto max-w-[1100px] px-4">
        <div className="mb-5 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
        <small>
          © {new Date().getFullYear()} Terra Indomita. Tous droits réservés.
        </small>
      </div>
    </footer>
  );
}
