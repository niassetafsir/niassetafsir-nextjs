import { Lesson } from './types';
import { arabicPublished } from './arabicPublished';

export async function getLesson(id: number): Promise<Lesson | null> {
  try {
    const data = await import(`../data/lessons/${String(id).padStart(2, '0')}.json`);
    const lesson = data.default as Lesson;
    if (arabicPublished(id)) return lesson;
    // Arabic withheld (see arabicPublished.ts): every page reads lessons
    // through here, so blanking the fields here keeps it off all of them.
    return { ...lesson, arabicBody: '', arabicText: '', arabicFootnotes: '' } as Lesson;
  } catch {
    return null;
  }
}

export async function getAllLessons(): Promise<Lesson[]> {
  const lessons: Lesson[] = [];
  for (let i = 1; i <= 56; i++) {
    const lesson = await getLesson(i);
    if (lesson) lessons.push(lesson);
  }
  return lessons;
}
