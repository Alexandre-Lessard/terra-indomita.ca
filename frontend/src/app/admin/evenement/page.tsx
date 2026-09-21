import { Suspense } from "react";
import { EventEditor } from "@/components/admin/event-editor";

export default function AdminEventPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#6b6b6b]">Chargement…</p>}>
      <EventEditor />
    </Suspense>
  );
}
