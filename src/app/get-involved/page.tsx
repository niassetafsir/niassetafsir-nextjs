'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * One form.
 *
 * There were five pages here: a hub, and four forms at 81, 81, 86 and 96 lines.
 * The line counts were the tell -- the same form with a different heading, a
 * different Formspree endpoint, and on two of them one extra field. Someone who
 * wanted to say something first had to decide which of four doors their thought
 * belonged behind, and on a phone that meant a menu, a page load and a scroll
 * before reaching a text box.
 *
 * The four inboxes survive. Each topic still posts to its own Formspree
 * endpoint, so nothing changes about how messages arrive or sort; only the
 * number of pages does. The four old URLs redirect here with ?about= set, so
 * existing links land on the right topic with the right fields showing.
 */

type Topic = 'feedback' | 'suggestion' | 'error' | 'join';

const TOPICS: {
  id: Topic; label: string; hint: string; endpoint: string; subject: string;
  blurb: string; messageLabel: string; messagePlaceholder: string;
}[] = [
  {
    id: 'feedback', label: 'Feedback', hint: 'How the edition reads',
    endpoint: 'https://formspree.io/f/mgoradan', subject: 'Feedback — niassetafsir.org',
    blurb: 'Thoughts on the experience, or a general impression.',
    messageLabel: 'Your feedback', messagePlaceholder: 'Share your thoughts…',
  },
  {
    id: 'suggestion', label: 'A suggestion', hint: 'Something the project could do',
    endpoint: 'https://formspree.io/f/mvzdklkv', subject: 'Suggestions — niassetafsir.org',
    blurb: 'Ideas for features, content, or directions the project could take.',
    messageLabel: 'Your suggestion', messagePlaceholder: 'Describe your idea…',
  },
  {
    id: 'error', label: 'An error', hint: 'Something is wrong in the text',
    endpoint: 'https://formspree.io/f/mwvalyla', subject: 'Report an Error — niassetafsir.org',
    blurb: 'An error in the Arabic, a problem with a translation, or a fault on the site.',
    messageLabel: 'What is wrong',
    messagePlaceholder: 'What you see on the site, and what the correct text should be…',
  },
  {
    id: 'join', label: 'Joining the team', hint: 'Wolof and Hausa work',
    endpoint: 'https://formspree.io/f/mnjlpwpy', subject: 'Join the Team — niassetafsir.org',
    blurb: 'We are building the Wolof transcription and Hausa translation of Shaykh Ibrāhīm Niasse’s tafsīr.',
    messageLabel: 'Anything else', messagePlaceholder: 'Anything else you would like to tell us…',
  },
];

const field =
  'w-full bg-white/5 border border-white/15 focus:border-gold/40 rounded-lg px-4 py-3 ' +
  'font-english text-white text-base outline-none transition-all placeholder-white/25';

export default function GetInvolvedPage() {
  const [topic, setTopic] = useState<Topic>('feedback');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // ?about= comes from the four redirects. Client-only: the server has no query
  // string during static generation, and reading it in render would be a
  // hydration mismatch.
  useEffect(() => {
    const a = new URLSearchParams(window.location.search).get('about');
    if (a && TOPICS.some(t => t.id === a)) setTopic(a as Topic);
  }, []);

  const t = TOPICS.find(x => x.id === topic)!;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch(t.endpoint, {
        method: 'POST', body: data, headers: { Accept: 'application/json' },
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <main className="max-w-xl mx-auto px-5 py-16" dir="ltr">
        <div className="border border-gold/25 rounded-xl p-8 text-center bg-gold/5">
          <div className="text-2xl mb-3">✓</div>
          <p className="font-english text-white/80 text-base font-medium mb-1">Thank you</p>
          <p className="font-english text-white/40 text-sm">Your message has been received.</p>
          <Link href="/" className="inline-block mt-6 font-english text-sm text-gold/70 hover:text-gold border border-gold/20 hover:border-gold/40 px-5 py-2.5 rounded-lg transition-all">
            Return to the site
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-5 py-10 sm:py-16" dir="ltr">
      <h1 className="font-english text-white text-2xl sm:text-3xl font-semibold mb-2">Get in touch</h1>
      <p className="font-english text-white/50 text-base mb-7">{t.blurb}</p>

      {/* One tap to choose the topic. Full-width targets stacked on a phone, two
          across from 480px -- not a dropdown, which would hide three of the four
          reasons someone might be here. */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-2 mb-8" role="radiogroup" aria-label="What is this about?">
        {TOPICS.map(x => {
          const on = x.id === topic;
          return (
            <button key={x.id} type="button" role="radio" aria-checked={on}
              onClick={() => setTopic(x.id)}
              className="text-left rounded-xl px-4 py-3 transition-all border"
              style={{
                borderColor: on ? 'var(--gold, #C9A84C)' : 'rgba(255,255,255,0.15)',
                background: on ? 'rgba(201,168,76,0.12)' : 'transparent',
              }}>
              <span className="font-english block text-[15px] font-semibold"
                style={{ color: on ? 'var(--gold, #C9A84C)' : 'rgba(255,255,255,0.85)' }}>{x.label}</span>
              <span className="font-english block text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{x.hint}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="_subject" value={t.subject} />

        <div>
          <label className="font-english text-xs text-white/45 block mb-1.5" htmlFor="gi-name">Name</label>
          <input id="gi-name" name="name" required type="text" autoComplete="name" placeholder="Your name" className={field} />
        </div>

        <div>
          <label className="font-english text-xs text-white/45 block mb-1.5" htmlFor="gi-email">Email</label>
          <input id="gi-email" name="email" required type="email" inputMode="email" autoComplete="email"
            placeholder="your@email.com" className={field} />
        </div>

        {topic === 'error' && (
          <div>
            <label className="font-english text-xs text-white/45 block mb-1.5" htmlFor="gi-lesson">Lesson or page, if you know it</label>
            <input id="gi-lesson" name="lesson" type="text" placeholder="e.g. Lesson 3, p. 45" className={field} />
          </div>
        )}

        {topic === 'join' && (
          <>
            <div>
              <label className="font-english text-xs text-white/45 block mb-1.5" htmlFor="gi-role">Role</label>
              <select id="gi-role" name="role" required className={field + ' bg-bg'}>
                <option value="">Select a role…</option>
                <option value="Wolof Transcription">Wolof transcription</option>
                <option value="Hausa Transcription">Hausa transcription</option>
                <option value="Hausa Translation">Hausa translation</option>
              </select>
            </div>
            <div>
              <label className="font-english text-xs text-white/45 block mb-1.5" htmlFor="gi-background">Background and languages</label>
              <textarea id="gi-background" name="background" required rows={3}
                placeholder="Your relevant background, languages, and experience…" className={field + ' resize-none'} />
            </div>
          </>
        )}

        <div>
          <label className="font-english text-xs text-white/45 block mb-1.5" htmlFor="gi-message">{t.messageLabel}</label>
          <textarea id="gi-message" name="message" required rows={6}
            placeholder={t.messagePlaceholder} className={field + ' resize-none'} />
        </div>

        <button type="submit" disabled={status === 'loading'}
          className="w-full font-english text-base text-bg bg-gold hover:bg-gold-light py-3.5 rounded-xl font-semibold transition-all disabled:opacity-50">
          {status === 'loading' ? 'Sending…' : 'Send'}
        </button>

        {status === 'error' && (
          <p className="font-english text-red-400/70 text-sm text-center">
            Something went wrong. Please email{' '}
            <a href="mailto:niassetafsirproject@gmail.com" className="underline">niassetafsirproject@gmail.com</a>.
          </p>
        )}
      </form>
    </main>
  );
}
