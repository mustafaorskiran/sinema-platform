interface Props {
  title: string
  year?: string | number
}

export default function AffiliateLinks({ title, year }: Props) {
  const q = encodeURIComponent(`${title}${year ? ` ${year}` : ''}`)
  const links = [
    {
      label: '🛒 Amazon',
      href: `https://www.amazon.com.tr/s?k=${q}`,
      title: "Amazon'da ara",
    },
    {
      label: '🎬 MUBI',
      href: `https://mubi.com/tr/search?query=${q}`,
      title: "MUBI'de ara",
    },
    {
      label: '🎟 Biletix',
      href: `https://www.biletix.com/arama?searchTerm=${q}`,
      title: "Biletix'te ara",
    },
  ]

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {links.map(link => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={link.title}
          className="text-xs px-3 py-1.5 rounded-full bg-[--bg-card] border border-[--border] text-[--text-secondary] hover:text-white hover:border-[--accent]/40 transition-colors"
        >
          {link.label}
        </a>
      ))}
    </div>
  )
}
