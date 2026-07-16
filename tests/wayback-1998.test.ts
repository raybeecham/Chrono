import assert from "node:assert/strict";
import test from "node:test";

const moduleUrl = new URL("../lib/wayback-1998.ts", import.meta.url);
const { archiveStartingPoints, create1998ArchiveUrl } = (await import(
  moduleUrl.href
)) as typeof import("../lib/wayback-1998");

test("archive starting points use HTTPS Wayback links", () => {
  assert.equal(archiveStartingPoints.length, 4);
  archiveStartingPoints.forEach((entry) => {
    assert.match(entry.archiveUrl, /^https:\/\/web\.archive\.org\/web\//);
  });
});

test("archive search accepts hostnames and web URLs", () => {
  assert.equal(
    create1998ArchiveUrl("nasa.gov"),
    "https://web.archive.org/web/1998/http://nasa.gov/",
  );
  assert.equal(
    create1998ArchiveUrl("https://example.com/path"),
    "https://web.archive.org/web/1998/https://example.com/path",
  );
});

test("archive search rejects non-web protocols and invalid input", () => {
  assert.equal(create1998ArchiveUrl("javascript:alert(1)"), null);
  assert.equal(create1998ArchiveUrl("   "), null);
});
