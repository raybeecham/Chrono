export type ArchiveStartingPoint = {
  id: string;
  site: string;
  originalUrl: string;
  archiveUrl: string;
  captureLabel: string;
  description: string;
};

export const archiveStartingPoints: readonly ArchiveStartingPoint[] = [
  {
    id: "yahoo",
    site: "Yahoo!",
    originalUrl: "http://www.yahoo.com/",
    archiveUrl:
      "https://web.archive.org/web/19980210175524/http://www.yahoo.com:80/",
    captureLabel: "Verified capture · February 10, 1998",
    description:
      "Compare Chrono’s directory reconstruction with a surviving Yahoo! homepage capture.",
  },
  {
    id: "nasa",
    site: "NASA",
    originalUrl: "http://www.nasa.gov/",
    archiveUrl: "https://web.archive.org/web/1998/http://www.nasa.gov/",
    captureLabel: "Browse available 1998 captures",
    description:
      "Explore NASA’s archived web presence from the year of the STS-88 mission.",
  },
  {
    id: "apple",
    site: "Apple",
    originalUrl: "http://www.apple.com/",
    archiveUrl: "https://web.archive.org/web/1998/http://www.apple.com/",
    captureLabel: "Browse available 1998 captures",
    description:
      "See Apple’s web pages during the early iMac era, subject to archive availability.",
  },
  {
    id: "cnn",
    site: "CNN",
    originalUrl: "http://www.cnn.com/",
    archiveUrl: "https://web.archive.org/web/1998/http://www.cnn.com/",
    captureLabel: "Browse available 1998 captures",
    description:
      "Open archived news pages and compare their dense portal layout with modern news sites.",
  },
] as const;

export function create1998ArchiveUrl(rawUrl: string): string | null {
  const candidate = rawUrl.trim();
  if (!candidate) return null;

  try {
    const url = new URL(
      /^https?:\/\//i.test(candidate) ? candidate : `http://${candidate}`,
    );
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return `https://web.archive.org/web/1998/${url.toString()}`;
  } catch {
    return null;
  }
}
