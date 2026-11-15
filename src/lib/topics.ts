import raw from '@/data/topics.json';

export interface TopicPassage {
  title: string;
  volume: number;
  page: string;
  lesson: number;
  verse: [number, number];
  ar: string;
  en: string;
  note?: string;
}

export interface Topic {
  slug: string;
  term: string;
  termAr: string;
  title: string;
  question: string;
  answer: string;
  points: [string, string][];
  passages: TopicPassage[];
  related: string[];
  /** English drafted and not yet reviewed by the translator. */
  draft?: boolean;
}

export const TOPICS = (raw as unknown as { topics: Topic[] }).topics;

export function getTopic(slug: string): Topic | undefined {
  return TOPICS.find(t => t.slug === slug);
}
