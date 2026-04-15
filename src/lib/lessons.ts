import { Lesson } from './types';

export async function getLesson(id: number): Promise<Lesson | null> {
  try {
    const data = await import(`../data/lessons/${String(id).padStart(2, '0')}.json`);
    return data.default as Lesson;
  } catch {
    return null;
  }
}

export async function getAllLessons(): Promise<Lesson[]> {
  const lessons: Lesson[] = [];
  for (let i = 1; i <= 30; i++) {
    const lesson = await getLesson(i);
    if (lesson) lessons.push(lesson);
  }
  return lessons;
}
