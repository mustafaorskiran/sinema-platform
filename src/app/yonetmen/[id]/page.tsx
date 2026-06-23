import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function YonetmenPage({ params }: Props) {
  const { id } = await params
  redirect(`/oyuncu/${id}`)
}
