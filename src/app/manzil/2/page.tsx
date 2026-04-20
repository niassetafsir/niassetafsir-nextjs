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
        <h1 className="font-arabic text-gold text-3xl font-bold mb-1" dir="rtl">المنزل الثاني</h1>
        <p className="font-english text-white/55 text-base mt-1">Second Manzil · Day Two</p>
        <p className="font-english text-white/30 text-sm mt-1">Al-Māʾida → Al-Tawba (Suras 5–9)</p>
        <p className="font-english text-white/20 text-xs mt-2 leading-5">Al-Māʾida · Al-Anʿām · Al-Aʿrāf · Al-Anfāl · Al-Tawba</p>
      </div>
      <div className="border border-gold/15 rounded-xl overflow-hidden">
      <a href="/lesson/14" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">14</div>
        <div dir="rtl" className="flex-1">
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الرابع عشر</div>
          <div className="font-arabic text-white/35 text-sm">Al-Māʾida</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Baqara · Q. 2:60–105teen</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/15" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">15</div>
        <div dir="rtl" className="flex-1">
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الخامس عشر</div>
          <div className="font-arabic text-white/35 text-sm">Al-Māʾida</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Māʾida · Q. 5:82–6:35</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/16" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">16</div>
        <div dir="rtl" className="flex-1">
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس السادس عشر</div>
          <div className="font-arabic text-white/35 text-sm">Al-Māʾida</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Baqara · Q. 2:203–252teen</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/17" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">17</div>
        <div dir="rtl" className="flex-1">
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس السابع عشر</div>
          <div className="font-arabic text-white/35 text-sm">Al-Anʿām</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Baqara / Āl ʿImrān · Q. 2:253–3:14teen</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/18" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">18</div>
        <div dir="rtl" className="flex-1">
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الثامن عشر</div>
          <div className="font-arabic text-white/35 text-sm">Al-Aʿrāf</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat Āl ʿImrān · Q. 3:15–91een</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/19" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">19</div>
        <div dir="rtl" className="flex-1">
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس التاسع عشر</div>
          <div className="font-arabic text-white/35 text-sm">Al-Aʿrāf</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat Āl ʿImrān · Q. 3:92–175teen</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/20" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">20</div>
        <div dir="rtl" className="flex-1">
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس العشرون</div>
          <div className="font-arabic text-white/35 text-sm">Al-Aʿrāf</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Aʿrāf / al-Anfāl · Q. 7:171–8:40</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/21" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">21</div>
        <div dir="rtl" className="flex-1">
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الحادي والعشرون</div>
          <div className="font-arabic text-white/35 text-sm">Al-Anfāl</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Aʿrāf / al-Anfāl · Q. 7:171–8:40-One</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/22" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">22</div>
        <div dir="rtl" className="flex-1">
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الثاني والعشرون</div>
          <div className="font-arabic text-white/35 text-sm">Al-Tawba</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Aʿrāf / al-Anfāl · Q. 7:171–8:40-Two</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      <a href="/lesson/23" className="flex items-center gap-4 px-5 py-4 hover:bg-gold/5 transition-colors group border-b border-white/5 last:border-0 no-underline">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">23</div>
        <div dir="rtl" className="flex-1">
          <div className="font-arabic text-gold-light text-base font-bold group-hover:text-gold transition-colors">الدرس الثالث والعشرون</div>
          <div className="font-arabic text-white/35 text-sm">Al-Tawba</div>
        </div>
        <div dir="ltr" className="hidden sm:block flex-1">
          <div className="font-english text-white/55 text-sm italic">Sūrat al-Aʿrāf / al-Anfāl · Q. 7:171–8:40-Three</div>
        </div>
        {false && <span className="font-english text-xs text-gold/55 border border-gold/20 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>}
      </a>
      </div>
    </main>
  );
}
