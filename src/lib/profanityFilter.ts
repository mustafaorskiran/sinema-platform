const PROFANITY_LIST = [
  'orospu','piç','ibne','yarrak','amcık','sürtük','kahpe','gerizekalı',
  'götveren','amk','amına','bok','sik','göt','oç',
]

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase().replace(/[\s\-_]/g, '')
  return PROFANITY_LIST.some(word => lower.includes(word))
}
