import { NextRequest, NextResponse } from 'next/server';
import { searchArabic } from '@/lib/arabicSearch';

// GET /api/search?q=... -- Shaykh Ibrāhīm's Arabic commentary, searched on the
// server. Returns at most 50 short passages; see src/lib/arabicSearch.ts.
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').slice(0, 120);
  if (!/[؀-ۿ]/.test(q)) return NextResponse.json({ total: 0, hits: [] });
  const result = await searchArabic(q);
  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
  });
}
