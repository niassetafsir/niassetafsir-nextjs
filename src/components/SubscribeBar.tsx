'use client';
import { useState } from 'react';

export default function SubscribeBar() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    
    // Use Formspree for simple email collection
    try {
      const res = await fetch('https://formspree.io/f/xeevaerk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, _subject: 'New subscriber — niassetafsir.com' }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        // Fallback: open mailto
        window.location.href = `mailto:niassetafsirproject@gmail.com?subject=Subscribe&body=Please add me to the updates list: ${email}`;
        setStatus('success');
      }
    } catch {
      window.location.href = `mailto:niassetafsirproject@gmail.com?subject=Subscribe&body=Please add me to the updates list: ${email}`;
      setStatus('success');
    }
  };

  return (
    <div className="border border-gold/20 rounded-xl p-6 bg-gold/3 text-center" dir="ltr">
      <div className="font-arabic text-gold text-base font-bold mb-2" dir="rtl">
        فِي رِيَاضِ تَفْسِيرِ الْقُرْآنِ الْكَرِيمِ
      </div>
      <p className="font-english text-white/70 text-sm leading-6 mb-4 max-w-lg mx-auto">
        A digital scholarly edition of Shaykh Ibrāhīm Niasse&apos;s <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em> — 
        bilingual, comparative, and freely accessible. Subscribe to receive updates when new translations, 
        audio, or content are added.
      </p>

      {status === 'success' ? (
        <p className="font-english text-gold/80 text-sm italic">
          Thank you — you&apos;ll receive updates at your email address.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="flex-1 bg-white border border-gold/30 rounded-lg px-3 py-2 font-english text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-gold/60"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="font-english text-sm text-bg bg-gold hover:bg-gold-light px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 flex-shrink-0"
          >
            {status === 'loading' ? '...' : 'Subscribe'}
          </button>
        </form>
      )}
      <p className="font-english text-white/25 text-xs mt-3">
        No spam. Updates only when new content is published.
      </p>
    </div>
  );
}
