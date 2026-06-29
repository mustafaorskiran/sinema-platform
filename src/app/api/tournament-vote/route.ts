import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tournamentId, matchIndex, roundNumber, filmId } = await req.json()

  await supabase.from('tournament_votes')
    .delete()
    .eq('tournament_id', tournamentId)
    .eq('match_index', matchIndex)
    .eq('round_number', roundNumber)
    .eq('user_id', user.id)

  await supabase.from('tournament_votes').insert({
    tournament_id: tournamentId,
    match_index: matchIndex,
    round_number: roundNumber,
    film_id: filmId,
    user_id: user.id,
  })

  return NextResponse.json({ ok: true })
}
