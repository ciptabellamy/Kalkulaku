import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/faq";

export default function FaqSection() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7"
    >
      <h2 id="faq-heading" className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
        Pertanyaan yang sering ditanyakan
      </h2>
      <p className="mt-1 text-sm text-slate-500">Penjelasan singkat tentang bunga, cicilan, KPR, dan refinancing.</p>

      <div className="mt-5 divide-y divide-slate-100">
        {FAQ_ITEMS.map((item) => (
          <details key={item.question} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold text-slate-800 sm:text-base [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
