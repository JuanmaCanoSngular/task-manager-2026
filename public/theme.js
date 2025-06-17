(function () {
  const theme = localStorage.getItem('theme-storage');
  const isDark = theme
    ? JSON.parse(theme).state.isDark
    : window.matchMedia('(prefers-color-scheme: dark)').matches;

  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
})();
