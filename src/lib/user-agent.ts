// iPhone and iPad send "Mac OS X" inside their user agent, so match the device
// names rather than the operating system.
const MOBILE_DEVICE = /iPhone|iPad|iPod|Android/i;

/**
 * Whether the request came from a phone or tablet, which is where a map link
 * can be handed to a native app instead of a browser tab.
 */
export function isMobileUserAgent(
  userAgent: string | null | undefined,
): boolean {
  return Boolean(userAgent && MOBILE_DEVICE.test(userAgent));
}
