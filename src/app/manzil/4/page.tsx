import Link from 'next/link';

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12" dir="ltr">
      <div className="mb-4">
        <Link href="/" className="font-english text-xs text-white/35 hover:text-gold/60 transition-all">
          ← Back to Contents
        </Link>
      </div>
      <div className="text-center mb-8">
        <div className="font-arabic text-gold text-2xl font-bold mb-1" dir="rtl">المنزل الرابع</div>
        <h1 className="font-english text-white text-xl font-semibold">Fourth Manzil · Day Four</h1>
        <p className="font-english text-white/40 text-sm mt-1">Al-Isrāʾ → Al-Furqān · Suras 17–25</p>
      </div>
      <div className="border border-gold/15 rounded-2xl overflow-hidden">
        <a href="/lesson/31" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">31</div>
          <div className="flex-1">
            <div className="font-english text-white/45 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson Thirty-One</div>
            <div dir="rtl" className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الحادي والثلاثون</div>
            <div className="font-english text-white/55 text-sm italic">Sūrat al-Kahf · Q. 18:1–110</div>
          </div>
        </a>
        <a href="/lesson/32" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">32</div>
          <div className="flex-1">
            <div className="font-english text-white/45 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson Thirty-Two</div>
            <div dir="rtl" className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الثاني والثلاثون</div>
            <div className="font-english text-white/55 text-sm italic">Sūrat Maryam / Sūrat Ṭāhā · Q. 19:1–20:54</div>
          </div>
        </a>
        <a href="/lesson/33" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">33</div>
          <div className="flex-1">
            <div className="font-english text-white/45 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson Thirty-Three</div>
            <div dir="rtl" className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الثالث والثلاثون</div>
            <div className="font-english text-white/55 text-sm italic">Sūrat Ṭāhā / Sūrat al-Anbiyāʾ · Q. 20:55–21:63</div>
          </div>
        </a>
        <a href="/lesson/34" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">34</div>
          <div className="flex-1">
            <div className="font-english text-white/45 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson Thirty-Four</div>
            <div dir="rtl" className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الرابع والثلاثون</div>
            <div className="font-english text-white/55 text-sm italic">Sūrat al-Anbiyāʾ / Sūrat al-Ḥajj · Q. 21:64–22:78</div>
          </div>
        </a>
        <a href="/lesson/35" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">35</div>
          <div className="flex-1">
            <div className="font-english text-white/45 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson Thirty-Five</div>
            <div dir="rtl" className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الخامس والثلاثون</div>
            <div className="font-english text-white/55 text-sm italic">Sūrat al-Muʾminūn / Sūrat al-Nūr · Q. 23:1–24:52</div>
          </div>
        </a>
      </div>
    </main>
  );
}
