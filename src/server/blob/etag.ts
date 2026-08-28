/**
 * Blobs large enough to be compressed on the way down (roughly 1KB and up)
 * arrive with a weak ETag, W/"hash". A conditional put only matches the strong
 * form, so the marker has to go before the ETag is reused.
 */
export function toStrongEtag(etag: string): string {
  return etag.replace(/^W\//, "");
}
