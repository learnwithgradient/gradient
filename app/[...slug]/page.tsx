import { SECTION_SLUGS, findLessonBySlugs } from "@/src/engine/lessonRouting";
import PageNotFound from "@/src/views/PageNotFound";

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const decoded = slug.map((s) => decodeURIComponent(s));

  // Single segment matching a known section → coming soon
  if (decoded.length === 1 && SECTION_SLUGS.has(decoded[0])) {
    return <PageNotFound isComingSoon={true} />;
  }

  // Three segments matching a known lesson → coming soon
  if (decoded.length === 3) {
    const lesson = findLessonBySlugs(decoded[0], decoded[1], decoded[2]);
    if (lesson) return <PageNotFound isComingSoon={true} />;
  }

  return <PageNotFound isComingSoon={false} />;
}
