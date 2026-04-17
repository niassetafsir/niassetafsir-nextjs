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
    <div className="border border-gold/15 rounded-xl p-4 bg-gold/3 text-center" dir="ltr">
      <p className="font-english text-white/55 text-xs leading-5 mb-3 max-w-md mx-auto">
        The complete ten-volume Arabic edition of <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em>, bilingual, comparative, and freely accessible. Subscribe to receive updates as new translations and content are added.
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
            className="flex-1 bg-white border border-gold/25 rounded-lg px-3 py-1.5 font-english text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:border-gold/50"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="font-english text-xs text-bg bg-gold hover:bg-gold-light px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-50 flex-shrink-0"
          >
            {status === 'loading' ? '...' : 'Subscribe'}
          </button>
        </form>
      )}
      <p className="font-english text-white/20 text-[10px] mt-2">
        No spam. Updates only when new content is published.
      </p>
    </div>
  );
}
