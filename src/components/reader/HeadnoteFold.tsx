'use client';
import { useEffect, useState } from 'react';

/**
 * The translator's headnote, folded once read. Open on a reader's first visit
 * to a lesson, closed on later visits; either way one tap opens or closes it,
 * and the choice is remembered per lesson.
 */
export default function HeadnoteFold({ lessonId, topics, body, author }: {
  lessonId: number; topics: string[]; body: string[]; author: string;
}) {
  const key = `headnote-open-${lessonId}`;
  const [open, setOpen] = useState(true);
  useEffect(() => {
    try {
      const v = localStorage.getItem(key);
      if (v === null) { localStorage.setItem(key, '0'); if (window.innerWidth < 1024) setOpen(false); } // seen once: fold next time; folded at first on a phone
      else setOpen(v === '1');
    } catch { /* storage unavailable */ }
  }, [key]);
  return (
    <details className="bp-headnote" open={open} onToggle={e => {
      const v = (e.currentTarget as HTMLDetailsElement).open;
      setOpen(v);
      try { localStorage.setItem(key, v ? '1' : '0'); } catch { /* ignore */ }
    }}>
      <summary>HEADNOTE <i>· by the translator</i></summary>
      <p className="bp-topics"><b>KEY TOPICS</b>{topics.join(' · ')}</p>
      {body.map((p, i) => <p key={i}>{p}</p>)}
      <p className="bp-sig">{author}</p>
    </details>
  );
}
