import Link from 'next/link';

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12" dir="ltr">
      <div className="mb-4">
        <Link href="/" className="font-english text-xs text-white/35 hover:text-gold/60 transition-all">
          ← Contents
        </Link>
      </div>
      <div className="text-center py-6 mb-8 border-b border-gold/20">
        <h1 className="font-arabic text-gold text-3xl font-bold mb-1" dir="rtl">المنزل الثالث</h1>
        <p className="font-english text-white/55 text-base mt-1">Third Manzil · Day Three</p>
        <p className="font-english text-white/30 text-sm mt-1">Yūnus → Al-Naḥl (Suras 10–16)</p>
        <p className="font-english text-white/20 text-xs mt-2 leading-5">Yūnus · Hūd · Yūsuf · Al-Raʿd · Ibrāhīm · Al-Ḥijr · Al-Naḥl</p>
      </div>
      <div className="border border-gold/15 rounded-xl overflow-hidden">
      <a href="/lesson/24" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">24</div>
        <div dir="rtl" className="flex-1">
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الرابع والعشرون</div>
          <div className="font-arabic text-white/35 text-sm">Yūnus</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Aʿrāf · Q. 7:160–206-Four</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/25" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">25</div>
        <div dir="rtl" className="flex-1">
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الخامس والعشرون</div>
          <div className="font-arabic text-white/35 text-sm">Hūd</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Aʿrāf · Q. 7:160–206-Five</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/26" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">26</div>
        <div dir="rtl" className="flex-1">
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس السادس والعشرون</div>
          <div className="font-arabic text-white/35 text-sm">Hūd/Yūsuf</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Aʿrāf · Q. 7:160–206-Six</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/27" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">27</div>
        <div dir="rtl" className="flex-1">
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس السابع والعشرون</div>
          <div className="font-arabic text-white/35 text-sm">Yūsuf/Al-Raʿd</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Aʿrāf · Q. 7:160–206-Seven</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/28" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">28</div>
        <div dir="rtl" className="flex-1">
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الثامن والعشرون</div>
          <div className="font-arabic text-white/35 text-sm">Al-Raʿd</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Aʿrāf · Q. 7:160–206-Eight</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/29" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">29</div>
        <div dir="rtl" className="flex-1">
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس التاسع والعشرون</div>
          <div className="font-arabic text-white/35 text-sm">Al-Ḥijr</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Aʿrāf · Q. 7:160–206-Nine</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/30" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">30</div>
        <div dir="rtl" className="flex-1">
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الثلاثون</div>
          <div className="font-arabic text-white/35 text-sm">Al-Naḥl</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Naḥl / Al-Isrāʾ · Q. 16:90–17:111</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      </div>
    </main>
  );
}
