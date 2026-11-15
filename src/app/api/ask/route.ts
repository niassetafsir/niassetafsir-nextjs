import { NextRequest, NextResponse } from 'next/server';
import { askTafsir, allow } from '@/lib/askTafsir';

// GET /api/ask?q=... -> Ask the Tafsīr, in his words (src/lib/askTafsir.ts).
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim();
  if (!q) return NextResponse.json({ error: 'empty' }, { status: 400 });
  const visitor = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.ip || 'anon';
  if (!allow(visitor)) {
    return NextResponse.json({ available: true, limited: true, none: false, quotes: [] }, { status: 429 });
  }
  const answer = await askTafsir(q);
  return NextResponse.json(answer, { headers: { 'cache-control': 'private, max-age=600' } });
}
