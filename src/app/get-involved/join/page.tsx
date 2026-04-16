'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Page() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch('https://formspree.io/f/mnjlpwpy', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="max-w-xl mx-auto px-6 py-16" dir="ltr">
      <div className="mb-2">
        <Link href="/get-involved" className="font-english text-xs text-white/35 hover:text-gold/60 transition-all">
          ← Get Involved
        </Link>
      </div>

      <h1 className="font-english text-white text-3xl font-semibold mt-6 mb-1">Join the Team</h1>
      <p className="font-english text-white/45 text-base mb-8">Wolof & Hausa Transcription and Translation</p>
      <p className="font-english text-white/65 text-sm leading-relaxed mb-8">We are building the Wolof transcription and Hausa translation of Shaykh Ibrāhīm Niasse's tafsīr. If you have the relevant skills and a genuine interest in contributing to this tradition, we invite you to get in touch.</p>

      {status === 'success' ? (
        <div className="border border-gold/25 rounded-xl p-8 text-center bg-gold/5">
          <div className="text-2xl mb-3">✓</div>
          <p className="font-english text-white/80 text-base font-medium mb-1">Thank you</p>
          <p className="font-english text-white/40 text-sm">Your message has been received.</p>
          <Link href="/" className="inline-block mt-6 font-english text-xs text-gold/60 hover:text-gold border border-gold/20 hover:border-gold/40 px-4 py-2 rounded-lg transition-all">
            Return to site
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="_subject" value="Join the Team — niassetafsir.org" />
          
          <div>
            <label className="font-english text-xs text-white/45 block mb-1.5">Name</label>
            <input name="name" required type="text" placeholder="Your name"
              className="w-full bg-white/5 border border-white/15 focus:border-gold/40 rounded-lg px-4 py-2.5 font-english text-white text-sm outline-none transition-all placeholder-white/20" />
          </div>

          <div>
            <label className="font-english text-xs text-white/45 block mb-1.5">Email</label>
            <input name="email" required type="email" placeholder="your@email.com"
              className="w-full bg-white/5 border border-white/15 focus:border-gold/40 rounded-lg px-4 py-2.5 font-english text-white text-sm outline-none transition-all placeholder-white/20" />
          </div>

          
          <div>
            <label className="font-english text-xs text-white/45 block mb-1.5">Role</label>
            <select name="role" required
              className="w-full bg-bg border border-white/15 focus:border-gold/40 rounded-lg px-4 py-2.5 font-english text-white text-sm outline-none transition-all">
              <option value="">Select a role...</option>
              <option value="Wolof Transcription">Wolof Transcription</option>
              <option value="Hausa Transcription">Hausa Transcription</option>
              <option value="Hausa Translation">Hausa Translation</option>
            </select>
          </div>
          <div>
            <label className="font-english text-xs text-white/45 block mb-1.5">Background & qualifications</label>
            <textarea name="background" required rows={3} placeholder="Briefly describe your relevant background, languages, and experience..."
              className="w-full bg-white/5 border border-white/15 focus:border-gold/40 rounded-lg px-4 py-2.5 font-english text-white text-sm outline-none transition-all resize-none placeholder-white/20" />
          </div>

          <div>
            <label className="font-english text-xs text-white/45 block mb-1.5">Additional notes</label>
            <textarea name="message" required rows={5} placeholder="Any other information you would like to share..."
              className="w-full bg-white/5 border border-white/15 focus:border-gold/40 rounded-lg px-4 py-2.5 font-english text-white text-sm outline-none transition-all resize-none placeholder-white/20" />
          </div>

          <button type="submit" disabled={status === 'loading'}
            className="w-full font-english text-sm text-bg bg-gold hover:bg-gold-light py-3 rounded-xl font-semibold transition-all disabled:opacity-50">
            {status === 'loading' ? 'Sending...' : 'Submit'}
          </button>

          {status === 'error' && (
            <p className="font-english text-red-400/70 text-xs text-center">Something went wrong. Please email us directly at niassetafsirproject@gmail.com</p>
          )}
        </form>
      )}
    </main>
  );
}
