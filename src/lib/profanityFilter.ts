// Türkçe ve yaygın İngilizce küfürler — yalnızca açık küfürler, değil argo
const PROFANITY_LIST = [
  // Türkçe
  'amk', 'orospu', 'siktir', 'oç', 'göt', 'piç', 'bok', 'yarrak', 'sik',
  'puşt', 'ibne', 'kahpe', 's1ktir', 'amına', 'bok',
  // İngilizce
  'fuck', 'shit', 'bitch', 'cunt', 'asshole', 'bastard', 'damn',
]

// Normalize: remove diacritics, lowercase, normalize leet-speak
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ıiİI]/g, 'i')
    .replace(/[şŞ]/g, 's')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/\*/g, '')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
}

export function containsProfanity(text: string): boolean {
  const normalized = normalize(text)
  return PROFANITY_LIST.some(word => {
    const nw = normalize(word)
    // Word boundary check with regex
    const re = new RegExp(`\\b${nw}\\b`, 'i')
    return re.test(normalized) || normalized.includes(nw)
  })
}
