import App from "../../src/App";

function buildInitialPathname(slug) {
  if (!slug || slug.length === 0) {
    return "/";
  }

  return `/${slug.join("/")}`;
}

export default async function CatchAllPage({ params }) {
  const resolvedParams = await params;
  const initialPathname = buildInitialPathname(resolvedParams?.slug);

  return <App initialPathname={initialPathname} />;
}
