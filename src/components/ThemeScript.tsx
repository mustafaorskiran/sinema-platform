// Sayfa yüklenmeden önce tema sınıfını uygular — flash of wrong theme önler
export default function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('theme');
        if (!theme) {
          theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        }
        document.documentElement.classList.add(theme);
      } catch(e) {
        document.documentElement.classList.add('dark');
      }
    })();
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
