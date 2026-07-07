// PostgREST'in .or()/.ilike() filtre string'lerine gömülen kullanıcı girdisi,
// virgül/nokta/parantez ile filtre sözdizimini değiştirebilir (filter injection).
// Bu karakterleri temizleyerek girdiyi düz metin aramasına indirger.
export function sanitizeSearchInput(q: string): string {
  return q.replace(/[,.()%_]/g, ' ').trim()
}
