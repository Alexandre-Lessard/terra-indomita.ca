"use client";

export function Footer() {
  return (
    <footer className="bg-brand-dark-edge py-6 text-center text-sm text-brand-light/60">
      <div className="mx-auto max-w-[1100px] px-4">
        <small>
          © {new Date().getFullYear()} Terra Indomita. Tous droits réservés.
        </small>
      </div>
    </footer>
  );
}
