import { redirect } from "next/navigation"

/**
 * Legacy `/donasi/[slug]` route. Mirrors the rationale on the parent
 * `/donasi/page.tsx`: kept (NOT deleted) so old shareable URLs like
 * `/donasi/beasiswa-pendidikan` keep working. Forwards the slug as a
 * query param to the canonical `/donate` flow.
 */
export default function DonasiProgramPage({
  params,
}: {
  params: { slug: string }
}) {
  redirect(`/donate?program=${params.slug}`)
}
