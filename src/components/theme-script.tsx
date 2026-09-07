/**
 * Resolves the theme before first paint so the page never flashes the wrong
 * surface. Dark is the brand default; a stored choice or the OS preference wins.
 */
export function ThemeScript() {
  const script = `
(function () {
  try {
    var stored = localStorage.getItem('titipit-theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.dataset.theme = stored;
      return;
    }
    var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    document.documentElement.dataset.theme = prefersLight ? 'light' : 'dark';
  } catch (error) {
    document.documentElement.dataset.theme = 'dark';
  }
})();
`.trim();

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
