import { getLesson, getAllLessons } from '@/lib/lessons';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const lessons = await getAllLessons();
  return lessons.map(l => ({ id: String(l.id) }));
}

export default async function PrintPage({ params }: { params: { id: string } }) {
  const lesson = await getLesson(Number(params.id));
  if (!lesson) return notFound();

  const volStr = lesson.volume
    ? `Vol. ${lesson.volume}${lesson.pageInVolume ? `, p. ${lesson.pageInVolume}` : ''}`
    : '';

  const body = (lesson as any).arabicBody || lesson.arabicText;
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const citationAr = `Ibrāhīm Niasse, Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm, comp. Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī, 10 vols. (n.p., n.d.)${volStr ? ', ' + volStr : ''}, ${lesson.englishTitle} (${lesson.verseRange}). Digital ed., ed. Amadu Kunateh. niassetafsir.org. Accessed ${today}.`;

  return (
    <html>
      <head>
        <title>{lesson.englishTitle} — Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</title>
        <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'EB Garamond', Georgia, serif; font-size: 12pt; line-height: 1.8; color: #111; background: white; padding: 2.5cm; max-width: 21cm; margin: 0 auto; }
          .work-title { text-align: center; font-size: 10pt; color: #666; margin-bottom: 0.3cm; letter-spacing: 0.03em; }
          .lesson-title-ar { text-align: center; font-family: 'Amiri', serif; font-size: 18pt; color: #7B5C14; direction: rtl; margin-bottom: 0.2cm; }
          .lesson-title-en { text-align: center; font-size: 11pt; color: #444; margin-bottom: 0.1cm; }
          .vol-ref { text-align: center; font-size: 9pt; color: #888; margin-bottom: 0.6cm; }
          hr { border: none; border-top: 1px solid #C9A84C; margin: 0.5cm 0; opacity: 0.4; }
          .bilingual { display: grid; grid-template-columns: 1fr 1fr; gap: 1cm; margin-top: 0.5cm; }
          .col-ar { direction: rtl; font-family: 'Amiri', serif; font-size: 13pt; line-height: 2; text-align: justify; }
          .col-en { font-size: 11pt; line-height: 1.9; }
          .col-ar p, .col-en p { margin-bottom: 0.4cm; }
          .fn-link { color: #7B5C14; text-decoration: none; font-size: 8pt; vertical-align: super; }
          sup { font-size: 8pt; vertical-align: super; }
          .no-en { color: #aaa; font-style: italic; font-size: 10pt; }
          .citation-block { margin-top: 1cm; padding-top: 0.5cm; border-top: 1px solid #ddd; font-size: 9pt; color: #555; }
          .citation-label { font-weight: bold; margin-bottom: 0.2cm; color: #7B5C14; }
          .print-btn { position: fixed; bottom: 20px; right: 20px; background: #7B5C14; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-family: 'EB Garamond', serif; font-size: 13px; cursor: pointer; z-index: 100; }
          @media print { .print-btn { display: none; } body { padding: 2cm; } }
        `}</style>
      </head>
      <body>
        <script dangerouslySetInnerHTML={{__html: "document.addEventListener('DOMContentLoaded',function(){var b=document.createElement('button');b.className='print-btn';b.textContent='⬇ Print / Save PDF';b.onclick=function(){window.print()};document.body.appendChild(b);})"}} />

        <div className="work-title">Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm · فِي رِيَاضِ تَفْسِيرِ الْقُرْآنِ الْكَرِيمِ</div>
        <div className="lesson-title-ar">{lesson.arabicTitle}</div>
        <div className="lesson-title-en">{lesson.englishTitle}</div>
        <div className="vol-ref">{lesson.verseRange}{volStr ? ` · Arabic compiled edition, ${volStr}` : ''}</div>
        <hr />

        <div className="bilingual">
          <div className="col-ar" dangerouslySetInnerHTML={{ __html: body.split('\n').filter((l: string) => l.trim()).map((p: string) => `<p>${p}</p>`).join('') }} />
          <div className="col-en">
            {lesson.hasEnglish && lesson.englishText ? (
              <div dangerouslySetInnerHTML={{ __html: lesson.englishText }} />
            ) : (
              <p className="no-en">English translation forthcoming. Full bilingual print edition in preparation — Amadu Kunateh.</p>
            )}
          </div>
        </div>

        <div className="citation-block">
          <div className="citation-label">Cite this lesson:</div>
          <div>{citationAr}</div>
        </div>
      </body>
    </html>
  );
}
