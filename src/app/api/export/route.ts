import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        const str = Array.isArray(val) ? val.join(';') : String(val)
        return `"${str.replace(/"/g, '""')}"`
      }).join(',')
    ),
  ]
  return lines.join('\n')
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli.' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'watchlist'

  let csv = ''
  let filename = 'export.csv'

  if (type === 'watchlist') {
    const { data } = await supabase.from('watchlist').select('media_id,media_type,status,created_at').eq('user_id', user.id).order('created_at', { ascending: false })
    csv = toCSV(data ?? [])
    filename = 'izleme-listesi.csv'
  } else if (type === 'reviews') {
    const { data } = await supabase.from('reviews').select('media_id,media_type,rating,content,has_spoiler,tags,created_at').eq('user_id', user.id).order('created_at', { ascending: false })
    csv = toCSV(data ?? [])
    filename = 'yorumlar.csv'
  } else if (type === 'diary') {
    const { data } = await supabase.from('diary_entries').select('media_id,media_type,watched_at,rating,note,is_rewatch,tags,created_at').eq('user_id', user.id).order('watched_at', { ascending: false })
    csv = toCSV(data ?? [])
    filename = 'gunluk.csv'
  } else if (type === 'collection') {
    const { data } = await supabase.from('collection').select('media_id,media_type,format,added_at').eq('user_id', user.id).order('added_at', { ascending: false })
    csv = toCSV(data ?? [])
    filename = 'koleksiyon.csv'
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
