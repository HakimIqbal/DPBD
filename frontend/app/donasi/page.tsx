import { redirect } from "next/navigation"

/**
 * Legacy `/donasi` route. Kept as a redirect (NOT deleted) because
 * external links — donor receipts, social media posts, partner sites,
 * older email campaigns — still point at the Indonesian-language path.
 * The canonical donate flow lives at `/donate`.
 *
 * Companion route `[slug]/page.tsx` redirects deep links like
 * `/donasi/beasiswa-pendidikan` to `/donate?program=beasiswa-pendidikan`.
 *
 * Safe to remove only after verifying no inbound traffic on /donasi for
 * an extended window (check analytics referrer reports first).
 */
export default function DonasiPage() {
  redirect("/donate")
}
