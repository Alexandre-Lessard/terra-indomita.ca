import { FAQ_ITEMS } from "@/lib/faq";

export function Faq() {
  return (
    <section className="bg-[#fcf9f3] py-20" id="questions">
      <div className="mx-auto max-w-[760px] px-4">
        <p className="mb-10 text-center text-xl font-semibold uppercase tracking-[0.2em] text-[#1c3120]">
          Questions fréquentes
        </p>
        <dl className="divide-y divide-[rgba(20,32,18,0.12)]">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question} className="py-5">
              <dt className="text-lg font-semibold text-[#0e2514]">{item.question}</dt>
              <dd className="mt-2 text-[1.05rem] leading-relaxed text-[rgba(14,37,20,0.8)]">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
