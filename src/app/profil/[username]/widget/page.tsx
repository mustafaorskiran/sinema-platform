import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ username: string }>
}

export default async function WidgetRedirect({ params }: Props) {
  const { username } = await params
  redirect(`/profil/${username}/embed`)
}
