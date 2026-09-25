import { NextRequest, NextResponse } from 'next/server';
import citationStatus from '@/data/verseCitationStatus.json';

/**
 * A reader's suggestion about one Qur'anic citation.
 *
 * Readers SUGGEST; the editor DECIDES. Nothing that arrives here reaches the
 * text: it becomes an issue on the repository, which the editor accepts or
 * rejects by hand, and an accepted one is applied by the usual repair pass and
 * committed citing the issue number. That is the point of routing this to
 * issues rather than to a database -- an edition's emendations need provenance,
 * and an issue is already a numbered, timestamped, permanent record with the
 * discussion attached.
 *
 * WHAT STOPS JUNK
 *
 * The citation key is checked against src/data/verseCitationStatus.json before
 * anything is written. A submission must name one of the 8,571 spans the
 * edition actually marks, in the right lesson, paragraph and position. A bot
 * posting arbitrary bodies at this endpoint gets 400 without a request ever
 * reaching GitHub; to get through it would have to read the apparatus first.
 * That is a far better gate than a CAPTCHA, because it is the same key the
 * whole apparatus is built on, and it cannot drift: if a span stops being
 * marked, submissions about it stop being accepted.
 *
 * Beyond that: a honeypot field that a human never fills, hard length caps,
 * and a required evidence field -- a suggestion with no warrant is not a
 * suggestion the editor can act on, and saying so in the form is honest rather
 * than obstructive.
 *
 * WHAT IS NOT DONE HERE
 *
 * No IP rate limit. A serverless function has no shared memory between
 * instances, so a counter kept here would be per-instance and would read as a
 * protection it is not. GitHub's own abuse limits apply to the token, and the
 * key check above is what actually bounds this. If the endpoint is ever
 * flooded, a real store belongs in front of it -- said here rather than
 * implied by a comment claiming a limit that does not hold.
 *
 * CONFIGURATION
 *
 * GITHUB_TOKEN  a fine-grained personal access token with Issues: write on
 *               this repository and nothing else.
 * GITHUB_REPO   "owner/name". Defaults to the edition's own repository.
 *
 * Without the token the route answers 503 and the form falls back to email, so
 * the feature degrades to something that still works rather than to a dead
 * button.
 */

const REPO = process.env.GITHUB_REPO || 'niassetafsir/niassetafsir-nextjs';
const TOKEN = process.env.GITHUB_TOKEN;

const LIMITS = { reading: 500, evidence: 2000, name: 100 };

type StatusMap = Record<string, Record<string, Record<string, string>>>;

function knownCitation(cite: string): string | null {
  const m = /^(\d{1,2}):(\d{1,4}):(\d{1,4})$/.exec(cite);
  if (!m) return null;
  const [, lesson, para, span] = m;
  return (citationStatus as StatusMap)[lesson]?.[para]?.[span] ?? null;
}

// Reader text is quoted into an issue body the editor reads. Fencing it keeps
// submitted markdown from dressing itself as the form's own structure -- a
// suggestion that prints "### Accepted by the editor" should look like what it
// is, which is something a stranger typed.
function fence(s: string): string {
  return '```\n' + s.replace(/```/g, "'''").trim() + '\n```';
}

// Whether this deployment can record a suggestion at all. The form asks before
// the reader types, so that a site without a token offers email as its ORDINARY
// path rather than as an apology after someone has written a paragraph.
//
// This has to be its own route and not a probe POST: the POST validates the
// citation key first and would answer 400 to an empty body, which a probe would
// read as "configured".
export async function GET() {
  return NextResponse.json({ configured: Boolean(TOKEN) });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Expected JSON.' }, { status: 400 });
  }

  const str = (k: string) => (typeof body[k] === 'string' ? (body[k] as string).trim() : '');
  const cite = str('cite');
  const verse = str('verse');
  const reading = str('reading');
  const evidence = str('evidence');
  const name = str('name');

  // Honeypot: labelled and positioned for a bot, hidden from a person.
  if (str('website')) return NextResponse.json({ ok: true }, { status: 202 });

  const status = knownCitation(cite);
  if (!status) {
    return NextResponse.json(
      { error: 'That citation is not one this edition marks.' },
      { status: 400 },
    );
  }
  if (!reading && !evidence) {
    return NextResponse.json(
      { error: 'Say what it should read, or what is wrong with it.' },
      { status: 400 },
    );
  }
  if (!evidence) {
    return NextResponse.json(
      { error: 'Please give the evidence for the reading.' },
      { status: 400 },
    );
  }
  for (const [field, cap] of Object.entries(LIMITS)) {
    const value = field === 'reading' ? reading : field === 'evidence' ? evidence : name;
    if (value.length > cap) {
      return NextResponse.json(
        { error: `The ${field} field is limited to ${cap} characters.` },
        { status: 400 },
      );
    }
  }

  if (!TOKEN) {
    return NextResponse.json(
      { error: 'Suggestions are not configured on this deployment yet.' },
      { status: 503 },
    );
  }

  const [lesson, para, span] = cite.split(':');
  const title = `Reading: Lesson ${lesson}${verse ? `, Q ${verse}` : ''} (${cite})`;
  const lines = [
    `**Citation** \`${cite}\` — lesson ${lesson}, paragraph ${para}, span ${span}`,
    verse ? `**Āya** Q ${verse}` : '**Āya** not identified by the matcher',
    `**Current state** \`${status}\``,
    '',
    '**Suggested reading**',
    reading ? fence(reading) : '_none given_',
    '',
    '**Evidence**',
    fence(evidence),
    '',
    `**From** ${name ? fence(name) : '_anonymous_'}`,
    '',
    '---',
    '_Submitted through the reading-feedback form. Untrusted reader input:',
    'nothing here has been applied to the text._',
  ];

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, body: lines.join('\n'), labels: ['reading'] }),
    });
    if (!res.ok) {
      // The upstream text can carry the token's scope back to the client, so it
      // is logged for the editor and never returned.
      console.error('suggest: GitHub responded', res.status, await res.text());
      return NextResponse.json({ error: 'Could not record the suggestion.' }, { status: 502 });
    }
    const issue = (await res.json()) as { number?: number };
    return NextResponse.json({ ok: true, number: issue.number ?? null });
  } catch (err) {
    console.error('suggest: request failed', err);
    return NextResponse.json({ error: 'Could not record the suggestion.' }, { status: 502 });
  }
}
