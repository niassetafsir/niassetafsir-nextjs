export default function OrderPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pb-20 pt-8" dir="ltr">
      <div className="text-center mb-8">
        <div className="font-arabic text-gold text-xl mb-1" dir="rtl">الطبعة العربية العشرة</div>
        <h1 className="font-english text-white text-2xl font-semibold mt-1 mb-2">
          Order the Arabic Edition
        </h1>
        <p className="font-english text-sm" style={{color:'rgba(255,255,255,0.45)'}}>
          10-Volume Revised Compiled Arabic Edition · <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em>
        </p>
      </div>

      {/* Book cover photo */}
      <div className="flex justify-center mb-8">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{maxWidth:'320px',border:'1px solid rgba(201,168,76,0.25)'}}>
          <img
            src="/images/book_cover_clean.jpg"
            alt="Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm — 10-volume Arabic edition"
            className="w-full object-cover"
            style={{display:'block'}}
          />
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3" style={{background:'linear-gradient(to top, rgba(0,0,0,0.75), transparent)'}}>
            <p className="font-arabic text-gold text-sm text-center" dir="rtl">الطبعة الثانية · مجمع اليمامة</p>
          </div>
        </div>
      </div>

      <div className="border border-gold/20 rounded-2xl p-6 mb-6" style={{background:'rgba(201,168,76,0.04)'}}>
        <h2 className="font-english text-white font-semibold text-base mb-3">About This Edition</h2>
        <p className="font-english text-sm leading-7" style={{color:'rgba(255,255,255,0.65)'}}>
          The revised ten-volume compiled edition of <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em> 
          by Shaykh Ibrāhīm Niasse (d. 1975), compiled by Muḥammad ibn Shaykh ʿAbd Allāh 
          al-Tijānī al-Ibrāhīmī. This recension incorporates an expanded critical apparatus, 
          additional annotated footnotes, and a text established from a broader consultation 
          of the original audio recordings.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="border border-white/10 rounded-lg p-3">
            <div className="font-english text-xs text-gold/60 mb-1">Volumes</div>
            <div className="font-english font-semibold" style={{color:'rgba(255,255,255,0.85)'}}>10 volumes</div>
          </div>
          <div className="border border-white/10 rounded-lg p-3">
            <div className="font-english text-xs text-gold/60 mb-1">Language</div>
            <div className="font-english font-semibold" style={{color:'rgba(255,255,255,0.85)'}}>Arabic</div>
          </div>
          <div className="border border-white/10 rounded-lg p-3">
            <div className="font-english text-xs text-gold/60 mb-1">Coverage</div>
            <div className="font-english font-semibold" style={{color:'rgba(255,255,255,0.85)'}}>Complete Qurʾān</div>
          </div>
          <div className="border border-white/10 rounded-lg p-3">
            <div className="font-english text-xs text-gold/60 mb-1">Shipping</div>
            <div className="font-english font-semibold" style={{color:'rgba(255,255,255,0.85)'}}>Worldwide</div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="font-english text-white font-semibold text-base mb-1">Place an Inquiry</h2>
        <p className="font-english text-sm mb-4" style={{color:'rgba(255,255,255,0.4)'}}>
          Submit your details. You will receive a response with pricing, shipping cost to your country, 
          and payment instructions within 3–5 business days.
        </p>
      </div>

      <form
        action="https://formspree.io/f/mqewbolo"
        method="POST"
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-english text-xs text-gold/60 block mb-1">Full Name *</label>
            <input type="text" name="name" required
              className="w-full border border-white/15 rounded-lg px-3 py-2.5 font-english text-sm bg-white/5 outline-none focus:border-gold/40"
              style={{color:'inherit'}} placeholder="Your name" />
          </div>
          <div>
            <label className="font-english text-xs text-gold/60 block mb-1">Email *</label>
            <input type="email" name="email" required
              className="w-full border border-white/15 rounded-lg px-3 py-2.5 font-english text-sm bg-white/5 outline-none focus:border-gold/40"
              style={{color:'inherit'}} placeholder="your@email.com" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-english text-xs text-gold/60 block mb-1">Institution / Affiliation</label>
            <input type="text" name="institution"
              className="w-full border border-white/15 rounded-lg px-3 py-2.5 font-english text-sm bg-white/5 outline-none focus:border-gold/40"
              style={{color:'inherit'}} placeholder="University, mosque, etc." />
          </div>
          <div>
            <label className="font-english text-xs text-gold/60 block mb-1">Country *</label>
            <input type="text" name="country" required
              className="w-full border border-white/15 rounded-lg px-3 py-2.5 font-english text-sm bg-white/5 outline-none focus:border-gold/40"
              style={{color:'inherit'}} placeholder="Shipping country" />
          </div>
        </div>
        <div>
          <label className="font-english text-xs text-gold/60 block mb-1">Number of Sets *</label>
          <select name="quantity" required
            className="w-full border border-white/15 rounded-lg px-3 py-2.5 font-english text-sm bg-white/5 outline-none focus:border-gold/40"
            style={{color:'inherit'}}>
            <option value="">Select quantity</option>
            <option value="1">1 set (10 volumes)</option>
            <option value="2">2 sets</option>
            <option value="3">3 sets</option>
            <option value="5+">5 or more sets</option>
          </select>
        </div>
        <div>
          <label className="font-english text-xs text-gold/60 block mb-1">Message (optional)</label>
          <textarea name="message" rows={3}
            className="w-full border border-white/15 rounded-lg px-3 py-2.5 font-english text-sm bg-white/5 outline-none focus:border-gold/40 resize-none"
            style={{color:'inherit'}} placeholder="Any additional information or questions" />
        </div>
        <input type="hidden" name="_subject" value="Arabic Edition Order Inquiry — niassetafsir.org" />
        <button type="submit"
          className="w-full font-english font-semibold text-sm py-3 rounded-xl transition-all"
          style={{background:'#C9A84C', color:'#0D1F0A'}}>
          Submit Inquiry
        </button>
        <p className="font-english text-xs text-center" style={{color:'rgba(255,255,255,0.25)'}}>
          You will receive a response to your email with pricing and payment details.
        </p>
      </form>
    </main>
  );
}
