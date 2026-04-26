import { redirect } from "next/navigation"

export default function DonasiProgramPage({
  params,
}: {
  params: { slug: string }
}) {
  redirect(`/donate?program=${params.slug}`)
}
