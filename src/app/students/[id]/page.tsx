import WorkPage, { generateMetadata } from '@/app/beyond/[id]/page';
import { workSummaries } from '@/lib/corpus';

// A student's commentary: the same page as one of his works, under /students.
export function generateStaticParams() {
  return workSummaries()
    .filter(r => r.uses > 0 && r.work.relation === 'student')
    .map(r => ({ id: r.work.id }));
}

export { generateMetadata };

export default function StudentWorkPage({ params }: { params: { id: string } }) {
  return <WorkPage params={params} student />;
}
