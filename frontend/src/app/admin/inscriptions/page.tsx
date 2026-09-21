import { Suspense } from "react";
import { RegistrationsList } from "@/components/admin/registrations-list";

export default function AdminRegistrationsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#6b6b6b]">Chargement…</p>}>
      <RegistrationsList />
    </Suspense>
  );
}
