import { NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

function isAllowedYouTubeUrl(value) {
  try {
    const parsedUrl = new URL(value);
    return (
      (parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:") &&
      ALLOWED_HOSTS.has(parsedUrl.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url");

  if (!videoUrl || !isAllowedYouTubeUrl(videoUrl)) {
    return NextResponse.json({ error: "A valid YouTube URL is required." }, { status: 400 });
  }

  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;

  try {
    const response = await fetch(oembedUrl, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch YouTube metadata." },
        { status: response.status === 404 ? 404 : 502 }
      );
    }

    const payload = await response.json();

    return NextResponse.json(
      {
        title: payload.title ?? null,
        authorName: payload.author_name ?? null,
        authorUrl: payload.author_url ?? null,
        thumbnailUrl: payload.thumbnail_url ?? null,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch YouTube metadata." }, { status: 502 });
  }
}
