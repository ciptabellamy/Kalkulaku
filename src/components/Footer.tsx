export default function Footer() {
  return (
    <footer className="relative border-t border-slate-200/80 bg-white/70 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-semibold text-slate-700">Kalkulaku</p>
          <p className="mt-1 max-w-md text-xs leading-5">
            Simulasi bersifat estimasi, bukan penawaran maupun nasihat keuangan. Hubungi lembaga pembiayaan untuk angka resmi.
          </p>
        </div>
        <nav aria-label="Tautan footer" className="flex flex-wrap gap-x-6 gap-y-2 font-medium">
          <a href="/tentang.html" className="transition-colors hover:text-sky-600">Tentang</a>
          <a href="/privasi.html" className="transition-colors hover:text-sky-600">Kebijakan Privasi</a>
          <a href="/tentang.html#kontak" className="transition-colors hover:text-sky-600">Kontak</a>
        </nav>
      </div>
      <p className="pb-6 text-center text-[11px] text-slate-400">© {new Date().getFullYear()} Kalkulaku</p>
    </footer>
  );
}
