export default function PreorderPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pb-20 pt-8" dir="ltr">
      <div className="text-center mb-8">
        <div className="font-english text-xs font-semibold mb-2 tracking-widest uppercase" style={{color:'rgba(201,168,76,0.7)'}}>
          Forthcoming
        </div>
        <div className="font-arabic text-gold text-xl mb-1" dir="rtl">الطبعة الثنائية اللغة</div>
        <h1 className="font-english text-white text-2xl font-semibold mt-1 mb-2">
          Bilingual Print Edition
        </h1>
        <p className="font-english text-sm" style={{color:'rgba(255,255,255,0.45)'}}>
          <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em> · Arabic text with English translation
        </p>
      </div>

      <div className="border border-gold/30 rounded-2xl p-6 mb-6" style={{background:'rgba(201,168,76,0.05)'}}>
        <h2 className="font-english text-white font-semibold text-base mb-3">About the Edition</h2>
        <p className="font-english text-sm leading-7" style={{color:'rgba(255,255,255,0.65)'}}>
          The complete bilingual print edition presents the full Arabic text of 
          <em> Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em> facing the first complete English 
          translation, prepared by Amadu Kunateh. The edition is organised according to the 
          seven manzils practised by Shaykh Ibrāhīm Niasse and includes a scholarly 
          introduction, critical apparatus, and annotations.
        </p>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between border-b border-white/8 pb-2">
            <span className="font-english text-xs" style={{color:'rgba(255,255,255,0.4)'}}>Structure</span>
            <span className="font-english text-xs" style={{color:'rgba(255,255,255,0.7)'}}>7 volumes (one per manzil)</span>
          </div>
          <div className="flex justify-between border-b border-white/8 pb-2">
            <span className="font-english text-xs" style={{color:'rgba(255,255,255,0.4)'}}>Languages</span>
            <span className="font-english text-xs" style={{color:'rgba(255,255,255,0.7)'}}>Arabic (Warsh rasm) · English</span>
          </div>
          <div className="flex justify-between border-b border-white/8 pb-2">
            <span className="font-english text-xs" style={{color:'rgba(255,255,255,0.4)'}}>Translator</span>
            <span className="font-english text-xs" style={{color:'rgba(255,255,255,0.7)'}}>Amadu Kunateh</span>
          </div>
          <div className="flex justify-between">
            <span className="font-english text-xs" style={{color:'rgba(255,255,255,0.4)'}}>Publisher</span>
            <span className="font-english text-xs" style={{color:'rgba(255,255,255,0.7)'}}>Under review with academic publisher</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="font-english text-white font-semibold text-base mb-1">Register Your Interest</h2>
        <p className="font-english text-sm mb-4" style={{color:'rgba(255,255,255,0.4)'}}>
          No payment required. Register to be notified when the edition is available for 
          purchase and to receive updates on the publication timeline.
        </p>
      </div>

      <form
        action="https://formspree.io/f/xvgakgpl"
        method="POST"
        className="space-y-4"
      >
        <input type="hidden" name="_subject" value="Bilingual Edition Pre-Order Interest — niassetafsir.org" />
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
              style={{color:'inherit'}} placeholder="University, library, etc." />
          </div>
          <div>
            <label className="font-english text-xs text-gold/60 block mb-1">Country</label>
            <input type="text" name="country"
              className="w-full border border-white/15 rounded-lg px-3 py-2.5 font-english text-sm bg-white/5 outline-none focus:border-gold/40"
              style={{color:'inherit'}} placeholder="Your country" />
          </div>
        </div>
        <div>
          <label className="font-english text-xs text-gold/60 block mb-1">I am registering as *</label>
          <select name="registrant_type" required
            className="w-full border border-white/15 rounded-lg px-3 py-2.5 font-english text-sm bg-white/5 outline-none focus:border-gold/40"
            style={{color:'inherit'}}>
            <option value="">Select</option>
            <option value="individual">Individual scholar / researcher</option>
            <option value="library">Library / institution</option>
            <option value="student">Graduate student</option>
            <option value="community">Tijānī community / zawiya</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="font-english text-xs text-gold/60 block mb-1">Estimated copies needed</label>
          <select name="quantity"
            className="w-full border border-white/15 rounded-lg px-3 py-2.5 font-english text-sm bg-white/5 outline-none focus:border-gold/40"
            style={{color:'inherit'}}>
            <option value="">Select</option>
            <option value="1">1 copy</option>
            <option value="2-5">2–5 copies</option>
            <option value="6-10">6–10 copies</option>
            <option value="10+">10 or more copies</option>
          </select>
        </div>
        <button type="submit"
          className="w-full font-english font-semibold text-sm py-3 rounded-xl transition-all border border-gold/50 hover:border-gold"
          style={{color:'#C9A84C', background:'rgba(201,168,76,0.08)'}}>
          Register Interest
        </button>
        <p className="font-english text-xs text-center" style={{color:'rgba(255,255,255,0.25)'}}>
          No payment required. You will be notified by email when the edition is available.
        </p>
      </form>
    </main>
  );
}
