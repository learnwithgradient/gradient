import App from "../../src/App";
import { getPageTitleLabel } from "../../src/engine/pageTitles";

function buildInitialPathname(slug) {
  if (!slug || slug.length === 0) {
    return "/";
  }

  return `/${slug.join("/")}`;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const initialPathname = buildInitialPathname(resolvedParams?.slug);

  return {
    title: getPageTitleLabel(initialPathname),
  };
}

export default async function CatchAllPage({ params }) {
  const resolvedParams = await params;
  const initialPathname = buildInitialPathname(resolvedParams?.slug);

  return <App initialPathname={initialPathname} />;
}
