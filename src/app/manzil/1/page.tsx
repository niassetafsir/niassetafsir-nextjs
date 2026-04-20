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
        <h1 className="font-arabic text-gold text-3xl font-bold mb-1" dir="rtl">المنزل الأول</h1>
        <p className="font-english text-white/55 text-base mt-1">First Manzil · Day One</p>
        <p className="font-english text-white/30 text-sm mt-1">Al-Fātiḥa → Al-Nisāʾ (Suras 1–4)</p>
        <p className="font-english text-white/20 text-xs mt-2 leading-5">Al-Fātiḥa · Al-Baqara · Āl ʿImrān · Al-Nisāʾ</p>
      </div>
      <div className="border border-gold/15 rounded-xl overflow-hidden">
      <a href="/lesson/1" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">1</div>
        <div dir="rtl" className="flex-1">
          <div className="font-english text-white/40 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson One</div>
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الأول</div>
          <div className="font-arabic text-white/35 text-sm">Al-Fātiḥa</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Al-Istiʿādha, Basmala, and Sūrat al-Fātiḥa</div>
        </div>
        {true && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/2" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">2</div>
        <div dir="rtl" className="flex-1">
          <div className="font-english text-white/40 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson Two</div>
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الثاني</div>
          <div className="font-arabic text-white/35 text-sm">Al-Baqara</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Baqara · Q. 2:6–25</div>
        </div>
        {true && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/3" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">3</div>
        <div dir="rtl" className="flex-1">
          <div className="font-english text-white/40 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson Three</div>
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الثالث</div>
          <div className="font-arabic text-white/35 text-sm">Al-Baqara</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Baqara · Q. 2:26–59</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/4" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">4</div>
        <div dir="rtl" className="flex-1">
          <div className="font-english text-white/40 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson Four</div>
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الرابع</div>
          <div className="font-arabic text-white/35 text-sm">Al-Baqara</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Baqara · Q. 2:60–105</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/5" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">5</div>
        <div dir="rtl" className="flex-1">
          <div className="font-english text-white/40 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson Five</div>
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الخامس</div>
          <div className="font-arabic text-white/35 text-sm">Al-Baqara</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Baqara · Q. 2:106–202</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/6" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">6</div>
        <div dir="rtl" className="flex-1">
          <div className="font-english text-white/40 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson Six</div>
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس السادس</div>
          <div className="font-arabic text-white/35 text-sm">Al-Baqara</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Baqara · Q. 2:203–252</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/7" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">7</div>
        <div dir="rtl" className="flex-1">
          <div className="font-english text-white/40 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson Seven</div>
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس السابع</div>
          <div className="font-arabic text-white/35 text-sm">Al-Baqara</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Baqara / Āl ʿImrān · Q. 2:253–3:14</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/8" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">8</div>
        <div dir="rtl" className="flex-1">
          <div className="font-english text-white/40 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson Eight</div>
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الثامن</div>
          <div className="font-arabic text-white/35 text-sm">Āl ʿImrān</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat Āl ʿImrān · Q. 3:15–91</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/9" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">9</div>
        <div dir="rtl" className="flex-1">
          <div className="font-english text-white/40 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson Nine</div>
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس التاسع</div>
          <div className="font-arabic text-white/35 text-sm">Āl ʿImrān</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat Āl ʿImrān · Q. 3:92–175</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/10" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">10</div>
        <div dir="rtl" className="flex-1">
          <div className="font-english text-white/40 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson Ten</div>
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس العاشر</div>
          <div className="font-arabic text-white/35 text-sm">Āl ʿImrān</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat Āl ʿImrān / al-Nisāʾ · Q. 3:176–4:23</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/11" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">11</div>
        <div dir="rtl" className="flex-1">
          <div className="font-english text-white/40 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson Eleven</div>
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الحادي عشر</div>
          <div className="font-arabic text-white/35 text-sm">Al-Nisāʾ</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Nisāʾ · Q. 4:24–86</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/12" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">12</div>
        <div dir="rtl" className="flex-1">
          <div className="font-english text-white/40 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson Twelve</div>
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الثاني عشر</div>
          <div className="font-arabic text-white/35 text-sm">Al-Nisāʾ</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Nisāʾ · Q. 4:87–147</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/13" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">13</div>
        <div dir="rtl" className="flex-1">
          <div className="font-english text-white/40 text-[10px] uppercase tracking-wide mb-0.5" dir="ltr">Lesson Thirteen</div>
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الثالث عشر</div>
          <div className="font-arabic text-white/35 text-sm">Al-Nisāʾ</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Nisāʾ · Q. 4:148–5:22</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      </div>
    </main>
  );
}
